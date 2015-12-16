let Transform = {
  replaceNewLineByComment(fileContent, replacer) {
    let findSpecialComment = /\|\|\|\s([\w\d]+)\s->\s([\w\d]+)/;

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
          let replaceWith = replacer[newValue];

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
  },
};

module.exports = { Transform };
