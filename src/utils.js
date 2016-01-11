let fsExtra = require('fs-extra');
let when = require('when');
let path = require('path');
let Process = require('./utils/process');

let { logger } = require('./logger');

const FILE_TEMPLATE_KEYWORD = 'template';

let Utils = {
  ls(data) {
    let { from } = data;

    logger.verbose(`List files and folders from: ${ from }`);

    return new Promise((resolve, reject) => {
      let items = [];

      fsExtra.walk(from)
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
    let { filesAndFolders } = data;

    logger.verbose('Filter files');
    logger.silly(`from:\n${ JSON.stringify(filesAndFolders, null, 2)}`);

    return when.filter(filesAndFolders, (fileOrFolderPath) => {
      return new Promise((resolve, reject) => {
        fsExtra.lstat(fileOrFolderPath, (err, fileOrFolder) => {
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

  readTransformWrite(file, data) {
    let { transform, from, to, outputFileName } = data;

    return Utils.readFile(file)
    .then((fileContent) => {
      if (transform == null) {
        return fileContent;
      }

      logger.verbose(`Transform: "${file}"`);
      return Utils.transform(fileContent, transform);
    })
    .then((transformedFileContent) => {
      let newFilePath = Utils.outputFilePath(from, to, file, outputFileName);
      return Utils.writeFile(newFilePath, transformedFileContent);
    });
  },

  copyAndTransform(data) {
    let { files, transform, from, to } = data;

    logger.verbose(`Copy and transform from "${ from }" to "${ to }, with:\n${ JSON.stringify(data, null, 2) }"`);
    logger.silly(`Copy and transform the following files:\n${JSON.stringify(files, null, 2)}`);

    if (transform == null) {
      logger.verbose('Transform is not defined so no transformation will be done');
    }

    return when.all(files.map((file) => {
      return Utils.readTransformWrite(file, data);
    }));
  },

  transformInPlace(data) {
    // all the replacement happens in the 'to' folder
    let replaceData = Object.assign({}, data, { from: data.to });

    return Utils.ls(replaceData)
    .then(Utils.filterFiles)
    .then((data) => {
      return when.all(data.files.map((file) => {
        return Utils.readTransformWrite(file, replaceData);
      }));
    });
  },

  readFile(filePath) {
    logger.verbose(`Read: "${filePath}"`);
    return new Promise((resolve, reject) => {
      fsExtra.readFile(filePath, 'utf8', (err, data) => {
        if (err != null) return reject(err);

        resolve(data);
      });
    });
  },

  writeFile(filePath, data) {
    logger.silly(`Write: "${ filePath }"`);
    return new Promise((resolve, reject) => {
      fsExtra.outputFile(filePath, data, (err) => {
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

  outputFilePath(originFolder, destFolder, oldFilePath, outputFileName) {
    let oldFilePathWithoutTemplate;

    if (outputFileName != null) {
      oldFilePathWithoutTemplate = oldFilePath.replace(FILE_TEMPLATE_KEYWORD, outputFileName);
      logger.silly(`Replace ${oldFilePath} with ${oldFilePathWithoutTemplate}`);
    } else {
      oldFilePathWithoutTemplate = oldFilePath;
    }

    return path.join(destFolder, oldFilePathWithoutTemplate.replace(originFolder, ''));
  },

  executeScript(script) {
    logger.info(`Execute script:\n${script}`);

    return Process.spawnExec(script);
  },

  isRepo(repoOrfolder) {
    let gitTest = /^(https?|git|ssh|ftps?|rsync):\/\/\S+?/;
    return gitTest.test(repoOrfolder);
  },

};

module.exports = Utils;
