let { expect } = require('chai');
let path = require('path');

let Utils = require('../app/utils');

const testAssestsFolder = path.join(__dirname, './assets/init');
const FILES_AND_FOLDERS_PATH = [
  '/Users/aforni/Projects/react-cli/test/assets/init',
  '/Users/aforni/Projects/react-cli/test/assets/init/package.json',
];

const FileContent = JSON.stringify({
  'name': 'react-cli',
  'version': '0.0.1',
  'description': 'Terminal App for creating react applications',
  'main': 'index.js',
  'scripts': {
    'test': 'mocha',
  },
  'keywords': [
    'react',
    'cli',
    'node',
  ],
  'author': 'Alberto Forni',
  'license': 'ISC',
  'devDependencies': {
    'chai': '^3.4.1',
    'mocha': '^2.3.4',
  },
  'dependencies': {
    'babel-core': '^6.2.1',
    'babel-preset-es2015': '^6.1.18',
  },
}, null, 2) + '\n';


describe('Utils', () => {
  describe('.ls', () => {
    it('resolves with and object that contains the key "filesAndFolders"', () => {
      return Utils.ls({from: testAssestsFolder})
      .then(({filesAndFolders}) => {
        expect(filesAndFolders).to.deep.equal(FILES_AND_FOLDERS_PATH);
      });
    });
  });

  describe('.filterFiles', () => {
    it('returns only package.json', () => {
      return Utils.filterFiles({filesAndFolders: FILES_AND_FOLDERS_PATH})
      .then(({files}) => {
        expect(files).to.deep.equal([FILES_AND_FOLDERS_PATH[1]]);
      });
    });
  });

  describe('.readFile', () => {
    it('return a file content', () => {
      return Utils.readFile(FILES_AND_FOLDERS_PATH[1])
      .then((fileContent) => {
        expect(fileContent).to.equal(FileContent);
      });
    });
  });

  describe('.writeFile', () => {
    it('calls the outputFile method on fs', () => {
      return Utils.writeFile(FILES_AND_FOLDERS_PATH[1], FileContent)
      .then((done) => {
        expect(done).to.true;
      });
    });
  });

  describe('.transform', () => {
    it('convert all the text to uppercase', () => {
      let toUpperCase = (data) => {
        return new Promise((res) => res(data.toUpperCase()));
      };

      return Utils.transform('hello\nworld!!', toUpperCase)
      .then((data) => {
        expect(data).to.equal('HELLO\nWORLD!!');
      });
    });
  });
});
