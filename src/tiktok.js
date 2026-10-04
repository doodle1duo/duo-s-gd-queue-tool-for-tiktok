/**
 * tiktok.js
 * Connects to TikTok Live chat via tiktok-live-connector and
 * processes !request commands from viewers.
 */

import { WebcastPushConnection } from 'tiktok-live-connector';
import chalk from 'chalk';
import { getLevelInfo } from './gdapi.js';
import { addRequest, isOpen } from './queue.js';

// Regex: matches "!request <levelID>" where levelID is 6–10 digits
const REQUEST_REGEX = /^!request\s+(\d{6,10})\s*$/i;

/**
 * Renders a formatted box for a new level request.
 * @param {import('./queue.js').QueueItem} item
 * @param {string} username
 */
function printNewRequest(item, username) {
  const stars = item.stars > 0 ? `⭐ ${item.stars}` : '⭐ N/A';
  console.log(
    chalk.green('\n┌─────────────────────────────────────────┐\n') +
    chalk.green('│  🎮 ') + chalk.bold.green('NUEVA PETICIÓN') + chalk.green('                          │\n') +
    chalk.green('│') +
    `  ${chalk.bold.white(item.levelName.padEnd(40))}` + chalk.green('│\n') +
    chalk.green('│') +
    `  🆔 ID: ${chalk.cyan(item.levelId.padEnd(33))}` + chalk.green('│\n') +
    chalk.green('│') +
    `  👤 Creador: ${chalk.yellow(item.levelCreator.padEnd(27))}` + chalk.green('│\n') +
    chalk.green('│') +
    `  🎯 Dificultad: ${chalk.magenta(item.difficulty.padEnd(24))}` + chalk.green('│\n') +
    chalk.green('│') +
    `  ${stars.padEnd(42)}` + chalk.green('│\n') +
    chalk.green('│') +
    `  📨 Pedido por: ${chalk.bold.white('@' + username).padEnd(38)}` + chalk.green('│\n') +
    chalk.green('└─────────────────────────────────────────┘\n')
  );
}

/**
 * Handles an incoming chat message, processing !request commands.
 * @param {string} username - TikTok unique ID of the viewer
 * @param {string} comment  - The chat message text
 */
async function handleChatMessage(username, comment) {
  const match = comment.trim().match(REQUEST_REGEX);
  if (!match) return; // Not a !request command

  const levelId = match[1];

  // Quick check before hitting the API
  if (!isOpen) {
    console.log(
      chalk.yellow(`[COLA CERRADA] @${username} intentó pedir nivel ${levelId} — la cola está cerrada.`)
    );
    return;
  }

  console.log(chalk.gray(`[CHAT] @${username} pidió el nivel ${levelId} — consultando API de GD...`));

  let levelInfo = null;

  try {
    levelInfo = await getLevelInfo(levelId);

    if (!levelInfo) {
      console.log(chalk.red(`[GD API] Nivel ${levelId} no encontrado.`));
    }
  } catch (err) {
    if (err.message === 'GD_API_TIMEOUT') {
      console.log(chalk.yellow(`[GD API] ⚠ Tiempo de espera agotado para nivel ${levelId}. Se añadirá con info desconocida.`));
    } else {
      console.log(chalk.red(`[GD API] Error al obtener nivel ${levelId}: ${err.message}`));
    }
    // levelInfo stays null — addRequest handles that gracefully
  }

  const result = addRequest(levelId, levelInfo, username);

  if (result.success) {
    // Re-fetch the added item from queue to get the fully formed object for display
    const displayItem = {
      levelId,
      levelName:    levelInfo?.name       ?? 'Desconocido',
      levelCreator: levelInfo?.creator    ?? 'Desconocido',
      difficulty:   levelInfo?.difficulty ?? 'N/A',
      stars:        levelInfo?.stars      ?? 0,
    };
    printNewRequest(displayItem, username);
  } else {
    console.log(chalk.yellow(`[COLA] ${result.message}`));
  }
}

/**
 * Starts the TikTok Live chat listener.
 * Reads TIKTOK_USERNAME from environment (loaded via dotenv in index.js).
 */
export async function startTikTokListener() {
  const username = process.env.TIKTOK_USERNAME;

  if (!username || username === 'your_tiktok_username') {
    console.log(
      chalk.red.bold('\n[TIKTOK] ⚠ TIKTOK_USERNAME no configurado en el archivo .env') +
      chalk.yellow('\n         Crea un archivo .env basado en .env.example y reinicia.\n')
    );
    return;
  }

  console.log(chalk.magenta(`[TIKTOK] Conectando a la transmisión de @${username}...`));

  const connection = new WebcastPushConnection(username, {
    processInitialData: false,
    fetchRoomInfoOnConnect: true,
    enableWebsocketUpgrade: true,
    requestPollingIntervalMs: 2000,
    // clientParams can be extended with session cookies for private streams
  });

  // --- Event: successful connection ---
  connection.on('streamEnd', () => {
    console.log(chalk.magenta('[TIKTOK] La transmisión ha terminado.'));
  });

  // --- Event: disconnected ---
  connection.on('disconnected', () => {
    console.log(chalk.yellow('[TIKTOK] Desconectado del chat. Reintentando en 15 segundos...'));
    setTimeout(() => startTikTokListener(), 15_000);
  });

  // --- Event: error ---
  connection.on('error', (err) => {
    console.log(chalk.red(`[TIKTOK] Error de conexión: ${err.message ?? err}`));
  });

  // --- Event: chat message ---
  connection.on('chat', (data) => {
    const username = data.uniqueId ?? data.nickname ?? 'unknown';
    const comment  = data.comment  ?? '';
    handleChatMessage(username, comment).catch((err) => {
      console.log(chalk.red(`[TIKTOK] Error procesando mensaje: ${err.message}`));
    });
  });

  // --- Connect ---
  try {
    const state = await connection.connect();
    console.log(
      chalk.magenta.bold(`[TIKTOK] ✅ Conectado a @${username}`) +
      chalk.gray(` | Sala: ${state.roomId ?? 'desconocida'}`)
    );
  } catch (err) {
    console.log(
      chalk.red(`[TIKTOK] ❌ No se pudo conectar: ${err.message}`) +
      chalk.yellow('\n         Verifica que la transmisión esté activa y el usuario sea correcto.\n')
    );
  }
}
