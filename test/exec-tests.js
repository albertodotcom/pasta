import { expect } from 'chai';
import path from 'path';
import fs from 'fs-extra';
import through2 from 'through2';
import prequire from 'proxyquire';
var sinon = require('sinon');

let UtilsStub = {
  executeScript: sinon.stub().returns(true),
};

let exec = prequire('../src/exec', {
  './utils': UtilsStub,
});

let excludeFolders = through2.obj(function (item, enc, next) {
  if (!item.stats.isDirectory()) this.push(item);
  next();
});

const testAssestsFolder = path.join(__dirname, './assets/init');
const TEMPLATES_FOLDER = path.join(__dirname, '../templates/');
const tmpFolder = path.join(__dirname, '../tmp/init');

const SCRIPT = 'echo "pasta" ; echo "pizza"';

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

  describe('new', () => {
    it('copies the files from the `from` folder to the `dest` folder and execute a script', () => {
      let from = TEMPLATES_FOLDER;
      let to = tmpFolder;

      sinon.stub(exec, 'copy').returns(Promise.resolve());

      return exec.new(tmpFolder)
      .then(() => {
        let execCopyArgs = exec.copy.args[0][0];
        expect(execCopyArgs.from).to.equal(path.join(from, 'new'));
        expect(execCopyArgs.to).to.equal(to);
        expect(execCopyArgs.transform).to.be.a('function');
        expect(UtilsStub.executeScript.calledWith(SCRIPT)).to.true;
      });
    });
  });
});
