# CLAUDE.md — Guía operativa para iteraciones con Claude

Este archivo describe cómo trabajar con este repositorio en sesiones de Claude Code.
Actualizar cuando cambie la arquitectura, el flujo de deploy o las restricciones operativas.

---

## Contexto del proyecto

AURA es un agente conversacional autónomo desplegado como PWA estática. No hay backend propio ni build system. Todo el runtime vive en `index.html`. El proyecto se despliega directamente desde la rama `main` a GitHub Pages.

**Repo:** `jrrubimar7/aura-web`
**Rama de producción:** `main`
**Build actual:** `IndexASv5.5.4-r5-functional` (línea 12 de `index.html`)

---

## Reglas de trabajo

### Nunca tocar sin instrucción explícita

- **`index.html`** — el monolito crítico. Cualquier edición puede romper el runtime.
- **`sw.js`** — la estrategia de cache está diseñada para evitar HTML cacheado y limpiar versiones viejas. No cambiar sin entender el flujo completo.
- **`manifest.json`** — afecta PWAs ya instaladas en dispositivos de usuarios.
- Las funciones de voz (`VoiceManager`, `speak`, `toggleMic`, bloques `aura-voice-*`).
- Las funciones de auto-evolución (`ghDeployFile`, `proposeEvolution`, bloque `aura-self-evolution-v1`).

### Siempre hacer antes de cambiar `index.html`

1. Leer las líneas afectadas con `Read` (no asumir el contexto).
2. Verificar si el cambio afecta a algún bloque `<script id="aura-*">`.
3. Actualizar la cadena `BUILD` en línea 12 si el cambio es funcional.
4. Commit descriptivo con el número de build y qué cambió.

### Archivos seguros de editar

- `README.md`, `CLAUDE.md`, `docs/` — documentación pura.
- `main.js`, `styles.css` — archivos legacy sin conexión al runtime actual.
- `.gitignore` — sin impacto en runtime.

---

## Estructura del monolito (`index.html`)

El archivo contiene ~15 000 líneas organizadas en bloques `<script id="...">`:

| Bloque | Línea aprox. | Función |
|---|---|---|
| `(head scripts)` | 12–957 | BUILD, mammoth.js CDN, stubs de boot |
| `aura-boot-stubs-v1` | ~995 | Stubs de inicialización hasta que el runtime esté listo |
| `(inline scripts)` | ~1104–1305 | Splash screen, envbar, typewriter |
| `(main state + logic)` | ~1305–8125 | Estado `S`, agentes, proveedores API, NMP, deploy |
| `AURA_SELF` | ~8582 | Objeto de introspección del sistema |
| `aura-core-v2` | ~10011 | Núcleo de interacción y verificación |
| `aura-pro-v7-mini` | ~10860 | Extensión PRO |
| `aura-force-enter-v1` | ~10917 | Patch de teclado (Enter para enviar) |
| `aura-runtime-v1-meaning-engine-v1` | ~11002 | Motor semántico / clasificación de intención |
| `aura-memory-v1` | ~11273 | Sistema de memoria y extracción de perfil |
| `aura-voice-companion-v2` | ~11681 | Companion de voz y presencia |
| `aura-presence-v2-relational-layer` | ~11991 | Capa relacional |
| `aura-agency-nonagency-v1` | ~12306 | Sistema de agencia / no-agencia |
| `aura-cognitive-v1` | ~12658 | Capa cognitiva |
| `aura-self-evolution-v1` | ~13074 | Auto-evolución (desactivada en runtime estable) |
| `aura-orchestration-v1` | ~13624 | Orquestación de agentes |
| `aura-sovereignty-v4` | ~13914 | Soberanía de estado |
| `aura-pipeline-v12` | ~14113 | Pipeline principal de envío de mensajes |
| `aura-state-sovereignty-v10` | ~14474 | Control de estado global |
| `aura-kernel-freeze-v12` | ~14657 | Freeze de kernel (previene sobreescritura de funciones críticas) |
| `aura-legacy-quarantine-v13` | ~14877 | Cuarentena de código legacy |
| `aura-final-certification-v14` | ~14914 | Certificación final del runtime |

> Los números de línea son aproximados y pueden variar con cada build.

---

## Estado global `S` (objeto principal)

Definido en `index.html` ~línea 1607. Propiedades clave:

```js
S.key          // Groq API key (runtime, también en localStorage 'a_key')
S.claudeKey    // Anthropic API key
S.geminiKey    // Google Gemini API key
S.orKey        // OpenRouter API key
S.ghToken      // GitHub Personal Access Token (para ghDeployFile)
S.ghRepo       // Repo destino del deploy: 'jrrubimar7/aura-infinito'
S.memory       // Array de mensajes del contexto conversacional
S.agent        // Agente activo ('general', 'tecnico', etc.)
S.muted        // TTS silenciado (true por defecto)
S.jfUrl        // URL del bridge local Jellyfish (127.0.0.1:8765)
S.jfToken      // Token del bridge local (valor local, no un secreto de producción)
```

---

## Satélites (archivos independientes)

- **`nmp.html`** — Motor no-lineal. Expone `window.field` y `window.ghost` con valores `t` (tensión), `d` (profundidad), `vt`, `vd`. Se usa como iframe desde `voice-lab/`.
- **`voice-lab/index.html`** — Lee el NMP via iframe cross-origin (misma origin). Controla `SpeechSynthesis` con parámetros de NMP.
- **`aura_sw_killer.html`** — Herramienta de emergencia. No forma parte del flujo de AURA.

---

## Flujo de arranque de AURA

```
1. Navegador carga index.html (siempre desde red, nunca desde cache SW)
2. <head>: BUILD y VERSION disponibles como vars globales
3. mammoth.js cargado desde CDN (para .docx)
4. aura-boot-stubs-v1: instala stubs en window para funciones que aún no existen
5. Splash screen visible mientras cargan los bloques siguientes
6. Estado S inicializado (~línea 1607)
7. Bloques script ejecutados en orden descendente
8. aura-pipeline-v12: registra el handler window.send()
9. aura-kernel-freeze-v12: congela funciones críticas (Object.freeze parcial)
10. aura-final-certification-v14: auto-verificación del runtime
11. Splash oculto (~3s tras load)
12. Service Worker registrado en background
```

---

## Comandos disponibles en AURA

`/mem` `/limpiar` `/guardar` `/sintetiza` `/perfil` `/sem`
`/buscar [q]` `/exportar` `/marcadores`
`/agentes` `/spawn [nombre]` `/inter [q]`
`/hora` `/clima [ciudad]` `/timer [N min]`
`/omega` `/focus` `/evolve` `/deploy` `/rollback [sha]`

---

## Rama de trabajo

- `main` — producción (GitHub Pages)
- `claude/*` — ramas de trabajo de Claude Code (mergear a main tras revisión)

---

## Notas de seguridad

- Las API keys del usuario van a `localStorage`. No hay servidor propio.
- `ghDeployFile()` puede pushear archivos al repo GitHub del usuario via su token. Está activa pero el comando `/deploy` principal tiene `ghDeploy()` desactivada (lanza error).
- No hacer `eval()` con input de usuario. No añadir `innerHTML` con datos no sanitizados.
