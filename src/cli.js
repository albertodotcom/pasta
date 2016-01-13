let chalk = require('chalk');
let parseArgv = require('minimist');
let exec = require('./exec.js');
let { logger } = require('./logger');

let usage = `
  usage: pasta [options] [command]

  commands:

    ${ chalk.bold('new') } <name> <srcFolder or gitRepo> [path] - create a scaffold project. Default path ./<name>
    ${ chalk.bold('create') } <template> <name> - create a set of files based on specific templates

    ${ chalk.bold('help') } - Display the available options

  global options:

    -v, --verbose   show debug information
    -q, --quiet     only output critical errors
`;

let globalOptions = {
  boolean: ['verbose', 'quiet'],
  alias: {
    verbose: 'v',
    quiet: 'q',
  },
};

let CLI = {
  main(argv) {
    let opts = parseArgv(argv, globalOptions);
    let cmd = opts._[2];

    if (cmd === 'help' || !cmd) {
      logger.info(usage);
      process.exit(0);
    }

    if (opts.verbose) {
      if (argv.indexOf('-vv') !== -1) {
        logger.transports.cli.level = 'silly';
      } else {
        logger.transports.cli.level = 'verbose';
      }
    }

    try {
      exec[cmd](opts._.slice(3))
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
