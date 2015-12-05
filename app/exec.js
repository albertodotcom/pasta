import fs from 'fs-extra';
import through2 from 'through2';
import path from 'path';

class Exec {
  copy({from, to}) {
    return new Promise((resolve, reject) => {
      let self = this;

      let files = [];

      var writeFile = through2.obj(function (item, enc, next) {
        if (!item.stats.isDirectory()) {
          fs.createOutputStream(self.outputFilePath(from, to, item.path));
          this.push(item);
        }

        next();
      });

      fs.walk(from)
      .pipe(writeFile)
      .on('data', (item) => {
        files.push(item.path);
      })
      .on('end', function () {
        resolve();
      });
    });
  }

  outputFilePath(originFolder, destFolder, oldFilePath) {
    return path.join(destFolder, oldFilePath.replace(originFolder, ''));
  }
}

export default new Exec();
