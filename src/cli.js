let chalk = require('chalk');
let parseArgv = require('minimist');
let exec = require('./exec.js');
let { logger } = require('./logger');

let usage = `
  usage: pasta [options] [command]

  commands:

    ${ chalk.bold('new') } [name] - create a scaffold project
    ${ chalk.bold('create') } [template] [name] - create a set of files base on the specified template

    ${ chalk.bold('help') } - Display the available options

  global options:

    -v, --verbose   show debug information
    -q, --quiet     only output critical errors
    -V, --version   output version and exit
    -h, --help      show help
`;

let CLI = {
  main(argv) {
    let opts = parseArgv(argv);
    let cmd = opts._[2];

    if (cmd === 'help' || !cmd) {
      console.log(usage);
      process.exit(0);
    }

    try {
      exec[cmd](opts._[3])
      .catch((error) => {
        logger.error(error);
        process.exit(1);
      });
    } catch(error) {
      if (error.toString() === 'TypeError: exec[cmd] is not a function') {
        logger.error(`'${ cmd }' - no such command`);
        logger.info(usage);
        process.exit(1);
      } else {
        throw(error);
      }
    }
  },
};

module.exports = CLI;
