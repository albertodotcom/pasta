import { Transform } from 'stream';

class Transformer extends Transform {
  constructor(func) {
    super();

    this._transform = function (chunk, enc, cb) {
      let modifiedChunck = func(chunk, enc) || chunk;
      this.push(modifiedChunck);
      cb();
    };
  }
}

export default Transformer;
