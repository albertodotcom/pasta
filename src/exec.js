let when = require('when');
let path = require('path');

let Utils = require('./utils');
let { Transform } = require('./transform');
let { logger } = require('./logger');

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
    // TODO make a distinction between destFolder and appName

    let execTrain = {
      from: path.join(FROM, 'new'),
      to: path.join(process.cwd(), destFolder),
      transform: new Transform({
        appName: destFolder,
      }),
    };

    logger.info('Start a new project');
    logger.verbose(`with the following configurations:\n${JSON.stringify(execTrain, null, 2)}`);

    return this.copy(execTrain)
    .then(() => {
      return Utils.executeScript(SCRIPT(destFolder));
    });
  }
}

module.exports = new Exec();
