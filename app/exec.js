var when = require('when');

var Utils = require('./utils');

class Exec {
  copy({from, to, transform}) {
    let flow = [
      Utils.ls,
      Utils.filterFiles,
      Utils.copyAndTransform,
    ];

    return flow.reduce(function (soFar, f) {
      return soFar.then(f);
    }, when({from, to, transform}));
  }
}

module.exports = new Exec();
