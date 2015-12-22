let { expect } = require('chai');
let path = require('path');
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

const TEST_ASSESTS_FOLDER = path.join(__dirname, './assets/init');
const TEMPLATES_FOLDER = path.join(__dirname, '../templates/');
const TMP_FOLDER = path.join(__dirname, '../tmp/');

describe('exec', () => {
  describe('._copy', () => {
    beforeEach(() => {
      sinon.spy(UtilsStub, 'ls');
      sinon.spy(UtilsStub, 'filterFiles');
      sinon.spy(UtilsStub, 'copyAndTransform');
    });

    afterEach(() => {
      UtilsStub.ls.restore();
      UtilsStub.filterFiles.restore();
      UtilsStub.copyAndTransform.restore();
    });

    it('calls ls, filterFiles, copyAndTransform form Utils', () => {
      return exec._copy({
        from: TEST_ASSESTS_FOLDER,
        to: TMP_FOLDER,
      })
      .then(() => {
        expect(UtilsStub.ls.calledOnce).to.true;
        expect(UtilsStub.filterFiles.calledOnce).to.true;
        expect(UtilsStub.copyAndTransform.calledOnce).to.true;
      });
    });
  });

  describe('.new', () => {
    beforeEach(() => {
      sinon.stub(exec, '_copy').returns(Promise.resolve());
    });

    afterEach(() => {
      exec._copy.restore();
    });

    it('copies the files from the `from` folder to the `dest` folder and execute a script', () => {
      let from = TEMPLATES_FOLDER;
      let to = path.join(TMP_FOLDER, 'init');

      process.chdir(TMP_FOLDER);
      return exec.new(['newApp', 'init'])
      .then(() => {
        let execCopyArgs = exec._copy.args[0][0];
        expect(execCopyArgs.from).to.equal(path.join(from, 'new'));
        expect(execCopyArgs.to).to.equal(to);

        // TODO you can do better here!!!
        expect(execCopyArgs.transform.transform).to.be.a('function');
        expect(UtilsStub.executeScript.args[0][0]).to.be.a('string');
      });
    });
  });

  describe('.create', () => {
    beforeEach(() => {
      sinon.stub(exec, '_copy').returns(Promise.resolve());
    });

    afterEach(() => {
      exec._copy.restore();
    });

    it('copies the files from the `from` folder to the `dest` folder', () => {
      let from = TEMPLATES_FOLDER;
      let to = path.join(process.cwd(), 'app', 'components');

      return exec.create(['component', 'TopBar'])
      .then(() => {
        let execCopyArgs = exec._copy.args[0][0];
        expect(execCopyArgs.from).to.equal(path.join(from, 'create', 'component'));
        expect(execCopyArgs.to).to.equal(to);

        // TODO you can do better here!!!
        expect(execCopyArgs.transform.transform).to.be.a('function');
      });
    });
  });
});
