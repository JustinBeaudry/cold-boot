'use strict';

const chalk = require('chalk');
const os    = require('os');

module.exports = {
  write: write,
  writeError: writeError
};

function write(messages) {
  if (!Array.isArray(messages)) messages = [messages];
  console.info(chalk.bold.cyan(messages.join(os.EOL)));
}

function writeError(messages) {
  if (!Array.isArray(messages)) messages = [messages];
  console.error(chalk.bold.red(messages.join(os.EOL)))
}
