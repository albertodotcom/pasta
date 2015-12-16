class Transform {
  constructor(replacer) {
    this.replacer = replacer;
  }

  transform(fileContent) {
    let findSpecialComment = /\|\|\|\s([\S]+?)\s->\s([\S]+)/;

    return new Promise((res) => {
      res(fileContent
      .split('\n')
      .map((line, index, lines) => {
        // use previous line special comment to perform a replace in the current line
        if (index === 0) {
          return line;
        }

        let regExResult = findSpecialComment.exec(lines[index - 1]);

        if (regExResult != null && regExResult.length >= 3) {
          let [, oldValue, newValue] = regExResult;
          let replaceWith = this.replacer[newValue];

          if (replaceWith == null) {
            throw new Error(`replacer[${newValue}] doesn't exist`);
          }

          return line.replace(oldValue, replaceWith);
        }

        return line;
      })
      .filter((line) => {
        // delete special comment lines
        return findSpecialComment.exec(line) == null;
      })
      .join('\n'));
    });
  }
};

module.exports = { Transform };
