import { expect } from 'chai';
import path from 'path';
import fs from 'fs-extra';
import through2 from 'through2';

import exec from '../app/exec';

let excludeFolders = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory()) this.push(item);
  next();
});

function listFilePathInFolder(folder) {
  return new Promise((resolve, reject) => {
    var items = [];
    fs.walk(folder)
    .pipe(excludeFolders)
    .on('data', function (item) {
      items.push(item.path);
    })
    .on('error', (e) => {
      console.error(e);
      reject(e);
    })
    .on('end', function () {
      return resolve(items);
    });
  });
}

describe('exec', () => {
  describe('copy', () => {
    it('copies all the files from a folder to another', () => {
      let testAssestsFolder = path.join(__dirname, './assets/init');
      let tmpFolder = path.join(__dirname, '../tmp/init');

      let expectedFiles = [
        path.join(tmpFolder, 'package.json'),
      ];

      return exec.copy({
        from: testAssestsFolder,
        to: tmpFolder,
      })
      .then(() => {
        return listFilePathInFolder(tmpFolder);
      })
      .then((resultFiles) => {
        expect(resultFiles).to.deep.equal(expectedFiles);
      });
    });
  });

  describe('outputFilePath', () => {
    it('it returns /tmp/target/package.json', () => {
      const testAssestsFolder = path.join(__dirname, './assets/init');
      const tmpFolder = path.join(__dirname, '../tmp/target');
      const templateFilePath = path.join(__dirname, './assets/init/package.json');

      let outputFilePath = exec.outputFilePath(testAssestsFolder, tmpFolder, templateFilePath);

      expect(outputFilePath).to.equal(path.join(__dirname, '../tmp/target/package.json'));
    });
  });

});
