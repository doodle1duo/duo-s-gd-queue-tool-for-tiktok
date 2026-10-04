/**
 * gdapi.js
 * Fetches Geometry Dash level information from the Boomlings API.
 */

import fetch from 'node-fetch';

const GD_API_URL = 'https://www.boomlings.com/database/getGJLevels21.php';

/**
 * Maps GD difficulty values to human-readable strings.
 * Key 9 = difficulty rating, Key 43 = demon type.
 */
const DIFFICULTY_MAP = {
  0:  'N/A',
  10: 'Easy',
  20: 'Normal',
  30: 'Hard',
  40: 'Harder',
  50: 'Insane',
};

const DEMON_TYPE_MAP = {
  0: 'Hard Demon',
  3: 'Easy Demon',
  4: 'Medium Demon',
  5: 'Insane Demon',
  6: 'Extreme Demon',
};

/**
 * Parses the colon-separated key:value string from the GD API.
 * e.g. "1:12345:2:My Level:3:..." => { '1': '12345', '2': 'My Level', ... }
 * @param {string} raw - Raw colon-separated string
 * @returns {Object} Parsed key-value object
 */
function parseGDResponse(raw) {
  const parts = raw.split(':');
  const result = {};
  for (let i = 0; i < parts.length - 1; i += 2) {
    result[parts[i]] = parts[i + 1];
  }
  return result;
}

/**
 * Decodes a Base64-encoded GD description string.
 * GD uses URL-safe Base64 (replaces - with + and _ with /).
 * @param {string} encoded
 * @returns {string}
 */
function decodeDescription(encoded) {
  if (!encoded) return '';
  try {
    // GD uses URL-safe base64
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(normalized, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * Fetches level information from the Boomlings API.
 * @param {string|number} levelId - The GD level ID to look up
 * @returns {Promise<Object|null>} Level info object or null if not found/error
 */
export async function getLevelInfo(levelId) {
  try {
    const body = `secret=Wmfd2893gb7&type=0&str=${levelId}&count=1`;

    const response = await fetch(GD_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      // Timeout after 8 seconds
      signal: AbortSignal.timeout(8000),
    });

    const text = await response.text();

    // API returns '-1' when the level is not found
    if (!text || text.trim() === '-1') {
      return null;
    }

    // The response contains multiple sections separated by '#'
    // Section 0: level data, Section 1: creator data, Section 2: song data
    const sections = text.split('#');
    const levelSection = sections[0];

    // Within the level section, individual levels are separated by '|'
    // We only requested count=1 so there should be just one level
    const levelRaw = levelSection.split('|')[0];
    const data = parseGDResponse(levelRaw);

    // --- Extract fields ---
    const id          = data['1']  || levelId.toString();
    const name        = data['2']  || 'Unknown';
    const descEncoded = data['3']  || '';
    const difficulty  = parseInt(data['9']  || '0', 10);
    const downloads   = parseInt(data['10'] || '0', 10);
    const likes       = parseInt(data['14'] || '0', 10);
    const stars       = parseInt(data['18'] || '0', 10);
    const isDemon     = parseInt(data['17'] || '0', 10) === 1;
    const demonType   = parseInt(data['43'] || '0', 10);

    // Creator info comes from the creator section (index 1), formatted as:
    // playerID:username:accountID
    let creator = 'Unknown';
    if (sections[1]) {
      const creatorParts = sections[1].split(':');
      if (creatorParts.length >= 2) {
        creator = creatorParts[1] || 'Unknown';
      }
    }

    // Resolve difficulty label
    let difficultyLabel;
    if (isDemon) {
      difficultyLabel = DEMON_TYPE_MAP[demonType] ?? 'Hard Demon';
    } else {
      difficultyLabel = DIFFICULTY_MAP[difficulty] ?? 'N/A';
    }

    return {
      id,
      name,
      description: decodeDescription(descEncoded),
      creator,
      difficulty: difficultyLabel,
      stars,
      downloads,
      likes,
    };
  } catch (err) {
    // Surface the error type so callers can decide what to log
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('GD_API_TIMEOUT');
    }
    throw new Error(`GD_API_ERROR: ${err.message}`);
  }
}
