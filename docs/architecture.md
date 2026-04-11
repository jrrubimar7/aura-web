# Arquitectura de AURA ∞.Ω

Documentación del estado real del repositorio. Refleja lo que existe, no un ideal.

---

## Visión general

AURA es una PWA estática de una sola página. No tiene backend, servidor ni build system.
El runtime completo vive en un único archivo HTML monolítico (`index.html`, ~618 KB).

```
┌─────────────────────────────────────────────────────────────┐
│  Navegador del usuario                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  index.html — Runtime AURA                          │   │
│  │                                                     │   │
│  │  CSS inline ──► UI (chat, topbar, composer, orb)    │   │
│  │  JS inline  ──► Estado S + 33 bloques <script>      │   │
│  └────────────────────┬────────────────────────────────┘   │
│                       │ fetch() directo a APIs externas     │
│  ┌────────────────────▼────────────────────────────────┐   │
│  │  APIs externas (CORS)                               │   │
│  │  · Groq API           (LLM principal)               │   │
│  │  · Anthropic Claude   (LLM alternativo)             │   │
│  │  · Google Gemini      (LLM alternativo + visión)    │   │
│  │  · OpenRouter         (multi-modelo)                │   │
│  │  · Together AI        (LLM alternativo)             │   │
│  │  · GitHub API         (ghDeployFile, rollback)      │   │
│  │  · CoinGecko          (datos crypto opcionales)     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Service Worker (sw.js) — intercepta fetch:                 │
│  · HTML → siempre red (network-first, no-store)             │
│  · Estáticos → cache-first (iconos, manifest)               │
│  · APIs externas → bypass (nunca cacheadas)                 │
│                                                             │
│  localStorage — persistencia local:                         │
│  · API keys del usuario                                     │
│  · Memoria conversacional comprimida                        │
│  · Preferencias, bookmarks, proyectos                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Bloques internos del monolito

El monolito está organizado en bloques `<script id="...">` ejecutados secuencialmente:

```
index.html
│
├── [línea 12]    HEAD inline — BUILD="IndexASv5.5.4-r5-functional", VERSION
├── [línea 13]    mammoth.js CDN — parser de .docx
├── [línea 15]    <style> — CSS completo (~700 líneas, tokens + layout + componentes)
│
├── [línea 713]   showKeyStatus() / closeKeyStatus() — panel de configuración de APIs
├── [línea 852]   Android bridge — detección y stubs para app Android nativa
├── [línea 895]   Plugin system — has()/call() para extensiones
├── [línea 934]   SW registration — registro del Service Worker
├── [línea 959]   Bridge diagnostics — log de capacidades Android en arranque
│
├── [línea 995]   aura-boot-stubs-v1
│                 Instala stubs temporales en window para:
│                 addMsg, toast, createChannelContent, listChannelContent,
│                 jfHealthCheckNow, openDrawer, closeDrawer, send, startVoice
│
├── [línea 1104]  Splash + envbar check — oculta splash a los 3s
├── [línea 1148]  Typewriter effect — animación de arranque en consola
│
├── [línea 1305]  ── BLOQUE PRINCIPAL (sin id, ~7000 líneas) ──
│   ├── listChannelContent() / loadProjects() / saveProject()
│   ├── Estado S — objeto global con todo el estado de la sesión
│   ├── loadFieldMemory() / saveFieldMemory() — memoria de campo NMP
│   ├── detectTrajectory() / registerLivingTension() — tensiones vivas
│   ├── Proveedores API: callClaude(), callGemini(), callGroq(), callOpenRouter()
│   ├── Sistema de agentes: CHANNEL_AGENTS, updateAgentTabs(), spawnAgent()
│   ├── NMP integration: readNMPState(), applyNMPToVoice()
│   ├── Semantic engine: SEM_TAGS, APATS, EPATS, classifyIntent()
│   ├── GitHub: fetchCommitHistory(), fetchSourceFromGitHub(), ghDeployFile()
│   │           ghDeploy() ← DESACTIVADA (lanza error)
│   ├── Markdown renderer: auraFormatText()
│   ├── Storage management: compressMemory(), selfCheckStorage()
│   └── Comandos: handleCmd() — procesa todos los /comandos
│
├── [línea 8125]  onNativeClip() / onNativeSTT() / deliverTranscript()
│                 Callbacks del bridge Android nativo
│
├── [línea 8514]  NMP + buildSystemPrompt activos — log de arranque build 6
│
├── [línea 8582]  AURA_SELF — objeto de introspección del sistema
│                 Estado de runtime: keys activas, modo, build, uptime
│
├── [línea 8685]  wireUI() — conecta botones del DOM a funciones del runtime
│
├── [línea 8745]  init() — función de arranque principal
│                 Llama a wireUI(), carga memoria, inicia schedulers
│
├── [línea 10011] aura-core-v2
│                 Estrategias de verificación, executores de acción,
│                 niveles de agency, AURA_ACTIONS API
│
├── [línea 10860] aura-pro-v7-mini
│                 Extensión PRO: presets de patch, reset de props
│
├── [línea 10917] aura-force-enter-v1
│                 Patch de teclado: Enter envía, Shift+Enter = nueva línea
│
├── [línea 11002] aura-runtime-v1-meaning-engine-v1
│                 Clasificación de intención, detección de temas,
│                 extracción de contexto semántico del mensaje
│
├── [línea 11273] aura-memory-v1
│                 Extracción de perfil de usuario, preferencias,
│                 proyectos, memoria semántica
│
├── [línea 11681] aura-voice-companion-v2
│                 Companion de voz: respuestas proactivas,
│                 modulación por estado NMP
│
├── [línea 11991] aura-presence-v2-relational-layer
│                 Capa relacional: presencia, vínculo, continuidad
│
├── [línea 12306] aura-agency-nonagency-v1
│                 Sistema de agencia explícita vs. no-agencia:
│                 cuándo actuar, cuándo no actuar
│
├── [línea 12658] aura-cognitive-v1
│                 Capa cognitiva: tensiones vivas, paradojas,
│                 trayectorias de pensamiento
│
├── [línea 13074] aura-self-evolution-v1
│                 Propuesta de evolución del sistema (proposeEvolution)
│                 ghDeploy() desactivada — solo propone, no despliega
│
├── [línea 13624] aura-orchestration-v1
│                 Orquestación de múltiples agentes, inter-agencia
│
├── [línea 13914] aura-sovereignty-v4
│                 Soberanía de estado: qué puede y no puede cambiar
│                 en runtime
│
├── [línea 14113] aura-pipeline-v12
│                 Pipeline principal: window.send(), gestión de stream,
│                 selección de proveedor, manejo de errores
│
├── [línea 14474] aura-state-sovereignty-v10
│                 Control de estado global, prevención de corrupción
│
├── [línea 14657] aura-kernel-freeze-v12
│                 Congela funciones críticas contra sobreescritura
│                 accidental en bloques posteriores
│
├── [línea 14877] aura-legacy-quarantine-v13
│                 Código legacy aislado, sin acceso al estado principal
│
└── [línea 14914] aura-final-certification-v14
                  Auto-verificación del runtime al finalizar la carga
