let Nodegit = require('nodegit');
let fsExtra = require('fs-extra');
let path = require('path');
let when = require('when');

let { logger } = require('./logger');

let Git = {
  clone(data) {
    let { from, to } = data;
    return Nodegit.Clone(from, to).then(() => data);
  },

  cleanGitFolder(data) {
    let { to } = data;
    let gitFolder = path.join(to, '.git');
    logger.verbose(`Delete git folder at '${gitFolder}'`);

    return when(fsExtra.remove(gitFolder, (err) => {
      if (err) return Promise.reject(err);

      return Promise.resolve(data);
    }));
  },
};

module.exports = Git;
