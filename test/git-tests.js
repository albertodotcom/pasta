let { expect } = require('chai');
let sinon = require('sinon');
let Nodegit = require('nodegit');
let fsExtra = require('fs-extra');
let path = require('path');

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
      return Git.clone({ from: repo, to: dest })
      .then(() => {
        expect(Nodegit.Clone.calledWith(repo, dest)).to.true;
      });
    });
  });

  describe('.cleanGitFolder', () => {
    let data = {
      to: 'itDoestMatter',
    };

    afterEach(() => {
      fsExtra.remove.restore && fsExtra.remove.restore();
    });

    it('calls fsExtra.remove with to/.git as folder', () => {
      sinon.stub(fsExtra, 'remove').returns(Promise.resolve());

      return Git.cleanGitFolder(data)
      .then(() => {
        expect(fsExtra.remove.calledWith(path.join('itDoestMatter', '.git'))).to.true;
      });
    });

    it('returns data', () => {
      sinon.stub(fsExtra, 'remove').returns(Promise.resolve(data));

      return Git.cleanGitFolder(data)
      .then((data) => {
        expect(data).to.deep.equal(data);
      });
    });
  });
});