```

---

## Archivos satélite

### `nmp.html` — Non-linear Meaning Processor

Motor de campo no-lineal independiente. No importa nada de `index.html`.

```
nmp.html
├── Canvas 2D — visualización del campo de tensión/profundidad
├── Motor físico: field {t, d, vt, vd} + ghost {t, d}
│   · t = tensión (0–1)
│   · d = profundidad (0–1)
│   · vt, vd = velocidades
├── Attractors — puntos de atracción del campo
├── Interpret — generador de interpretantes semánticos
└── Expone: window.field, window.ghost (leídos por voice-lab via iframe)
```

### `voice-lab/index.html` — Sandbox de voz

```
voice-lab/index.html
├── SpeechSynthesis Web API
├── iframe oculto → ../nmp.html (misma origin)
├── Lee window.field / window.ghost del iframe cada 1.2s
└── Modula rate y pitch de TTS según estado NMP
```

### `sw.js` — Service Worker

```
sw.js
├── Cache: 'aura-static-v3' (manual — no vinculada al BUILD de index.html)
├── INSTALL: precachea icon-192.png, icon-512.png, manifest.json
├── ACTIVATE: elimina caches de versiones anteriores
├── FETCH strategy:
│   · HTML / navigate → network-first, sin cache (siempre fresco)
│   · APIs externas → bypass total (nunca interceptadas)
│   · Estáticos (.css, .js, .png, .json, etc.) → cache-first
│   · Resto → network directo
└── MESSAGES: SKIP_WAITING, CLEAR_CACHES
```

---

## Flujo de un mensaje en AURA

```
Usuario escribe → [Enter / botón Enviar]
        │
        ▼
window.send()          [aura-pipeline-v12]
        │
        ├── classifyIntent(text)     [meaning-engine]
        ├── buildSystemPrompt()      [bloque principal]
        ├── selectProvider()         [S.providers, S.pIdx]
        │
        ▼
fetch() → API externa (Groq / Claude / Gemini / OpenRouter)
        │
        ▼
stream reader → addMsg('aura', chunk)
        │
        ├── auraFormatText()         [markdown render]
        ├── applyNMPToVoice()        [si voz activa]
        └── saveMem()                [comprime y persiste]
```

---

## Deuda técnica conocida

| Ítem | Severidad | Nota |
|---|---|---|
| `main.js` desconectado | Baja | Prototipo antiguo. Sin impacto en runtime. |
| `styles.css` desconectado | Baja | CSS antiguo. Sin impacto en runtime. |
| Cache SW sin vincular a BUILD | Baja | `aura-static-v3` hardcodeado. El SW se re-registra al cambiar BUILD gracias al parámetro `?v=BUILD` en la URL. |
| ~60 `console.log` en producción | Mínima | Útiles para debug, sin riesgo de seguridad. |
| `jfToken` hardcodeado en `S` | Informativa | Token de bridge local (127.0.0.1:8765), no un secreto de producción. |
| Historial git sin convencion | Informativa | Commits sin formato convencional, dificulta trazabilidad. |
| Sin CI/CD | Informativa | Deploy manual via push a `main`. |
