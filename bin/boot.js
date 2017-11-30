#!/usr/bin/env node
'use strict';

/*

    Cold Boot

    Order of Operation:
    * prompt user for project name
    * prompt user for git project location
    * determine if project location is local or remote
    * clone remote project
    * squash commit history (if desired)

 */

const program   = require('commander');
const inquirer  = require('inquirer');
const path      = require('path');
const pkg       = require('../package.json');
const npm       = require('../lib/npm');

const git       = require('../lib/git');
const utils     = require('../lib/utils');

program
  .version(pkg.version)
  .parse(process.argv);

warm();

/**
 *
 */
function warm() {

  utils.write([
    '',
    `[ColdBoot v${pkg.version}]`,
    ''
  ]);

  inquirer.prompt([
    {
      type: 'input',
      name: 'project_name',
      message: 'What is the name of your project?',
      default: () => {
        return path.basename(process.cwd());
      }
    },
    {
      type: 'input',
      name: 'author_name',
      message: 'What is your name?',
      default: () => {
        return git.config().then((config) => {
          return config.getString('user.name');
        });
      }
    },
    {
      type: 'input',
      name: 'git_origin',
      message: 'What is the address of the git project?',
      filter: git.format,
      validate: input => {
        return git.validate(input).then(() => {
          return true;
        }, () => {
          return false;
        });
      }
    },
    {
      type: 'input',
      name: 'git_clone_dest',
      message: 'Project destination:',
      default: process.cwd()
    },
    {
      type: 'confirm',
      name: 'git_clean_history',
      default: true,
      message: 'Start with a clean git history?'
    },
    {
      type: 'confirm',
      name: 'git_initial_commit',
      default: true,
      message: 'Create an Initial Commit with the newly cloned repo?'
    }
  ])
    .then(work)
    .catch(error)
    .then(complete)
    .catch(error)
}

function work(opts) {
  let origin = opts.git_origin;
  let dest = opts.git_clone_dest;
  let clean = opts.git_clean_history;
  let projectName = opts.project_name;

  return git.clone(origin, dest)
    .then(() => {
      return npm.updatePackage(dest);
    })
    .then(() => {
      if (clean) {
        return git.cleanHistory(dest);
      }
      return Promise.resolve();
    })
    .then(() => {
      return git.setRemote(projectName);
    });
}

function complete() {
  utils.write('Complete!');
  process.exit(0);
}

function error(err) {
  utils.writeError(err);
  process.exit(1);
}

process.on('uncaughtException', err => {
  if (err) {
    utils.writeError(err.stack || err);
    process.exit(1);
  }
})
