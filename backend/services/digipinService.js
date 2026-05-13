/**
 * DIGIPIN Service — Abstraction layer for India Post DIGIPIN geo-addressing.
 *
 * Interface contract: getDigipin(lat, lon) → string
 * This contract must never change, even when swapping implementations.
 *
 * Current implementation: MOCK (deterministic hash from coordinates)
 * Future: replace internals with India Post DIGIPIN API call
 */

const CHARSET = '23456789CFGHJKLMNPQRSTUVWXYZ';

/**
 * Generates a mock DIGIPIN code from lat/lon.
 * Format: XXX-XXX-XXXX (10 chars + 2 dashes)
 * Each ~4m² area maps to a unique code in real DIGIPIN.
 */
function mockDigipin(lat, lon) {
  // Encode lat/lon into a reproducible 10-char code
  const normalizedLat = ((lat + 90) / 180) * 1e7;
  const normalizedLon = ((lon + 180) / 360) * 1e7;

  const combined = Math.floor(normalizedLat) * 1e7 + Math.floor(normalizedLon);
  let n = Math.abs(combined);
  let code = '';
  const base = CHARSET.length;

  for (let i = 0; i < 10; i++) {
    code = CHARSET[n % base] + code;
    n = Math.floor(n / base);
  }

  return `${code.slice(0, 3)}-${code.slice(3, 6)}-${code.slice(6, 10)}`;
}

/**
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<string>} DIGIPIN code
 */
export async function getDigipin(lat, lon) {
  // TODO: replace with real India Post API call:
  // const res = await axios.get(`https://api.indiapost.gov.in/digipin?lat=${lat}&lon=${lon}`);
  // return res.data.digipin;
  return mockDigipin(lat, lon);
}
