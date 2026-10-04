/**
 * terminal.js
 * Interactive terminal command interface for the streamer.
 * Uses readline to read commands while other async work runs.
 */

import readline from 'readline';
import chalk from 'chalk';
import {
  skipCurrent,
  doneCurrent,
  removeRequest,
  clearQueue,
  getQueue,
  getQueueStatus,
  openQueue,
  closeQueue,
  isOpen,
} from './queue.js';

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

/** Prints a separator line */
function sep() {
  console.log(chalk.gray('─'.repeat(50)));
}

/**
 * Prints info about the current level in a styled cyan box.
 * @param {import('./queue.js').QueueItem|null} item
 */
function printCurrent(item) {
  if (!item) {
    console.log(chalk.yellow('\n  [COLA] La cola está vacía.\n'));
    return;
  }
  const stars = item.stars > 0 ? `⭐ ${item.stars}` : '⭐ N/A';
  console.log(
    chalk.cyan('\n╔══════════════════════════════════════════╗\n') +
    chalk.cyan('║  🎮 ') + chalk.bold.cyan('NIVEL ACTUAL') + chalk.cyan('                            ║\n') +
    chalk.cyan('║') +
    `  ${chalk.bold.white(item.levelName.slice(0, 40).padEnd(40))}` + chalk.cyan('║\n') +
    chalk.cyan('║') +
    `  🆔 ID: ${chalk.white(item.levelId.padEnd(33))}` + chalk.cyan('║\n') +
    chalk.cyan('║') +
    `  👤 Creador: ${chalk.yellow(item.levelCreator.slice(0, 29).padEnd(29))}` + chalk.cyan('║\n') +
    chalk.cyan('║') +
    `  🎯 Dificultad: ${chalk.magenta(item.difficulty.padEnd(25))}` + chalk.cyan('║\n') +
    chalk.cyan('║') +
    `  ${stars.padEnd(42)}` + chalk.cyan('║\n') +
    chalk.cyan('║') +
    `  📨 Pedido por: ${chalk.bold.white('@' + item.requestedBy).padEnd(39)}` + chalk.cyan('║\n') +
    chalk.cyan('╚══════════════════════════════════════════╝\n')
  );
}

/**
 * Prints the full queue as a numbered list.
 * @param {import('./queue.js').QueueItem[]} items
 */
function printQueue(items) {
  if (items.length === 0) {
    console.log(chalk.yellow('\n  [COLA] La cola está vacía.\n'));
    return;
  }
  sep();
  console.log(chalk.bold.white(`  📋 COLA DE NIVELES (${items.length} total)`));
  sep();
  items.forEach((item, i) => {
    const prefix = i === 0 ? chalk.cyan('▶') : chalk.gray(`${i + 1}.`);
    const stars  = item.stars > 0 ? chalk.yellow(`⭐${item.stars}`) : chalk.gray('⭐?');
    console.log(
      `  ${prefix} ${chalk.bold.white(item.levelName)} ${chalk.gray(`(${item.levelId})`)} ` +
      `${chalk.magenta(item.difficulty)} ${stars} ` +
      chalk.gray(`— @${item.requestedBy}`)
    );
  });
  sep();
  console.log('');
}

/** Prints all available terminal commands. */
function printHelp() {
  sep();
  console.log(chalk.bold.white('  📖 COMANDOS DISPONIBLES'));
  sep();
  const cmd = (c, d) =>
    console.log(`  ${chalk.bold.green(c.padEnd(22))} ${chalk.gray(d)}`);
  cmd('!current',          'Muestra el nivel actual en la cola');
  cmd('!list',             'Muestra todos los niveles en la cola');
  cmd('!skip',             'Salta el nivel actual y muestra el siguiente');
  cmd('!done',             'Marca el nivel actual como completado');
  cmd('!remove <levelId>', 'Elimina un nivel específico de la cola');
  cmd('!open',             'Abre la cola a nuevas peticiones');
  cmd('!close',            'Cierra la cola a nuevas peticiones');
  cmd('!clear',            'Limpia toda la cola (pide confirmación)');
  cmd('!help',             'Muestra esta ayuda');
  sep();
  console.log('');
}

// ---------------------------------------------------------------------------
// Command handlers
// ---------------------------------------------------------------------------

/** Confirmation flow for !clear — waits for a second readline prompt. */
async function confirmClear(rl) {
  return new Promise((resolve) => {
    rl.question(
      chalk.red.bold('  ⚠ ¿Seguro que quieres limpiar toda la cola? (sí/no): '),
      (answer) => {
        resolve(answer.trim().toLowerCase() === 'sí' || answer.trim().toLowerCase() === 'si');
      }
    );
  });
}

