/**
 * index.js
 * Entry point for the GD Queue Tool.
 * Bootstraps config, creates data directory, prompts for TikTok username
 * if not set, starts the interactive terminal, and connects to TikTok Live.
 */

import fs       from 'fs';
import path     from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

import { loadConfig, getTiktokUsername, setTiktokUsername } from './config.js';
import { loadQueue, getQueueStatus, isOpen }                from './queue.js';
import { startTikTokListener }                              from './tiktok.js';
import { startTerminalInterface }                           from './terminal.js';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = path.join(__dirname, '..', 'data');

// ---------------------------------------------------------------------------
// ASCII Banner
// ---------------------------------------------------------------------------
function printBanner() {
  console.clear();
  console.log(chalk.bold.yellow(`
  ██████╗ ██████╗      ██████╗ ██╗   ██╗███████╗██╗   ██╗███████╗
  ██╔════╝ ██╔══██╗    ██╔═══██╗██║   ██║██╔════╝██║   ██║██╔════╝
  ██║  ███╗██║  ██║    ██║   ██║██║   ██║█████╗  ██║   ██║█████╗  
  ██║   ██║██║  ██║    ██║▄▄ ██║██║   ██║██╔══╝  ██║   ██║██╔══╝  
  ╚██████╔╝██████╔╝    ╚██████╔╝╚██████╔╝███████╗╚██████╔╝███████╗
   ╚═════╝ ╚═════╝      ╚══▀▀═╝  ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝
  `));
  console.log(chalk.bold.cyan('  🎮  Geometry Dash · Cola de Peticiones para TikTok Live'));
  console.log(chalk.gray('  ─────────────────────────────────────────────────────────\n'));
}

// ---------------------------------------------------------------------------
// Status summary printed after startup
// ---------------------------------------------------------------------------
function printStatus(username) {
  const { total, current } = getQueueStatus();
  const queueState = isOpen
    ? chalk.bold.green('ABIERTA ✅')
    : chalk.bold.red('CERRADA 🔒');

  console.log(chalk.gray('  ─────────────────────────────────────────────────────────'));
  console.log(`  👤 Usuario TikTok: ${chalk.bold.magenta('@' + username)}`);
  console.log(`  📋 Cola cargada con ${chalk.bold.white(total)} nivel(es) pendiente(s)`);
  console.log(`  🚦 Estado de la cola: ${queueState}`);

  if (current) {
    console.log(
      `  ▶  Nivel actual: ${chalk.bold.white(current.levelName)} ` +
      chalk.gray(`(ID ${current.levelId}) — @${current.requestedBy}`)
    );
  }

  console.log(chalk.gray('  ─────────────────────────────────────────────────────────'));
  console.log(chalk.gray('  Escribe !help para ver los comandos disponibles.\n'));
}

// ---------------------------------------------------------------------------
// Username prompt
// ---------------------------------------------------------------------------

/**
 * Asks for the TikTok username in the terminal.
 * Returns the entered username as a string.
 */
function promptUsername() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const ask = () => {
      rl.question(
        chalk.bold.cyan('  👤 Ingresa tu usuario de TikTok') +
        chalk.gray(' (sin @): ') ,
        (answer) => {
          const name = answer.trim().replace(/^@/, '');
          if (!name) {
            console.log(chalk.red('  [ERROR] El nombre no puede estar vacío.\n'));
            ask(); // ask again
          } else {
            rl.close();
            resolve(name);
          }
        }
      );
    };

    ask();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  // Ensure data/ directory exists
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Load persisted config and queue
  loadConfig();
  loadQueue();

  // Print startup UI
  printBanner();

  // Get or ask for TikTok username
  let username = getTiktokUsername();

  if (!username) {
    console.log(chalk.yellow('  ⚠  No hay usuario de TikTok configurado.\n'));
    username = await promptUsername();
    setTiktokUsername(username);
    console.log(chalk.green(`\n  ✅ Usuario guardado: @${username}\n`));
  }

  printStatus(username);

  // Start interactive terminal (non-blocking — uses readline events)
  startTerminalInterface();

  // Start TikTok Live chat listener (async, reconnects on drop)
  await startTikTokListener();
}

main().catch((err) => {
  console.error(chalk.red(`[FATAL] Error inesperado: ${err.message}`));
  process.exit(1);
});
