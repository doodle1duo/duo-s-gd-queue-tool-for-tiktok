/**
 * queue.js
 * Manages the level request queue and history with JSON persistence.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------
const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR    = path.join(__dirname, '..', 'data');
const QUEUE_FILE  = path.join(DATA_DIR, 'queue.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// ---------------------------------------------------------------------------
// In-memory state
// ---------------------------------------------------------------------------

/** @type {QueueItem[]} Pending request queue */
let queue = [];

/** @type {QueueItem[]} Completed/skipped history */
let history = [];

/** Tracks usernames that have already requested this session */
const sessionRequesters = new Set();

/** Whether the queue is accepting new requests */
export let isOpen = true;

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/**
 * Reads a JSON file and returns its parsed content.
 * Returns the fallback value if the file does not exist or is malformed.
 * @param {string} filePath
 * @param {*} fallback
 */
function readJSON(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return fallback;
  }
}

/** Writes data to a JSON file, creating the directory if necessary. */
function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/** Persists both queue and history to disk. */
function save() {
  writeJSON(QUEUE_FILE,   queue);
  writeJSON(HISTORY_FILE, history);
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Loads persisted queue and history from disk.
 * Called once at startup by index.js.
 */
export function loadQueue() {
  queue   = readJSON(QUEUE_FILE,   []);
  history = readJSON(HISTORY_FILE, []);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Adds a level request to the queue.
 * @param {string} levelId  - Raw level ID string
 * @param {Object|null} levelInfo - Level info from GD API (null = unknown)
 * @param {string} username - TikTok viewer username
 * @returns {{ success: boolean, message: string }}
 */
export function addRequest(levelId, levelInfo, username) {
  if (!isOpen) {
    return { success: false, message: '❌ La cola está cerrada.' };
  }

  // Prevent duplicate requests from the same user this session
  if (sessionRequesters.has(username.toLowerCase())) {
    return {
      success: false,
      message: `❌ @${username} ya hizo una petición esta sesión.`,
    };
  }

  // Prevent duplicate level IDs in the queue
  const alreadyQueued = queue.some((item) => item.levelId === levelId.toString());
  if (alreadyQueued) {
    return {
      success: false,
      message: `❌ El nivel ${levelId} ya está en la cola.`,
    };
  }

  /** @type {QueueItem} */
  const item = {
    levelId:      levelId.toString(),
    levelName:    levelInfo?.name        ?? 'Desconocido',
    levelCreator: levelInfo?.creator     ?? 'Desconocido',
    difficulty:   levelInfo?.difficulty  ?? 'N/A',
    stars:        levelInfo?.stars       ?? 0,
    requestedBy:  username,
    requestedAt:  new Date().toISOString(),
    status:       'pending',
  };

  queue.push(item);
  sessionRequesters.add(username.toLowerCase());
  save();

  return { success: true, message: `✅ Nivel ${item.levelName} añadido a la cola.` };
}

/**
 * Skips the current (first) level in the queue.
 * Moves it to history with status 'skipped'.
 * @returns {QueueItem|null} The skipped item, or null if queue is empty
 */
export function skipCurrent() {
  if (queue.length === 0) return null;
  const [current] = queue.splice(0, 1);
  current.status = 'skipped';
  history.push(current);
  save();
  return current;
}

/**
 * Marks the current (first) level as done.
 * Moves it to history with status 'done'.
 * @returns {QueueItem|null} The completed item, or null if queue is empty
 */
export function doneCurrent() {
  if (queue.length === 0) return null;
  const [current] = queue.splice(0, 1);
  current.status = 'done';
  history.push(current);
  save();
  return current;
}

/**
 * Removes a specific level from the queue by its ID.
 * @param {string} levelId
 * @returns {QueueItem|null} The removed item, or null if not found
 */
export function removeRequest(levelId) {
  const index = queue.findIndex((item) => item.levelId === levelId.toString());
  if (index === -1) return null;
  const [removed] = queue.splice(index, 1);
  removed.status = 'removed';
  history.push(removed);
  save();
  return removed;
}

/**
 * Clears all pending items from the queue.
 */
export function clearQueue() {
  const cleared = queue.splice(0, queue.length);
  cleared.forEach((item) => {
    item.status = 'cleared';
    history.push(item);
  });
  save();
}

/** Returns a shallow copy of the current queue array. */
export function getQueue() {
  return [...queue];
}

/**
 * Returns a summary of queue status.
 * @returns {{ total: number, current: QueueItem|null }}
 */
export function getQueueStatus() {
  return {
    total:   queue.length,
    current: queue[0] ?? null,
  };
}

/** Opens the queue to new requests. */
export function openQueue() {
  isOpen = true;
}

/** Closes the queue to new requests. */
export function closeQueue() {
  isOpen = false;
}

/**
 * @typedef {Object} QueueItem
 * @property {string} levelId
 * @property {string} levelName
 * @property {string} levelCreator
 * @property {string} difficulty
 * @property {number} stars
 * @property {string} requestedBy
 * @property {string} requestedAt
 * @property {'pending'|'done'|'skipped'|'removed'|'cleared'} status
 */
