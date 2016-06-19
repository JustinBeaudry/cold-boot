'use strict';

const url = require('url');

module.exports = {
  formatGitRepoName: formatGitRepoName
};



function formatGitRepoName(name, origin) {
  let _origin, _name;
  try {
    _origin = url.parse(origin);
  } catch(e) {}
  try {
    _name = url.parse(name);
  } catch(e) {}

  return url.format(
    Object.create(url.Url, {
      protocol: _origin.protocol || _name.protocol,
      pathname: _origin.pathname || _name.pathname,
      host:     _origin.host     || _name.host,
      hash:     _origin.hash     || _name.hash
    })
  );
}
