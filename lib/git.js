'use strict';

const url   = require('url');
const Git   = require('nodegit');
const exec  = require('child_process').exec;
const utils = require('./utils');

module.exports = {
  format       : format,
  clone        : clone,
  config       : config,
  validate     : validate,
  cleanHistory : cleanHistory,
  setRemote    : setRemote
};

function format(input) {
  let origin;

  try {
    origin = url.parse(String(input));
  } catch (e) {
    utils.writeError(e.message);
    return input;
  }
  
  origin = Object.assign(origin, {
    protocol: origin.protocol || 'https',
    slashes: true,
    hostname: origin.hostname,
    pathname: origin.path
  });
  
  origin = url.format(origin);

  return origin;
}

function formatRepoName(project_name, author_name, host) {
  host = host || 'github.com';
  return `https://${host}/${author_name}/${project_name}`;
}

function clone(origin, dest) {
  return Git.Clone(origin, dest, {
    bare: true
  });
}

function config() {
  return Git.Config.openDefault();
}

function validate(origin) {
  // nodegit does not currently support the ability to do an ls-remote without cloning the target remote
  // this method simply verifies that the target remote repo actually exists
  return new Promise((resolve, reject) => {
    exec(`git ls-remote ${origin}`, (err, stdout, stderr) => {
      if (err || stderr) {
        reject(err || stderr);
        return;
      }
      resolve();
    });
  });
}

function cleanHistory(dest) {
  // once again nodegit doesn't support creating orphan branches
  createOrphanBranch()
    .then(() => {
    })

  // checkout a new branch `tmp` with the orphan flag
  // add all files
  // commit 'Initial Commit'
  // delete the master branch
  // rename the current branch to master
}

function createOrphanBranch() {
  return new Promise((resolve, reject) => {
    exec('git branch tmp --orphan', (err, stdout, stderr) => {
      if (err || stderr) {
        reject(err || stderr);
        return;
      }
      exec('git checkout tmp' , (err, stdout, stderr) => {
        if (err || stderr) {
          reject(err || stderr);
          return;
        }
        resolve();
      })
    });
  });
}

function addAllAndCommit() {
  return new Promise((resolve, reject) => {

  });
}

function setRemote(repo, project_name) {
  return Git.Remote.delete(repo, 'origin')
    .then(() => {
      return config();
    })
    .then((config) => {
      return config.getString('user.name');
    })
    .then((name) => {
      return Git.Remote.create(repo, project_name, formatRepoName(project_name, name))
    });
}