/**
 * Processes a single terminal command string.
 * @param {string} input - Raw input from stdin
 * @param {readline.Interface} rl
 */
async function handleCommand(input, rl) {
  const trimmed = input.trim();
  if (!trimmed) return;

  // Split into command + args
  const [cmd, ...args] = trimmed.split(/\s+/);

  switch (cmd.toLowerCase()) {

    // --- !current ---
    case '!current': {
      const { current } = getQueueStatus();
      printCurrent(current);
      break;
    }

    // --- !list ---
    case '!list': {
      printQueue(getQueue());
      break;
    }

    // --- !skip ---
    case '!skip': {
      const skipped = skipCurrent();
      if (!skipped) {
        console.log(chalk.yellow('\n  [COLA] No hay nada que saltar — la cola está vacía.\n'));
      } else {
        console.log(chalk.yellow(`\n  [SKIP] ⏭ Se saltó: ${chalk.bold(skipped.levelName)} (ID ${skipped.levelId})\n`));
        const { current } = getQueueStatus();
        if (current) {
          console.log(chalk.blue('  Siguiente nivel:'));
          printCurrent(current);
        } else {
          console.log(chalk.yellow('  La cola está vacía ahora.\n'));
        }
      }
      break;
    }

    // --- !done ---
    case '!done': {
      const done = doneCurrent();
      if (!done) {
        console.log(chalk.yellow('\n  [COLA] No hay nada que completar — la cola está vacía.\n'));
      } else {
        console.log(chalk.blue(`\n  [DONE] ✅ Completado: ${chalk.bold(done.levelName)} (ID ${done.levelId})\n`));
        const { current } = getQueueStatus();
        if (current) {
          console.log(chalk.blue('  Siguiente nivel:'));
          printCurrent(current);
        } else {
          console.log(chalk.yellow('  La cola está vacía ahora.\n'));
        }
      }
      break;
    }

    // --- !remove <levelId> ---
    case '!remove': {
      const levelId = args[0];
      if (!levelId) {
        console.log(chalk.red('\n  [ERROR] Uso: !remove <levelId>\n'));
        break;
      }
      const removed = removeRequest(levelId);
      if (!removed) {
        console.log(chalk.red(`\n  [ERROR] Nivel ${levelId} no encontrado en la cola.\n`));
      } else {
        console.log(chalk.yellow(`\n  [REMOVE] 🗑 Eliminado: ${chalk.bold(removed.levelName)} (ID ${removed.levelId})\n`));
      }
      break;
    }

    // --- !open ---
    case '!open': {
      openQueue();
      console.log(chalk.green('\n  [COLA] ✅ Cola ABIERTA — los viewers pueden pedir niveles.\n'));
      break;
    }

    // --- !close ---
    case '!close': {
      closeQueue();
      console.log(chalk.red('\n  [COLA] 🔒 Cola CERRADA — no se aceptan nuevas peticiones.\n'));
      break;
    }

    // --- !clear ---
    case '!clear': {
      const { total } = getQueueStatus();
      if (total === 0) {
        console.log(chalk.yellow('\n  [COLA] La cola ya está vacía.\n'));
        break;
      }
      const confirmed = await confirmClear(rl);
      if (confirmed) {
        clearQueue();
        console.log(chalk.red('\n  [COLA] 🗑 Cola limpiada.\n'));
      } else {
        console.log(chalk.gray('\n  [COLA] Cancelado.\n'));
      }
      break;
    }

    // --- !help ---
    case '!help': {
      printHelp();
      break;
    }

    default: {
      console.log(chalk.red(`\n  [ERROR] Comando desconocido: ${cmd}. Escribe !help para ver los comandos.\n`));
    }
  }
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Starts the interactive terminal interface.
 * Returns immediately — readline keeps reading in the background.
 */
export function startTerminalInterface() {
  const rl = readline.createInterface({
    input:    process.stdin,
    output:   process.stdout,
    terminal: false, // Don't echo input — we handle display ourselves
    prompt:   '',
  });

  // Print the prompt character after each line
  const printPrompt = () => process.stdout.write(chalk.bold.green('> '));

  rl.on('line', async (line) => {
    await handleCommand(line, rl);
    printPrompt();
  });

  rl.on('close', () => {
    console.log(chalk.gray('\n[TERMINAL] Interfaz cerrada. Hasta luego!\n'));
    process.exit(0);
  });

  // Initial prompt
  printPrompt();
}
