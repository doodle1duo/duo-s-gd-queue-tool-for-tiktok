/**
 * index.js
 * Entry point for the GD Queue Tool.
 * Bootstraps dotenv, creates data directory, starts TikTok listener,
 * and starts the interactive terminal interface.
 */

import 'dotenv/config';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

import { loadQueue, getQueueStatus, isOpen } from './queue.js';
import { startTikTokListener }               from './tiktok.js';
import { startTerminalInterface }            from './terminal.js';

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
function printStatus() {
  const { total, current } = getQueueStatus();
  const queueState = isOpen
    ? chalk.bold.green('ABIERTA ✅')
    : chalk.bold.red('CERRADA 🔒');

  console.log(chalk.gray('  ─────────────────────────────────────────────────────────'));
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
// Main
// ---------------------------------------------------------------------------
async function main() {
  // Ensure data/ directory exists
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // Load persisted queue from disk
  loadQueue();

  // Print startup UI
  printBanner();
  printStatus();

  // Start interactive terminal (non-blocking — uses readline events)
  startTerminalInterface();

  // Start TikTok Live chat listener (async, reconnects on drop)
  await startTikTokListener();
}

main().catch((err) => {
  console.error(chalk.red(`[FATAL] Error inesperado: ${err.message}`));
  process.exit(1);
});
