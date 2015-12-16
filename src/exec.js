var when = require('when');
var path = require('path');

var Utils = require('./utils');

const SCRIPT = 'echo "pasta" ; echo "pizza"';
const FROM = path.join(__dirname, '..', 'templates');
const TRANSFORM = (data) => {
  return new Promise((res) => {
    console.log('transform');
    res(data);
  });
};

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

  new(destFolder) {
    let execTrain = {
      from: path.join(FROM, 'new'),
      to: path.join(process.cwd(), destFolder),
      transform: TRANSFORM,
    };

    return this.copy(execTrain)
    .then(() => {
      return Utils.executeScript(SCRIPT);
    });
  }
}

module.exports = new Exec();
