/**
 * config.js
 * Manages persistent configuration saved to data/config.json.
 * Currently stores the TikTok username used to connect to the live stream.
 */

import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname   = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '..', 'data', 'config.json');

/** @type {{ tiktokUsername: string | null }} */
let config = {
  tiktokUsername: null,
};

// ---------------------------------------------------------------------------
// Load / Save
// ---------------------------------------------------------------------------

/** Loads config from disk. Creates default config if file doesn't exist. */
export function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
      config = { ...config, ...JSON.parse(raw) };
    } else {
      saveConfig(); // write defaults
    }
  } catch {
    // Corrupted file — reset to defaults
    config = { tiktokUsername: null };
    saveConfig();
  }
}

/** Saves current config to disk. */
function saveConfig() {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// ---------------------------------------------------------------------------
// Getters / Setters
// ---------------------------------------------------------------------------

/** Returns the saved TikTok username, or null if not set. */
export function getTiktokUsername() {
  return config.tiktokUsername;
}

/**
 * Updates and persists the TikTok username.
 * @param {string} username
 */
export function setTiktokUsername(username) {
  config.tiktokUsername = username.trim().replace(/^@/, ''); // strip leading @
  saveConfig();
}
