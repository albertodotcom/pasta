let { expect } = require('chai');
let path = require('path');
let sinon = require('sinon');
let prequire = require('proxyquire');
let fsExtra = require('fs-extra');

let shellStub = {};

let Utils = prequire('../src/utils', {
  'shelljs': shellStub,
});

const TEST_ASSESTS_FOLDER = path.join(__dirname, './assets/');
const TEST_ASSESTS_FOLDER_INIT = path.join(TEST_ASSESTS_FOLDER, 'init');
const TEST_ASSESTS_FOLDER_COMPONENT = path.join(TEST_ASSESTS_FOLDER, 'create', 'component');
const FILES_AND_FOLDERS_PATH = [
  TEST_ASSESTS_FOLDER_INIT,
  path.join(TEST_ASSESTS_FOLDER_INIT, 'package.json'),
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
      return Utils.ls({ from: TEST_ASSESTS_FOLDER_INIT })
      .then(({ filesAndFolders }) => {
        expect(filesAndFolders).to.deep.equal(FILES_AND_FOLDERS_PATH);
      });
    });
  });

  describe('.filterFiles', () => {
    it('returns only package.json', () => {
      return Utils.filterFiles({ filesAndFolders: FILES_AND_FOLDERS_PATH })
      .then(({ files }) => {
        expect(files).to.deep.equal([FILES_AND_FOLDERS_PATH[1]]);
      });
    });
  });

  describe('.readTransformWrite', () => {
    let file = FILES_AND_FOLDERS_PATH[1];

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

    beforeEach(() => {
      sinon.spy(Utils, 'readFile');
      sinon.spy(Utils, 'transform');
      sinon.spy(Utils, 'outputFilePath');
      sinon.spy(Utils, 'writeFile');
    });

    afterEach(() => {
      Utils.readFile.restore();
      Utils.transform.restore();
      Utils.outputFilePath.restore();
      Utils.writeFile.restore();
    });

    it('calls read transform outputFilePath and write', () => {
      return Utils.readTransformWrite(file, data)
      .then(() => {
        expect(Utils.readFile.calledOnce).to.true;
        expect(Utils.transform.calledOnce).to.true;
        expect(Utils.outputFilePath.calledOnce).to.true;
        expect(Utils.writeFile.calledOnce).to.true;
      });
    });

    it('calls read outputFilePath and write, but not transform, if transform is null', () => {
      let testData = Object.assign({}, data, { transform: null });
      return Utils.readTransformWrite(file, testData)
      .then(() => {
        expect(Utils.readFile.calledOnce).to.true;
        expect(Utils.transform.calledOnce).to.false;
        expect(Utils.outputFilePath.calledOnce).to.true;
        expect(Utils.writeFile.calledOnce).to.true;
      });
    });

    it('calls read outputFilePath and write, but not transform, if excludeTransformPath match', () => {
      let testData = Object.assign({}, data, { excludeTransformPath: new RegExp('/init', 'ig') });
      return Utils.readTransformWrite(file, testData)
      .then(() => {
        expect(Utils.readFile.calledOnce).to.true;
        expect(Utils.transform.calledOnce).to.false;
        expect(Utils.outputFilePath.calledOnce).to.true;
        expect(Utils.writeFile.calledOnce).to.true;
      });
    });
  });

  describe('.copyAndTransform', () => {
    beforeEach(() => {
      sinon.spy(Utils, 'transform');
      sinon.spy(Utils, 'readTransformWrite');
    });

    afterEach(() => {
      Utils.transform.restore();
      Utils.readTransformWrite.restore();
    });

    it('calls readTransformWrite for each file', () => {
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
        expect(Utils.readTransformWrite.calledOnce).to.true;
        expect(resultFilePaths).to.deep.equal([path.join(TMP_FOLDER, 'init/package.json')]);
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
        expect(resultFilePaths).to.deep.equal([path.join(TMP_FOLDER, 'init/package.json')]);
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
          path.join(TMP_FOLDER, 'components/Pesto.js'),
          path.join(TMP_FOLDER, 'components/Pesto-tests.js'),
        ]);
      });
    });
  });

  describe('.transformInPlace', () => {
    const OUTPUTFILE = path.join(TMP_FOLDER, 'baz', 'foo.js');

    beforeEach(() => {
      sinon.spy(Utils, 'ls');
      sinon.spy(Utils, 'filterFiles');
      sinon.stub(Utils, 'readTransformWrite').returns(Promise.resolve());

      fsExtra.outputFileSync(OUTPUTFILE, 'hello world');
    });

    afterEach(() => {
      Utils.ls.restore();
      Utils.filterFiles.restore();
      Utils.readTransformWrite.restore();

      fsExtra.removeSync(OUTPUTFILE);
    });

    it('calls ls, filterFiles and then readTransformWrite for every file', () => {
      let data = {
        from: 'http://fancyRepo',
        to: path.join(TMP_FOLDER, 'baz'),
      };

      return Utils.transformInPlace(data)
      .then(() => {
        expect(Utils.ls.args[0][0].from).to.equal(data.to);
        expect(Utils.filterFiles.calledOnce).to.true;

        let rtwArgs = Utils.readTransformWrite.args[0];

        expect(rtwArgs[0]).to.equal(OUTPUTFILE);
        expect(rtwArgs[1]).to.have.deep.property('from', data.to);
        expect(rtwArgs[1]).to.have.deep.property('to', data.to);
        expect(rtwArgs[1].files).to.deep.equal([OUTPUTFILE]);
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

    it('returns the expected path', () => {
      let outputFilePath = Utils.outputFilePath(
        '/Users/aforni/Projects/sandbox/memory/templates/create/component',
        '/Users/aforni/Projects/sandbox/memory/src/components',
        '/Users/aforni/Projects/sandbox/memory/templates/create/component/template.js',
        'Ragu'
      );

      expect(outputFilePath).to.equal('/Users/aforni/Projects/sandbox/memory/src/components/Ragu.js');
    });
  });

  describe('.executeScript', () => {
    it('executes the script and returns code 0', () => {
      let script = 'ls';

      return Utils.executeScript(script)
      .then((code) => {
        expect(code).to.equal(0);
      });
    });
  });

  describe('.isRepo', () => {
    it('returns true for every protocol', () => {
      let protocols = [
        'ssh://[user@]host.xz[:port]/path/to/repo.git/',
        'git://host.xz[:port]/path/to/repo.git/',
        'http://host.xz[:port]/path/to/repo',
        'https://host.xz[:port]/path/to/repo.git/',
        'ftp://host.xz[:port]/path/to/repo.git/',
        'ftps://host.xz[:port]/path/to/repo.git/',
        'rsync://host.xz/path/to/repo',
      ];

      protocols.forEach(protocol => {
        expect(Utils.isRepo(protocol)).to.true;
      });
    });

    it('returns false for a folder', () => {
      let folders = [
        '.',
        __dirname,
      ];

      folders.forEach(protocol => {
        expect(Utils.isRepo(protocol)).to.false;
      });
    });
  });

  describe('.checkFolderExists', () => {
    it('rejects the promise if a folder doesnt exist', () => {
      let notExistingFolder = path.join(__dirname, './folderNotExist');

      return Utils.checkFolderExists(notExistingFolder)
      .catch((err) => {
        expect(err).to.equal(`"${notExistingFolder}" doesn't exist`);
      });
    });

    it('rejects the promise if the path is a file', () => {
      let filePath = path.join(TEST_ASSESTS_FOLDER_INIT, 'package.json');

      return Utils.checkFolderExists(filePath)
      .catch((err) => {
        expect(err).to.equal(`"${filePath}" is a file not a folder`);
      });
    });

    it('resolves the promise if the path is a folder', () => {
      return Utils.checkFolderExists(__dirname)
      .then((isFolder) => {
        expect(isFolder).to.true;
      });
    });
  });

  describe('.loadConfigFile', () => {
    it('returns a json file if it exists', () => {
      expect(Utils.loadConfigFile(path.join(__dirname, 'assets')))
      .to.deep.equal({
        'create': {
          'component': {
            'from': './test/assets/create/component/',
            'to': './src/containers/',
          },
        },
      });
    });

    it('returns an error if the file is not well formatted', () => {
      expect(() => Utils.loadConfigFile(path.join(__dirname, 'assets'), '.pastaBroken.json'))
      .to.throw('/Users/aforni/Projects/pasta/test/assets/.pastaBroken.json is not valid json');
    });

    it('returns an empty object if the config file does not exists', () => {
      expect(Utils.loadConfigFile(path.join(__dirname, 'notExistingFolder')))
      .to.null;
    });
  });
});
