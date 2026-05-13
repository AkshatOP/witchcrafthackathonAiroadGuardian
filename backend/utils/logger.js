import { env } from '../config/env.js';

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = env.nodeEnv === 'production' ? levels.warn : levels.debug;

const fmt = (level, msg, meta) => {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

export const logger = {
  error: (msg, meta) => levels.error <= currentLevel && console.error(fmt('error', msg, meta)),
  warn:  (msg, meta) => levels.warn  <= currentLevel && console.warn(fmt('warn', msg, meta)),
  info:  (msg, meta) => levels.info  <= currentLevel && console.log(fmt('info', msg, meta)),
  debug: (msg, meta) => levels.debug <= currentLevel && console.log(fmt('debug', msg, meta)),
};
