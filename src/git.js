let Nodegit = require('nodegit');

let Git = {
  clone(repo, dest) {
    return Nodegit.Clone(repo, dest);
  },
};

module.exports = Git;
