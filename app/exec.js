var Q = require('q');
var path = require('path');

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
    }, Q({from, to, transform}));
  }

  outputFilePath(originFolder, destFolder, oldFilePath) {
    return path.join(destFolder, oldFilePath.replace(originFolder, ''));
  }
}

module.exports = new Exec();
