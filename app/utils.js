let fs = require('fs-extra');
let when = require('when');

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
    return data;
  },

  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err != null) return reject(err);

        resolve(data);
      });

    });
  },
};

module.exports = Utils;
