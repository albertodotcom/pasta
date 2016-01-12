let { expect } = require('chai');
let sinon = require('sinon');
let Utils = require('../src/utils');

let Git = require('../src/git');

describe('Git', () => {
  describe('.clone', () => {
    beforeEach(() => {
      sinon.stub(Utils, 'executeScript').returns(Promise.resolve());
    });

    afterEach(() => {
      Utils.executeScript.restore();
    });

    it('calls Nodegit.Clone with repo and dest', () => {
      let repo = 'http://myrepo';
      let dest = 'destFolder';
      return Git.clone({ from: repo, to: dest })
      .then(() => {
        expect(Utils.executeScript.calledWith(`git clone ${repo} ${dest}`)).to.true;
      });
    });
  });
});
