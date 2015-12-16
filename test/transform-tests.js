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
  describe('replaceNewLineByComment', () => {
    it('replace comments ||| OldName -> componentName', () => {
      let replacer = {
        componentName: 'bye',
      };

      return Transform.replaceNewLineByComment(originalFileContent, replacer)
      .then((data) => {
        expect(data).to.equal(parsedFileContent);
      });
    });

    it('returns an error if replacer is not found', () => {
      return Transform.replaceNewLineByComment(originalFileContent, {})
      .catch((error) => {
        expect(error.message).to.equal(`replacer[componentName] doesn't exist`);
      });
    });
  });
});
