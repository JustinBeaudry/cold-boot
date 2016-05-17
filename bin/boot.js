#!/usr/bin/env node

/*

    Cold Boot

    a self-removing automation system for bootstrapping web projects

    Features:
    * start project with a clean commit history
    * webpack build system setup with working build and dev server
    * cold boot removes itself after completing

    Roadmap:
    * add options for everything
    * css preprocessors
      * sass (default)
      * less
    * js extensions
      * es2015 (default)
      * Typescript


    Order of Operation:
    * prompt user for project name
    * prompt user for git origin
    * remove project license
    * npm package.json edits:
      * rename package.json
      * clear description
      * clear author
      * get author name from git config
      * remove npm packages from pkg.devDependencies
    * git:
      * remove .git
      * init new git project
      * provide Initial Commit for project 
      * git remote origin {origin]

 */

const program   = require('commander');
const chalk     = require('chalk');
const inquirer  = require('inquirer');
const rimraf    = require('rimraf');
const fs        = require('fs');
const path      = require('path');
const exec      = require('child_process').exec;
const url       = require('url');
const os        = require('os');
const pkg       = require('../package.json');

const DEFAULTS = {
  git: true,
  npm: true
};

const DEV_DEPS = [
  'commander',
  'chalk',
  'inquirer',
  'rimraf'
];

const NAME = `[ColdBoot v${pkg.version}]`;

program
  .version(pkg.version)
  .option('-g, --git', 'Clean and re-init Git. Defaults to true')
  .option('-n, --npm', 'Rename and clear package.json for new project. Default to true')
  .parse(process.argv);

warm({ 
  git: program.git, 
  npm: program.npm
});

function warm(opts) {
  
  Object.assign(opts, DEFAULTS);
  
  write([
    '',
    NAME,
    ''
  ]);

  getGitConfigInfo(function(config) {
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
        message: 'What is the git address of your projects origin?'
      }
    ]).then((answers) => {
      let tasks = [function() {
        writeError([
          '',
          (answers.project_name + ' warmed.').toUpperCase(),
          ''
        ]);
      }];
      if (opts.git || opts.npm) tasks.push(cleanup);
      if (opts.npm) tasks.push(doNpm); 
      if (opts.git) tasks.push(doGit);
      tasks.forEach((task) => task.call(null, answers));
    });
  }); 
  
}

function doGit(opts) {
  
  let git_origin;
  ({git_origin} = opts);
  
  rimraf.sync(path.join(process.cwd(), '.git'));
  gitInit(() => {
    gitInitialCommit(() => {
      setGitOrigin(git_origin, () => {
      });
    });
  });  
}

function doNpm(opts) {
  
  let project_name, author_name, git_origin;
  ({project_name, author_name, git_origin} = opts);
  
  let newPkg = Object.assign({}, pkg);
  
  newPkg.name = project_name || 'New Project';
  newPkg.authors = [author_name];
  newPkg.version = '0.1.0';
  
  delete newPkg.description;
  delete newPkg.license;
  delete newPkg.keywords;
  delete newPkg.scripts.install;
  delete newPkg.devDependencies;
  
  newPkg.devDependencies = {};
  Object.keys(pkg.devDependencies)
    .filter((dep) => { return DEV_DEPS.indexOf(dep) === -1; })
    .forEach((dep) => { 
      newPkg.devDependencies[dep] = pkg.devDependencies[dep]; 
    });

  newPkg.homepage       = formatGitRepoName(newPkg.homepage,       git_origin);
  newPkg.bugs.url       = formatGitRepoName(newPkg.bugs.url,       git_origin);
  newPkg.repository.url = formatGitRepoName(newPkg.repository.url, git_origin);

  fs.writeFileSync(path.join(process.cwd(), 'package.dev.json'), JSON.stringify(newPkg, null, 2) + os.EOL);
}

function cleanup() {
  rimraf.sync(path.join(process.cwd(), '_bin'));
  rimraf.sync(path.join(process.cwd(), 'LICENSE'));
}

function formatGitRepoName(name, origin) {
  let _origin, _name;
  try {
    _origin = url.parse(origin);  
  } catch(e) {}
  try {
    _name = url.parse(name);
  } catch(e) {}

  let uri = Object.create(url.Url);
  uri.protocol = _origin.protocol || _name.protocol; 
  uri.pathname = _origin.pathname || _name.pathname;
  uri.host     = _origin.host     || _name.host;
  uri.hash     = _origin.hash     || _name.hash
  
  return url.format(uri); 
}

function getGitConfigInfo(callback) {
  exec('git config user.name;git config user.email', (err, stdout) => {
    let config = {};
    if (stdout) {
      try {
        [config.name, config.email] = stdout.split('\n');
      } catch(e) {
        writeError(e);
      }
    }
    callback(config);
  });
}

function gitInit(callback) {
  exec('git init', (err, stdout) => {
    if (err) {
      writeError(err);
      callback(false);
      return;
    }
    callback(stdout);
  });
}

function gitInitialCommit(callback) {
  exec('git add --all :/;git commit -m \'Initial Commit\'', (err, stdout) => {
    if (err) {
      writeError(err);
      callback(false);
      return;
    }
    callback(stdout);
  });
}

function setGitOrigin(origin, callback) {
  exec(`git remote add origin ${origin}`, (err, stdout) => {
    if (err) {
      writeError(err);
      callback(false);
      return;
    }
    callback(stdout);
  });
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
