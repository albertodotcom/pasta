let { expect } = require('chai');
let path = require('path');

let Utils = require('../app/utils');

const testAssestsFolder = path.join(__dirname, './assets/init');
const filesAndFolders = [
  '/Users/aforni/Projects/react-cli/test/assets/init',
  '/Users/aforni/Projects/react-cli/test/assets/init/package.json',
];

describe('Utils', () => {
  describe('ls', () => {
    it('list the in init folder', () => {
      return Utils.ls({from: testAssestsFolder})
      .then((filesAndDir) => {
        expect(filesAndDir).to.deep.equal(filesAndFolders);
      });
    });
  });
});
