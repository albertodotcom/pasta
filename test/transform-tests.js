let { expect } = require('chai');

let { Transform } = require('../src/transform');

let originalFileContent = `\
// ||| hello -> componentName
function hello {
  console.log('hello world');
}

var hello = 'hello world';
`;

let parsedFileContent = `\
function bye {
  console.log('hello world');
}

var hello = 'hello world';
`;

describe('Transform', () => {
  describe('transform', () => {
    it('has a transform method', () => {
      expect(new Transform().transform).to.be.a('function');
    });

    it('replace comments ||| OldName -> componentName', () => {
      let replacer = {
        componentName: 'bye',
      };

      let transform = new Transform(replacer);
      return transform.transform(originalFileContent)
      .then((data) => {
        expect(data).to.equal(parsedFileContent);
      });
    });

    it('returns an error if replacer is not found', () => {
      let transform = new Transform({});

      return transform.transform(originalFileContent)
      .catch((error) => {
        expect(error.message).to.equal(`replacer[componentName] doesn't exist`);
      });
    });
  });
});
