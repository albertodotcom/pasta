import fs from 'fs';
import { Transform } from 'stream';
import _ from 'lodash';

let file = fs.createReadStream('./test/assets/component/tl.js');
let output = fs.createWriteStream('./tmp/Test.js');

class Fill extends Transform {
  _transform(chunk, enc, done) {
    this.push (
      _.chain(chunk)
      .toString()
      .split('\n')
      .map(string => { return string.toUpperCase(); })
      .join('\n')
    );

    done();
  }
}

file.pipe(new Fill()).pipe(output);
