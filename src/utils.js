let fs = require('fs-extra');
let when = require('when');
let path = require('path');
let shell = require('shelljs');

const Utils = {
  ls(data) {
    let {from} = data;

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
        resolve(data);
      });
    });
  },

  filterFiles(data) {
    let {filesAndFolders} = data;

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
      return data;
    });
  },

  copyAndTransform(data) {
    let {files, transform, from, to} = data;

    return when.all(files.map((file) => {
      return Utils.readFile(file)
      .then((fileContent) => {
        return Utils.transform(fileContent, transform);
      })
      .then((transformedFileContent) => {
        let newFilePath = Utils.outputFilePath(from, to, file);
        return Utils.writeFile(newFilePath, transformedFileContent);
      });
    }))
    .then(() => true);
  },

  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err != null) return reject(err);

        resolve(data);
      });

    });
  },

  writeFile(filePath, data) {
    return new Promise((resolve, reject) => {
      fs.outputFile(filePath, data, (err) => {
        if (err != null) return reject(err);

        resolve(true);
      });
    });
  },

  transform(data, transformer) {
    return transformer(data)
    .then((data) => {
      return Promise.resolve(data);
    });
  },

  outputFilePath(originFolder, destFolder, oldFilePath) {
    return path.join(destFolder, oldFilePath.replace(originFolder, ''));
  },

  executeScript(script) {
    return shell.exec(script).code === 0;
  },

};

module.exports = Utils;
