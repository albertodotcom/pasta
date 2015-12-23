import { expect } from 'chai';

import Numbers from '../../app/utils/Numbers';

describe('Numbers', () => {

  describe('#formatMoney', () => {
    it('returns 1,000 when 1000.2222', () => {
      let num = Numbers.formatMoney(1000.2222);

      expect(num).to.equal('1,000');
    });

    it('returns 1,000.22 when 1000.2222', () => {
      let num = Numbers.formatMoney(1000.2222, 2);

      expect(num).to.equal('1,000.22');
    });
  });

  describe('#computeFormula', () => {
    it('computes the values based on a formula, data = array', () => {
      let data = [4, 2, 3];
      let formula = '(${0} / ${1}) + ${2}';
      let result = Numbers.computeFormula(formula, data);
      expect(result).to.equal(5);
    });

    it('returns 0 when no data is passed', () => {
      let data = null;
      let formula = '(${0} / ${1}) + ${2}';
      let result = Numbers.computeFormula(formula, data);
      expect(result).to.equal(0);
    });

    it('computes the values based on a formula, data = object', () => {
      let data = {
        amount: 1000,
        interest: 500,
        months: 36,
      };
      let formula = '${amount} * ${months} * (${interest} / 10000) / 2 / ${months}';
      let result = Numbers.computeFormula(formula, data);
      expect(result).to.equal(25);
    });

    it('returns 0 when the operation in impossible', () => {
      let data = [0, 0, 0];
      let formula = '(${0} / ${1}) + ${2}';
      let result = Numbers.computeFormula(formula, data);
      expect(result).to.equal(0);
    });

    it('returns 2 decimals', () => {
      let data = {
        amount: 1000,
        interest: 373,
        months: 36,
      };
      let formula = '${amount} * ${months} * (${interest} / 10000) / 2 / ${months}';
      let result = Numbers.computeFormula(formula, data, 2);

      expect(result).to.equal(18.65);
    });

    it('returns 0 if the operation compute to infinity', () => {
      let formula = '${0} / ${1}';
      let result = Numbers.computeFormula(formula, [1, 0]);

      expect(result).to.equal(0);
    });
  });

  describe('#computeData', () => {
    it('returns a new array with a computed value', () => {
      let structure = [
        {}, {}, {}, {formula: '(${0} / ${1}) - ${2}'},
      ];
      let data = [4, 2, 5];

      let newData = Numbers.computeData(structure, data);
      expect(newData).to.deep.equal([4, 2, 5, -3]);
    });

    it('returns the same array if the structure doesn\' contain formulas', () => {
      let structure = [
        {}, {}, {}, {},
      ];
      let data = [4, 2, 5, -3];

      let newData = Numbers.computeData(structure, data);
      expect(newData).to.deep.equal([4, 2, 5, -3]);
    });
  });

  describe('#computeDataArray', () => {
    it('returns an array of data', () => {
      let structure = [
        {}, {}, {}, {formula: '(${0} / ${1}) - ${2}'},
      ];
      let data = [
        [4, 2, 5],
        [4, 1, 5],
      ];

      let newData = Numbers.computeDataArray(structure, data);
      expect(newData).to.deep.equal([[4, 2, 5, -3], [4, 1, 5, -1]]);
    });
  });
});

