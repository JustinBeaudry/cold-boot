'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {
  formatPackage: formatPackage,
  updatePackage: updatePackage
};

function formatPackage(pkg, project_name, author_name) {
  let newPkg = Object.assign({}, pkg);

  newPkg.name = project_name;
  newPkg.author = author_name;
  newPkg.version = '1.0.0';

  delete newPkg.description;
  delete newPkg.keywords;
  delete newPkg.scripts.install;

  return newPkg;
}

function updatePackage(project_path, project_name, author_name) {
  return new Promise((reject, resolve) => {
    hasPackage(project_path).then(
      (pkg) => {
        pkg = formatPackage(pkg, project_name, author_name);
        fs.writeFile(path.join(project_path, 'package.json'), pkg, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      },
      (err) => {
        reject(err);
      }
    )
  });
}

function hasPackage(project_path) {
  return new Promise((reject) => {
    fs.readdir(project_path, (err, files) => {
      if (err) {
        return reject(err);
      }

      let pkg = files.find((file) => {
        return file === 'package.json';
      });

      if (!pkg) {
        return reject(new Error('No package.json in target project'));
      }

      return getPackage(project_path);
    });
  });
}

function getPackage(project_path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(project_path, 'package.json'), (err, file) => {
      if (err) {
        return reject(err);
      }
      resolve(file);
    });
  });
}
