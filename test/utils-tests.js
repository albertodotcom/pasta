let { expect } = require('chai');
let path = require('path');
let sinon = require('sinon');
let prequire = require('proxyquire');

let shellStub = {};

let Utils = prequire('../src/utils', {
  'shelljs': shellStub,
});

const TEST_ASSESTS_FOLDER = path.join(__dirname, './assets/init');
const FILES_AND_FOLDERS_PATH = [
  '/Users/aforni/Projects/react-cli/test/assets/init',
  '/Users/aforni/Projects/react-cli/test/assets/init/package.json',
];
const TMP_FOLDER = path.join(__dirname, '../tmp/init');

const FILE_CONTENT = JSON.stringify({
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

let toUpperCase = {
  transform: (data) => {
    return new Promise((res) => res(data.toUpperCase()));
  },
};

describe('Utils', () => {
  describe('.ls', () => {
    it('resolves with and object that contains the key "filesAndFolders"', () => {
      return Utils.ls({from: TEST_ASSESTS_FOLDER})
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

  describe('.copyAndTransform', () => {
    beforeEach(() => {
      sinon.spy(Utils, 'transform');
    });

    afterEach(() => {
      Utils.transform.restore();
    });

    it('calls readFile, transform and writeFile for each file', () => {
      let data = {
        from: TEST_ASSESTS_FOLDER,
        to: TMP_FOLDER,
        files: FILES_AND_FOLDERS_PATH.slice(1),
        transform: {
          transform: (fileContent) => {
            return new Promise((res) => {
              return res(fileContent);
            });
          },
        },
      };


      return Utils.copyAndTransform(data)
      .then((done) => {
        expect(Utils.transform.calledOnce).to.true;
        expect(done).to.true;
      });
    });

    it(`doesn't call the transform function when it is not passed in`, () => {
      let data = {
        from: TEST_ASSESTS_FOLDER,
        to: TMP_FOLDER,
        files: FILES_AND_FOLDERS_PATH.slice(1),
      };

      return Utils.copyAndTransform(data)
      .then((done) => {
        expect(Utils.transform.callCount).to.equal(0);
        expect(done).to.true;
      });
    });
  });

  describe('.readFile', () => {
    it('return a file content', () => {
      return Utils.readFile(FILES_AND_FOLDERS_PATH[1])
      .then((fileContent) => {
        expect(fileContent).to.equal(FILE_CONTENT);
      });
    });
  });

  describe('.writeFile', () => {
    it('calls the outputFile method on fs', () => {
      return Utils.writeFile(FILES_AND_FOLDERS_PATH[1], FILE_CONTENT)
      .then((filePath) => {
        expect(filePath).to.equal(FILES_AND_FOLDERS_PATH[1]);
      });
    });
  });

  describe('.transform', () => {
    it(`reject the promise if no Transformer.transform method isn't present`, () => {
      return Utils.transform({})
      .catch((err) => {
        expect(err.message).to.equal('Transformer must have a transform method');
      });
    });

    it('convert all the text to uppercase', () => {
      return Utils.transform('hello\nworld!!', toUpperCase)
      .then((data) => {
        expect(data).to.equal('HELLO\nWORLD!!');
      });
    });
  });

  describe('outputFilePath', () => {
    it('it returns /tmp/target/package.json', () => {
      const TEST_ASSESTS_FOLDER = path.join(__dirname, './assets/init');
      const TMP_FOLDER = path.join(__dirname, '../tmp/target');
      const templateFilePath = path.join(__dirname, './assets/init/package.json');

      let outputFilePath = Utils.outputFilePath(TEST_ASSESTS_FOLDER, TMP_FOLDER, templateFilePath);

      expect(outputFilePath).to.equal(path.join(__dirname, '../tmp/target/package.json'));
    });
  });

  describe('executeScript', () => {
    it('calls shell.exec with the passed params', () => {
      sinon.stub(shellStub, 'exec').returns({code: 0});

      let script = 'echo hello';

      let result = Utils.executeScript(script);
      expect(result).to.true;
    });
  });
});
