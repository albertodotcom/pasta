var when = require('when');
var path = require('path');

var Utils = require('./utils');
var { Transform } = require('./transform');

const SCRIPT = (destFolder) => `cd ${destFolder} && npm install && git init && git add --all && git commit -m "Create scaffold project"`;
const FROM = path.join(__dirname, '..', 'templates');

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
      transform: Transform.replaceNewLineByComment,
    };

    return this.copy(execTrain)
    .then(() => {
      return Utils.executeScript(SCRIPT(destFolder));
    });
  }
}

module.exports = new Exec();
