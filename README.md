# 🎮 GD Queue Tool for TikTok Live

<div align="center">

**Jump to your language / Ir a tu idioma:**

[![English](https://img.shields.io/badge/🇺🇸_English-Read_in_English-blue?style=for-the-badge)](#-english-documentation)
[![Español](https://img.shields.io/badge/🇦🇷_Español-Leer_en_Español-green?style=for-the-badge)](#-documentación-en-español)

</div>

---

# 🇺🇸 English Documentation

<div align="center">

[![Requirements](https://img.shields.io/badge/📋-Requirements-informational?style=flat-square)](#-requirements)
[![Installation](https://img.shields.io/badge/🚀-Installation-informational?style=flat-square)](#-installation)
[![Configuration](https://img.shields.io/badge/⚙️-Configuration-informational?style=flat-square)](#️-configuration)
[![Start](https://img.shields.io/badge/▶️-How_to_Start-informational?style=flat-square)](#️-how-to-start)
[![Chat Commands](https://img.shields.io/badge/💬-Chat_Commands-informational?style=flat-square)](#-chat-commands-for-viewers)
[![Streamer Commands](https://img.shields.io/badge/🖥️-Streamer_Commands-informational?style=flat-square)](#️-streamer-commands-terminal)
[![Data Files](https://img.shields.io/badge/📁-Data_Files-informational?style=flat-square)](#-data-files)
[![Troubleshooting](https://img.shields.io/badge/🔧-Troubleshooting-informational?style=flat-square)](#-troubleshooting)

</div>

A command-line tool (CLI) to manage a **Geometry Dash** level request queue during **TikTok Live** streams.

Viewers type `!request <ID>` in the chat and the level is automatically added to the queue with info fetched from the GD API.

---

## 📋 Requirements

- **Node.js** v18 or higher → [download here](https://nodejs.org)
- An active **TikTok** account currently live streaming

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## 📥 Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## 🚀 Installation

```bash
npm install
```

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## ⚙️ Configuration

1. Copy the example file and rename it:

```bash
copy .env.example .env
```

2. Open the `.env` file and replace the username:

```env
TIKTOK_USERNAME=your_tiktok_username
```

> ⚠️ **Important:** Do not include the `@` symbol. Just the username.

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## ▶️ How to Start

```bash
npm start
```

The tool will connect to your live stream chat and start listening for requests.

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## 💬 Chat Commands (for viewers)

| Command              | Description                                        |
|----------------------|----------------------------------------------------|
| `!request <levelID>` | Request a GD level by its ID (6–10 digits)         |

**Example:** `!request 12345678`

### Queue Rules
- Each viewer can only make **one request per session**.
- The same level cannot be requested twice.
- If the queue is closed, requests are not added.

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## 🖥️ Streamer Commands (terminal)

| Command              | Description                                          |
|----------------------|------------------------------------------------------|
| `!current`           | Shows the level currently being played               |
| `!list`              | Shows all levels in the queue                        |
| `!skip`              | Skips the current level and moves to the next        |
| `!done`              | Marks the current level as completed                 |
| `!remove <levelId>`  | Removes a specific level from the queue              |
| `!open`              | Opens the queue (accepts new requests)               |
| `!close`             | Closes the queue (no new requests accepted)          |
| `!clear`             | Clears the entire queue (asks for confirmation)      |
| `!help`              | Shows all available commands                         |

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## 📁 Data Files

Data is automatically saved in the `data/` folder:

| File                 | Description                                          |
|----------------------|------------------------------------------------------|
| `data/queue.json`    | Current queue of pending levels                      |
| `data/history.json`  | History of completed, skipped levels and more        |

> These files are created automatically on first launch.
> They are saved on every change, so if you close the program, the queue is preserved.

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---

## 🔧 Troubleshooting

**Won't connect to TikTok:**
- Make sure you are currently live streaming.
- Check that the username in `.env` is correct.

**GD API not responding:**
- The level is still added to the queue with info listed as "Unknown".
- Use `!list` to see what's in the queue.

**Program won't start:**
- Make sure you ran `npm install` first.
- Check your Node.js version: `node --version` (must be v18+)

[🔝 Back to top](#-gd-queue-tool-for-tiktok-live)

---
---

# 🇦🇷 Documentación en Español

<div align="center">

[![Requisitos](https://img.shields.io/badge/📋-Requisitos-informational?style=flat-square)](#-requisitos)
[![Instalación](https://img.shields.io/badge/🚀-Instalación-informational?style=flat-square)](#-instalación)
[![Configuración](https://img.shields.io/badge/⚙️-Configuración-informational?style=flat-square)](#️-configuración)
[![Iniciar](https://img.shields.io/badge/▶️-Cómo_Iniciar-informational?style=flat-square)](#️-cómo-iniciar)
[![Comandos Chat](https://img.shields.io/badge/💬-Comandos_Chat-informational?style=flat-square)](#-comandos-del-chat-para-espectadores)
[![Comandos Streamer](https://img.shields.io/badge/🖥️-Comandos_Streamer-informational?style=flat-square)](#️-comandos-del-streamer-terminal)
[![Archivos](https://img.shields.io/badge/📁-Archivos_de_Datos-informational?style=flat-square)](#-archivos-de-datos-1)
[![Problemas](https://img.shields.io/badge/🔧-Solución_de_Problemas-informational?style=flat-square)](#-solución-de-problemas)

</div>

Herramienta de línea de comandos (CLI) para gestionar una cola de peticiones de niveles de **Geometry Dash** durante transmisiones en vivo de **TikTok**.

Los espectadores escriben `!request <ID>` en el chat y el nivel se añade automáticamente a la cola con información obtenida desde la API de GD.

---

## 📋 Requisitos

- **Node.js** v18 o superior → [descargar aquí](https://nodejs.org)
- Una cuenta de **TikTok** activa y en transmisión en vivo

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## 📥 Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/nombre-del-repo.git
cd nombre-del-repo
```

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## 🚀 Instalación

```bash
npm install
```

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## ⚙️ Configuración

1. Copia el archivo de ejemplo y renómbralo:

```bash
copy .env.example .env
```

2. Abre el archivo `.env` y reemplaza el nombre de usuario:

```env
TIKTOK_USERNAME=tu_usuario_de_tiktok
```

> ⚠️ **Importante:** No incluyas el símbolo `@`. Solo el nombre de usuario.

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## ▶️ Cómo iniciar

```bash
npm start
```

La herramienta se conectará al chat de tu transmisión en vivo y comenzará a escuchar peticiones.

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## 💬 Comandos del chat (para espectadores)

| Comando              | Descripción                                      |
|----------------------|--------------------------------------------------|
| `!request <levelID>` | Solicita un nivel de GD por su ID (6–10 dígitos) |

**Ejemplo:** `!request 12345678`

### Reglas de la cola
- Cada espectador solo puede hacer **una petición por sesión**.
- No se puede pedir el mismo nivel dos veces.
- Si la cola está cerrada, las peticiones no se añaden.

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## 🖥️ Comandos del streamer (terminal)

| Comando              | Descripción                                         |
|----------------------|-----------------------------------------------------|
| `!current`           | Muestra el nivel que se está jugando actualmente    |
| `!list`              | Muestra todos los niveles en la cola                |
| `!skip`              | Salta el nivel actual y avanza al siguiente         |
| `!done`              | Marca el nivel actual como completado               |
| `!remove <levelId>`  | Elimina un nivel específico de la cola              |
| `!open`              | Abre la cola (acepta nuevas peticiones)             |
| `!close`             | Cierra la cola (no acepta nuevas peticiones)        |
| `!clear`             | Limpia toda la cola (pide confirmación)             |
| `!help`              | Muestra todos los comandos disponibles              |

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## 📁 Archivos de datos

Los datos se guardan automáticamente en la carpeta `data/`:

| Archivo              | Descripción                                         |
|----------------------|-----------------------------------------------------|
| `data/queue.json`    | Cola actual de niveles pendientes                   |
| `data/history.json`  | Historial de niveles completados, saltados y más    |

> Estos archivos se crean automáticamente al iniciar el programa por primera vez.
> Se guardan con cada cambio, así que si cierras el programa, la cola se mantiene.

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

## 🔧 Solución de problemas

**No se conecta a TikTok:**
- Verifica que estés en transmisión en vivo.
- Verifica que el nombre de usuario en `.env` sea correcto.

**La API de GD no responde:**
- El nivel se añade igualmente a la cola con información como "Desconocido".
- Puedes usar `!list` para ver qué está en la cola.

**El programa no inicia:**
- Asegúrate de haber ejecutado `npm install` primero.
- Verifica que tienes Node.js v18+: `node --version`

[🔝 Volver arriba](#-gd-queue-tool-for-tiktok-live)

---

<div align="center">

Proyecto privado para uso en streams. Hecho con ❤️ para la comunidad de GD en TikTok.

</div>
