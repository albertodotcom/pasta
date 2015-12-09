import { expect } from 'chai';
import stream from 'stream';
import sinon from 'sinon';

import Transform from '../app/transform';

let readStream = () => {
  var s = new stream.Readable();
  s._read = function noop() {}; // redundant? see update below
  s.push('your text here');
  s.push(null);
  return s;
};

describe('Transform', () => {
  describe('_transform', () => {
    it('execute the function passed in the constructor', (done) => {
      let transformFunc = sinon.spy();
      let transform = new Transform(transformFunc);

      readStream()
      .pipe(transform)
      .on('data', function (item) {
        this.push(item.path);
      })
      .on('end', () => {
        expect(transformFunc.calledOnce).to.true;
        done();
      });
    });
  });
});
