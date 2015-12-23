import { expect } from 'chai';

import debtStore from '../../app/stores/DebtStore';

describe('DebtStore', () => {
  describe('#constructor', () => {
    it('has a structure array, a data array and a debtDetails object', () => {
      expect(debtStore.state.structure).to.be.a('array');
      expect(debtStore.state.data).to.be.a('array');
      expect(debtStore.state.debtDetails).to.be.a('object');
    });
  });
});
