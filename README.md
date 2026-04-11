# AURA ∞.Ω

Sistema de agente conversacional autónomo. Desplegado como PWA estática en GitHub Pages.

**Build actual:** `IndexASv5.5.4-r5-functional`
**Repo de producción:** `jrrubimar7/aura-web`
**URL de producción:** `https://jrrubimar7.github.io/aura-web/`

---

## Archivos del repositorio

```
aura-web/
├── index.html              APP PRINCIPAL — monolito completo (618 KB, ~15 000 líneas)
├── nmp.html                Motor NMP — Non-linear Meaning Processor (~870 líneas)
├── sw.js                   Service Worker — cache de estáticos, network-first para HTML
├── manifest.json           PWA Manifest — metadatos, iconos, orientación
├── icon-192.png            Icono PWA 192×192
├── icon-512.png            Icono PWA 512×512
├── aura_sw_killer.html     Herramienta de debug — desregistra service workers
├── main.js                 LEGACY — no conectado a la app actual (ver nota)
├── styles.css              LEGACY — no conectado a la app actual (ver nota)
├── voice-lab/
│   └── index.html          Voice Lab v0.6 — sandbox experimental de voz
└── docs/
    └── architecture.md     Mapa de arquitectura interna del monolito
```

> **`main.js` y `styles.css`** son archivos de un prototipo anterior. No los carga ningún archivo del proyecto actual. No modificar ni eliminar sin revisar el historial git primero.

---

## Cómo funciona el despliegue

No hay build system. El despliegue es directo:

1. Editar `index.html` (o el archivo correspondiente)
2. Actualizar la cadena `BUILD` en la línea 12 del `<head>` de `index.html`
3. Commit + push a la rama `main`
4. GitHub Pages sirve la rama `main` directamente

El Service Worker cachea solo estáticos (iconos, manifest). El HTML siempre se obtiene de la red (`network-first`).

---

## Proveedores de API

AURA soporta múltiples proveedores de LLM configurados por el usuario en runtime:

| Provider | Clave local en localStorage |
|---|---|
| Groq | `a_key` |
| Google Gemini | `a_geminikey` |
| Anthropic Claude | `a_claudekey` |
| OpenRouter | `a_orkey` |
| Together AI | `a_together_key` |

Las keys **nunca se hardcodean en el código**. Se guardan en `localStorage` del navegador del usuario.

---

## Satélites y herramientas

- **`nmp.html`** — Motor de campo no-lineal. Genera valores de tensión/profundidad/velocidad que modulan la voz de AURA. Se carga como iframe oculto desde `voice-lab/index.html`.
- **`voice-lab/index.html`** — Sandbox de pruebas de voz. Usa `SpeechSynthesis` y lee estado del NMP via iframe. No es parte del flujo principal de `index.html`.
- **`aura_sw_killer.html`** — Herramienta de emergencia para limpiar service workers y caches bloqueados. Abrir en Chrome normal, pulsar el botón.

---

## Lo que NO tocar sin revisión previa

- El contenido de `index.html` salvo la cadena `BUILD` en línea 12
- `sw.js` — la estrategia de cache está diseñada deliberadamente
- `manifest.json` — afecta instalación PWA en dispositivos existentes
- La función `ghDeployFile` en `index.html` — gestiona auto-deploy via GitHub API

Ver `docs/architecture.md` para el mapa interno del monolito.
