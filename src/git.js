let fsExtra = require('fs-extra');
let path = require('path');
let Utils = require('./utils');

let { logger } = require('./logger');

let Git = {
  clone(data) {
    let { from, to } = data;
    return Utils.executeScript(`git clone ${from} ${to}`)
    .then(() => data);
  },

  cleanGitFolder(data) {
    let { to } = data;
    let gitFolder = path.join(to, '.git');
    logger.verbose(`Delete git folder at '${gitFolder}'`);

    return new Promise((resolve, reject) => {
      fsExtra.remove(gitFolder, (err) => {
        if (err) return reject(err);

        return resolve(data);
      });
    });
  },
};

module.exports = Git;
