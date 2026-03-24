/**
 * Logger utility
 * Simple console-based logger with timestamps and levels.
 */

const levels = {
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
};

function format(level, message, meta = '') {
  const ts = new Date().toISOString();
  return meta
    ? `[${ts}] [${level}] ${message} | ${JSON.stringify(meta)}`
    : `[${ts}] [${level}] ${message}`;
}

const logger = {
  info(message, meta) {
    console.log(format(levels.info, message, meta));
  },
  warn(message, meta) {
    console.warn(format(levels.warn, message, meta));
  },
  error(message, meta) {
    console.error(format(levels.error, message, meta));
  },
};

module.exports = logger;
