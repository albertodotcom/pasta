let when = require('when');
let path = require('path');
let plural = require('plural');

let Utils = require('./utils');
let Git = require('./git');
let { Transform } = require('./transform');
let { logger } = require('./logger');

const SCRIPT = `npm install && git init && git add --all && git commit -m "Create scaffold project"`;

class Exec {
  _copy(data) {
    let { from, to, transform, outputFileName, excludeTransformPath } = data;
    let flow = [];

    if (Utils.isRepo(from)) {
      logger.info(`Cloning\nfrom: " ${from}"\nto: "${to}"`);

      flow = [
        Git.clone,
        Git.cleanGitFolder,
        Utils.transformInPlace,
      ];
    } else {
      logger.info(`Copying\nfrom: "${from}"\nto: "${to}"`);

      flow = [
        Utils.ls,
        Utils.filterFiles,
        Utils.copyAndTransform,
      ];
    }

    return flow.reduce(function (soFar, f) {
      return soFar.then(f);
    }, when({ from, to, transform, outputFileName, excludeTransformPath }));
  }

  new([name, from, destFolder]) {
    let to = path.join(process.cwd(), destFolder || name);

    let execTrain = {
      from,
      to,
      transform: new Transform({
        appName: name,
      }),
      excludeTransformPath: new RegExp(path.join(to, '/templates/\S*'), 'i'),
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
    // load config file
    let createConfig = Utils.loadConfigFile(path.join(process.cwd(), 'templates'));

    let createTypeConfig;
    try {
      createTypeConfig = createConfig.create[type];
    } catch(e) {
      logger.verbose(`createConfig.create[${type}] is not present in the config file`);
      createTypeConfig = {};
    }

    // merge config file with execTrain default
    let execTrain = {
      from: path.join(process.cwd(), 'templates', 'create', type),
      to: path.join(process.cwd(), 'src', plural(type)),
      transform: new Transform({
        componentName: name,
      }),
      outputFileName: name,
      ...createTypeConfig,
    };

    // always use absolute path
    execTrain.from = path.resolve(execTrain.from);
    execTrain.to = path.resolve(execTrain.to);

    logger.info(`Create the "${type}" named: "${name}"`);
    logger.verbose(`with the following configurations:\n${JSON.stringify(execTrain, null, 2)}`);

    return Utils.checkFolderExists(execTrain.from)
    .then(() => {
      return this._copy(execTrain);
    }).catch((err) => {
      logger.info(err);
    });
  }
}

module.exports = new Exec();
