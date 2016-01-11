let { expect } = require('chai');
let sinon = require('sinon');
let Nodegit = require('nodegit');

let Git = require('../src/git');

describe('Git', () => {
  describe('.clone', () => {
    beforeEach(() => {
      sinon.stub(Nodegit, 'Clone').returns(Promise.resolve());
    });

    afterEach(() => {
      Nodegit.Clone.restore();
    });

    it('calls Nodegit.Clone with repo and dest', () => {
      let repo = 'http://myrepo';
      let dest = 'destFolder';
      return Git.clone({from: repo, to: dest})
      .then(() => {
        expect(Nodegit.Clone.calledWith(repo, dest)).to.true;
      });
    });
  });
});
