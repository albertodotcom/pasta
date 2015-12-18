let fs = require('fs-extra');
let when = require('when');
let path = require('path');
let shell = require('shelljs');

let { logger } = require('./logger');

let Utils = {
  ls(data) {
    let {from} = data;

    logger.verbose(`List files and folders from: ${ from }`);

    return new Promise((resolve, reject) => {
      let items = [];

      fs.walk(from)
      .on('data', function (item) {
        items.push(item.path);
      })
      .on('error', (e) => {
        reject(e);
      })
      .on('end', function () {
        data.filesAndFolders = items;

        logger.silly(`Found:\n${ JSON.stringify(items, null, 2) }`);

        resolve(data);
      });
    });
  },

  filterFiles(data) {
    let {filesAndFolders} = data;

    logger.verbose('Filter files');
    logger.silly(`from:\n${ JSON.stringify(filesAndFolders, null, 2)}`);

    return when.filter(filesAndFolders, (fileOrFolderPath) => {
      return new Promise((resolve, reject) => {
        fs.lstat(fileOrFolderPath, (err, fileOrFolder) => {
          if (err) reject(err);
          resolve(fileOrFolder.isFile());
        });
      });
    })
    .then((files) => {
      data.files = files;

      logger.silly(`Found the following files:\n${ JSON.stringify(files, null, 2) }`);

      return data;
    });
  },

  copyAndTransform(data) {
    let {files, transform, from, to} = data;

    logger.verbose(`Copy and transform from "${ from }" to "${ to }"`);
    logger.silly(`Copy and transform the following files:\n${JSON.stringify(files, null, 2)}`);

    if (transform == null) {
      logger.verbose('Transform is not defined so no transformation will be done');
    }

    return when.all(files.map((file) => {
      return Utils.readFile(file)
      .then((fileContent) => {
        if (transform == null) {
          return fileContent;
        }

        logger.verbose(`Transform: "${file}"`);
        return Utils.transform(fileContent, transform);
      })
      .then((transformedFileContent) => {
        let newFilePath = Utils.outputFilePath(from, to, file);
        return Utils.writeFile(newFilePath, transformedFileContent);
      });
    }))
    .then((createdFilePaths) => {
      logger.info(`Created the following files:\n${createdFilePaths.join('\n')}`);
      return true;
    });
  },

  readFile(filePath) {
    logger.verbose(`Read: "${filePath}"`);
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err != null) return reject(err);

        resolve(data);
      });

    });
  },

  writeFile(filePath, data) {
    logger.silly(`Write: "${ filePath }"`);
    return new Promise((resolve, reject) => {
      fs.outputFile(filePath, data, (err) => {
        if (err != null) return reject(err);

        resolve(filePath);
      });
    });
  },

  transform(data, transformer = {}) {
    if (typeof transformer.transform !== 'function') {
      return Promise.reject(new Error('Transformer must have a transform method'));
    }

    return transformer.transform(data)
    .then((data) => {
      return Promise.resolve(data);
    });
  },

  outputFilePath(originFolder, destFolder, oldFilePath) {
    return path.join(destFolder, oldFilePath.replace(originFolder, ''));
  },

  executeScript(script) {
    logger.info(`Execute script:\n${script}`);

    return shell.exec(script).code === 0;
  },

};

module.exports = Utils;
