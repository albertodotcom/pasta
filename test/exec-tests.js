import { expect } from 'chai';
import path from 'path';
import fs from 'fs-extra';
import through2 from 'through2';
import prequire from 'proxyquire';
var sinon = require('sinon');

let UtilsStub = {
};

let exec = prequire('../src/exec', {
  './utils': UtilsStub,
});

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
    const testAssestsFolder = path.join(__dirname, './assets/init');
    const tmpFolder = path.join(__dirname, '../tmp/init');
    let originalStub = Object.assign({}, UtilsStub);

    afterEach(() => {
      UtilsStub = originalStub;
    });

    it('calls ls, filterFiles, copyAndTransform form Utils', () => {
      UtilsStub.ls = sinon.spy();
      UtilsStub.filterFiles = sinon.spy();
      UtilsStub.copyAndTransform = sinon.spy();

      return exec.copy({
        from: testAssestsFolder,
        to: tmpFolder,
      })
      .then(() => {
        expect(UtilsStub.ls.calledOnce).to.true;
        expect(UtilsStub.filterFiles.calledOnce).to.true;
        expect(UtilsStub.copyAndTransform.calledOnce).to.true;
      });

    });

    it('creates all the files found in a folder to destination one', () => {
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
});
