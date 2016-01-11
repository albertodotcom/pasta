let Nodegit = require('nodegit');

let Git = {
  clone({from, to}) {
    return Nodegit.Clone(from, to);
  },
};

module.exports = Git;
