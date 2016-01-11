let when = require('when');
let path = require('path');

let Utils = require('./utils');
let Git = require('./git');
let { Transform } = require('./transform');
let { logger } = require('./logger');

const SCRIPT = `npm install && git init && git add --all && git commit -m "Create scaffold project"`;
const FROM = path.join(__dirname, '..', 'templates');

class Exec {
  _copy({from, to, transform, outputFileName}) {
    let flow = [];

    if (Utils.isRepo(from)) {
      flow = [
        Git.clone(from),
        Utils.transform,
      ];
    } else {
      flow = [
        Utils.ls,
        Utils.filterFiles,
        Utils.copyAndTransform,
      ];
    }

    return flow.reduce(function (soFar, f) {
      return soFar.then(f);
    }, when({from, to, transform, outputFileName}));
  }

  new([name, from, destFolder = '.']) {
    let to = path.join(process.cwd(), destFolder);

    let execTrain = {
      from,
      to,
      transform: new Transform({
        appName: name,
      }),
    };

    logger.info('Start a new project');
    logger.verbose(`with the following configurations:\n${JSON.stringify(execTrain, null, 2)}`);

    return this._copy(execTrain)
    .then(() => {
      logger.verbose(`Change current working directory to: "${to}"`);
      process.chdir(to);
      Utils.executeScript(SCRIPT);
    });
  }

  create([type, name]) {
    // TODO use a plural library
    let destFolder = path.join(process.cwd(), 'app', type + 's');

    let execTrain = {
      from: path.join(FROM, 'create', type),
      to: destFolder,
      transform: new Transform({
        componentName: name,
      }),
      outputFileName: name,
    };

    logger.info(`Create the "${type}" named: "${name}"`);
    logger.verbose(`with the following configurations:\n${JSON.stringify(execTrain, null, 2)}`);

    return this._copy(execTrain);
  }
}

module.exports = new Exec();
