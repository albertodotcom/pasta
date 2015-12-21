let { expect } = require('chai');
let path = require('path');
let sinon = require('sinon');
let prequire = require('proxyquire');

let shellStub = {};

let Utils = prequire('../src/utils', {
  'shelljs': shellStub,
});

const TEST_ASSESTS_FOLDER = path.join(__dirname, './assets/');
const TEST_ASSESTS_FOLDER_INIT = path.join(TEST_ASSESTS_FOLDER, 'init');
const TEST_ASSESTS_FOLDER_COMPONENT = path.join(TEST_ASSESTS_FOLDER, 'create', 'component');
const FILES_AND_FOLDERS_PATH = [
  '/Users/aforni/Projects/react-cli/test/assets/init',
  '/Users/aforni/Projects/react-cli/test/assets/init/package.json',
];
const TMP_FOLDER = path.join(__dirname, '../tmp');

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
      return Utils.ls({from: TEST_ASSESTS_FOLDER_INIT})
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
        from: TEST_ASSESTS_FOLDER_INIT,
        to: path.join(TMP_FOLDER, 'init'),
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
      .then((resultFilePaths) => {
        expect(Utils.transform.calledOnce).to.true;
        expect(resultFilePaths).to.deep.equal(['/Users/aforni/Projects/react-cli/tmp/init/package.json']);
      });
    });

    it(`doesn't call the transform function when it is not passed in`, () => {
      let data = {
        from: TEST_ASSESTS_FOLDER_INIT,
        to: path.join(TMP_FOLDER, 'init'),
        files: FILES_AND_FOLDERS_PATH.slice(1),
      };

      return Utils.copyAndTransform(data)
      .then((resultFilePaths) => {
        expect(Utils.transform.callCount).to.equal(0);
        expect(resultFilePaths).to.deep.equal(['/Users/aforni/Projects/react-cli/tmp/init/package.json']);
      });
    });

    it('changes the output file names according to the outputFileName', () => {
      let data = {
        from: TEST_ASSESTS_FOLDER_COMPONENT,
        to: path.join(TMP_FOLDER, 'components'),
        files: [
          path.join(TEST_ASSESTS_FOLDER_COMPONENT, 'template.js'),
          path.join(TEST_ASSESTS_FOLDER_COMPONENT, 'template-tests.js'),
        ],
        outputFileName: 'Pesto',
      };

      return Utils.copyAndTransform(data)
      .then((resultFilePaths) => {
        expect(resultFilePaths).to.deep.equal([
          '/Users/aforni/Projects/react-cli/tmp/components/Pesto.js',
          '/Users/aforni/Projects/react-cli/tmp/components/Pesto-tests.js',
        ]);
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

  describe('.outputFilePath', () => {
    it('it returns /tmp/target/package.json', () => {
      const TMP_FOLDER_TARGET = path.join(TMP_FOLDER, 'target');
      const TEMPLATE_FILEPATH = path.join(TEST_ASSESTS_FOLDER_INIT, 'package.json');

      let outputFilePath = Utils.outputFilePath(TEST_ASSESTS_FOLDER_INIT, TMP_FOLDER_TARGET, TEMPLATE_FILEPATH);

      expect(outputFilePath).to.equal(path.join(TMP_FOLDER_TARGET, 'package.json'));
    });

    it('uses the outputFileName to construct the new file path', () => {
      const TMP_FOLDER_TARGET = path.join(TMP_FOLDER, 'target');
      const TEMPLATE_FILEPATH = path.join(TEST_ASSESTS_FOLDER_COMPONENT, 'template-test.js');
      let outputFilePath = Utils.outputFilePath(TEST_ASSESTS_FOLDER, TMP_FOLDER_TARGET, TEMPLATE_FILEPATH, 'Lasagne');

      expect(outputFilePath).to.equal(path.join(TMP_FOLDER_TARGET, 'create', 'component', 'Lasagne-test.js'));
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
