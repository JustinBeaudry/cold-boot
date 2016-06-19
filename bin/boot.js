#!/usr/bin/env node

/*

    Cold Boot

    Order of Operation:
    * prompt user for project name
    * prompt user for git project location
    * determine if project location is local or remote
    * clone remote project
    * squash commit history (if desired)
    * have coldboot remove itself

 */

const program   = require('commander');
const chalk     = require('chalk');
const inquirer  = require('inquirer');
const rimraf    = require('rimraf');
const fs        = require('fs');
const path      = require('path');
const url       = require('url');
const os        = require('os');
const pkg       = require('../package.json');

const isDev = process.env.NODE_ENV === 'dev';

const PROJECT_FILES = [
  'bin',
  'LICENSE',
  'README.md',
  '.editorconfig',
  '.gitignore'
];

program
  .version(pkg.version)
  .option('-g, --git', 'Clean and re-init Git. Defaults to true')
  .option('-n, --npm', 'Rename and clear package.json for new project. Default to true')
  .parse(process.argv);

warm(program.git, program.npm);

/**
 *
 * @param git
 * @param npm
 */
function warm(git, npm) {

  git = git || true;
  npm = npm || true;

  write([
    '',
    `[ColdBoot v${pkg.version}]`,
    ''
  ]);

  inquirer.prompt([
    {
      type: 'input',
      name: 'project_name',
      message: 'What is the name of your project?'
    },
    {
      type: 'input',
      name: 'author_name',
      message: 'What is your name?',
      default: () => {
        let defaultName = '';
        if (config.name) defaultName += config.name;
        if (config.email) defaultName += ' <' + config.email + '>';
        return defaultName;
      }
    },
    {
      type: 'input',
      name: 'git_origin',
      message: 'What is the address of the git project?'
    }
  ]).then((answers) => {
    [doGit, cleanup].forEach((task) => task.call(null, answers));
  });
}

function doGit(opts) {
  
  let git_origin;
  ({git_origin} = opts);

  if (!isDev) {
    rimraf.sync(path.join(process.cwd(), '.git'));
  }

  // do git stuff here
}

function cleanup() {
  if (!isDev) {
    PROJECT_FILES.forEach(function(file) {
      rimraf.sync(path.join(process.cwd(), file));
    });
  }
}

function write(messages) {
  if (!Array.isArray(messages)) messages = [messages];
  console.info(chalk.bold.cyan(messages.join('\n')));
}

function writeError(messages) {
  if (!Array.isArray(messages)) messages = [messages];
  console.error(chalk.bold.red(messages.join('\n')))
}

process.on('uncaughtException', function(err) {
  if (err) {
    writeError(err.stack || err);
    process.exit(1);
  }
})
