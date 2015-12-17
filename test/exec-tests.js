let { expect } = require('chai');
let path = require('path');
let fs = require('fs-extra');
let through2 = require('through2');
let prequire = require('proxyquire');
let sinon = require('sinon');

let { logger } = require('../src/logger');
logger.transports.cli.level = 'error';

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

const TEST_ASSESTS_FOLDER = path.join(__dirname, './assets/init');
const TEMPLATES_FOLDER = path.join(__dirname, '../templates/');
const TMP_FOLDER = path.join(__dirname, '../tmp/init');

function listFilePathInFolder(folder) {
  return new Promise((resolve, reject) => {
    let items = [];
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
        from: TEST_ASSESTS_FOLDER,
        to: TMP_FOLDER,
      })
      .then(() => {
        expect(UtilsStub.ls.calledOnce).to.true;
        expect(UtilsStub.filterFiles.calledOnce).to.true;
        expect(UtilsStub.copyAndTransform.calledOnce).to.true;
      });

    });

    it('creates all the files found in a folder to destination one', () => {
      let expectedFiles = [
        path.join(TMP_FOLDER, 'package.json'),
      ];

      return exec.copy({
        from: TEST_ASSESTS_FOLDER,
        to: TMP_FOLDER,
      })
      .then(() => {
        return listFilePathInFolder(TMP_FOLDER);
      })
      .then((resultFiles) => {
        expect(resultFiles).to.deep.equal(expectedFiles);
      });
    });
  });

  describe('.new', () => {
    it('copies the files from the `from` folder to the `dest` folder and execute a script', () => {
      let from = TEMPLATES_FOLDER;
      let to = TMP_FOLDER;

      sinon.stub(exec, 'copy').returns(Promise.resolve());

      return exec.new('/tmp/init')
      .then(() => {
        let execCopyArgs = exec.copy.args[0][0];
        expect(execCopyArgs.from).to.equal(path.join(from, 'new'));
        expect(execCopyArgs.to).to.equal(to);
        expect(execCopyArgs.transform.transform).to.be.a('function');
        expect(UtilsStub.executeScript.args[0][0]).to.be.a('string');
      });
    });
  });
});
