'use strict';

function coldBootNpm(pkg, projectName, authorName) {
  let newPkg = Object.assign({}, pkg);

  newPkg.name = projectName || 'New Project';
  newPkg.authors = [authorName];
  newPkg.version = '0.1.0';

  delete newPkg.description;
  delete newPkg.license;
  delete newPkg.keywords;
  delete newPkg.scripts.install;
  delete newPkg.devDependencies;

  newPkg.devDependencies = {};
  Object.keys(pkg.devDependencies)
    .forEach((dep) => {
      newPkg.devDependencies[dep] = pkg.devDependencies[dep];
    });

  newPkg.homepage       = formatGitRepoName(newPkg.homepage,       git_origin);
  newPkg.bugs.url       = formatGitRepoName(newPkg.bugs.url,       git_origin);
  newPkg.repository.url = formatGitRepoName(newPkg.repository.url, git_origin);

  return newPkg;
}
