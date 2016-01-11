let { expect } = require('chai');
let path = require('path');
let prequire = require('proxyquire');
let sinon = require('sinon');

let { Transform } = require('../src/transform');
let { logger } = require('../src/logger');
logger.transports.cli.level = 'error';

let UtilsStub = {};
let GitStub = {};

let exec = prequire('../src/exec', {
  './utils': UtilsStub,
  './git': GitStub,
});

const GIT_REPO = 'https://github.com/albertodotcom/react-template';
const TEST_ASSESTS_FOLDER = path.join(__dirname, './assets/init');
const TEMPLATES_FOLDER = path.join(__dirname, '../templates/');
const TMP_FOLDER = path.join(__dirname, '../tmp/');
const COPY_SCRIPT = `npm install && git init && git add --all && git commit -m "Create scaffold project"`;
const CLONE_SCRIPT = `npm install`;

describe('exec', () => {
  describe('._copy', () => {
    beforeEach(() => {
      sinon.spy(UtilsStub, 'ls');
      sinon.spy(UtilsStub, 'filterFiles');
      sinon.spy(UtilsStub, 'copyAndTransform');
      sinon.stub(GitStub, 'clone').returns(Promise.resolve());
      sinon.stub(UtilsStub, 'transform').returns(Promise.resolve());
    });

    afterEach(() => {
      UtilsStub.ls.restore();
      UtilsStub.filterFiles.restore();
      UtilsStub.copyAndTransform.restore();
      GitStub.clone.restore();
      UtilsStub.transform.restore();
    });

    it('calls ls, filterFiles, copyAndTransform form Utils', () => {
      UtilsStub.isRepo = () => false;

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

    it('calls Git.clone and Utils.transform when Utils.isRepo returns true', () => {
      UtilsStub.isRepo = () => true;

      return exec._copy({
        from: GIT_REPO,
        to: TMP_FOLDER,
      })
      .then(() => {
        expect(GitStub.clone.calledOnce).to.true;
        expect(UtilsStub.transform.calledOnce).to.true;
      });
    });
  });

  describe('.new', () => {
    beforeEach(() => {
      sinon.stub(process, 'chdir').returns(null);
      sinon.stub(UtilsStub, 'executeScript').returns(null);
    });

    afterEach(() => {
      exec._copy.restore();
      process.chdir.restore();
      UtilsStub.executeScript.restore();
    });

    it('calls copy with `from` git repo, to the `dest` folder, and Transform function, then executes a script', () => {
      sinon.stub(exec, '_copy').returns(Promise.resolve(COPY_SCRIPT));

      let from = GIT_REPO;
      let to = path.join(TMP_FOLDER, 'init');

      return exec.new(['newApp', from, 'tmp/init'])
      .then(() => {
        let execCopyArgs = exec._copy.args[0][0];
        expect(execCopyArgs.from).to.equal(from);
        expect(execCopyArgs.to).to.equal(to);

        expect(execCopyArgs.transform).to.be.instanceof(Transform);

        // find a better why to test that 'newApp' is passed to Transform
        // here I shouldn't know about Transform implementation details
        expect(execCopyArgs.transform.replacer.appName).to.equal('newApp');

        expect(UtilsStub.executeScript.args[0][0]).to.be.equal(COPY_SCRIPT);
      });
    });

    it('calls the clone script if from is a repo', () => {
      sinon.stub(exec, '_copy').returns(Promise.resolve(CLONE_SCRIPT));

      return exec.new(['newApp', 'http://gitrepo.com/blah', 'tmp/init'])
      .then(() => {
        expect(UtilsStub.executeScript.args[0][0]).to.be.equal(CLONE_SCRIPT);
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
