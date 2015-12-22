let { expect } = require('chai');
let sinon = require('sinon');

let Process = require('../../src/utils/process');

describe('Process', () => {
  describe('.spawnExec', () => {
    beforeEach(() => {
      sinon.spy(Process, 'parseScripts');
      sinon.spy(Process, 'executeScript');
    });

    afterEach(() => {
      Process.parseScripts.restore();
      Process.executeScript.restore();
    });

    it('is a function', () => {
      expect(Process.spawnExec).to.be.a('function');
    });

    it('calls .parseScripts, then for each .executeScript', () => {
      const SCRIPT = 'echo "hello world" && ls -al';
      return Process.spawnExec(SCRIPT)
      .then(() => {
        expect(Process.parseScripts.calledWith(SCRIPT)).to.true;
        expect(Process.executeScript.calledWith(['echo', ['"hello world"']])).to.true;
        expect(Process.executeScript.calledWith(['ls', ['-al']])).to.true;
      });
    });
  });

  describe('.parseScripts', () => {
    it('returns an array of string split by &&', () => {
      expect(Process.parseScripts('hello world && pasta & pizza')).to.deep.equal([
        ['hello', ['world']],
        ['pasta', ['&', 'pizza']],
      ]);
    });

    it('returns an array with an empty arguments list', () => {
      expect(Process.parseScripts('ls')).to.deep.equal([
        ['ls', []],
      ]);
    });

    it(`returns 'ls', ['-lh', '/usr']`, () => {
      expect(Process.parseScripts('ls -lh /usr')).to.deep.equal([
        ['ls', ['-lh', '/usr']],
      ]);
    });
  });
});
