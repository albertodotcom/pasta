let { spawn } = require('child_process');
let sequence = require('when/sequence');
let { logger } = require('../logger.js');

const SPLIT_CMDS_BY = '&&';

let Process = {
  parseScripts(scripts) {
    return scripts
    .split(SPLIT_CMDS_BY)
    .map((script) => {
      let [cmd, ...cmdArguments] = script.trim().split(' ');

      cmdArguments = cmdArguments.reduce((prev, current) => {
        if (prev.length === 0) return [current];

        if (prev[prev.length - 1].indexOf('"') === 0) {
          prev[prev.length - 1] = prev[prev.length - 1] + ' ' + current;
          return prev;
        } else {
          prev.push(current);
          return prev;
        }
      }, []);

      return cmdArguments.length === 0 ? [cmd, []] : [cmd, cmdArguments];
    });
  },

  executeScript([cmd, cmdArguments]) {
    return new Promise((resolve, reject) => {
      logger.verbose(`Spawn: "${cmd}", with arguments: "${cmdArguments}", from "${process.cwd()}"`);

      let cmdProcess = spawn(cmd, cmdArguments);

      cmdProcess.stdout.on('data', function (data) {
        logger.info(data.toString());
      });

      cmdProcess.stderr.on('data', function (data) {
        logger.info(data.toString());
      });

      cmdProcess.on('close', function (code) {
        logger.verbose('child process exited with code ' + code);

        code === 0 ? resolve(code) : reject(code);
      });
    });
  },

  spawnExec(scripts) {
    let scriptsArray = Process.parseScripts(scripts).map((script) => {
      return Process.executeScript.bind(null, script);
    });

    return sequence(scriptsArray)
    .then(() => 0)
    .catch((err) => {
      logger.error(err);
    });
  },
};

module.exports = Process;
