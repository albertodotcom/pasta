let fs = require('fs-extra');

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
        resolve(items);
      });
    });
  },

  filterFiles(data) {
    return data;
  },

  copyAndTransform(data) {
    return data;
  },
};

module.exports = Utils;
