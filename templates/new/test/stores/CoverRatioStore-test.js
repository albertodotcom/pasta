import { expect } from 'chai';
import AltTestingUtils from 'alt/utils/AltTestingUtils';

import alt from '../../app/alt';
import coverRatioStore, {CoverRatioStore} from '../../app/stores/CoverRatioStore';

describe('CoverRatioStore', () => {
  describe('#constructor', () => {
    it('has a structure array, a data array', () => {
      expect(coverRatioStore.state.structure).to.be.a('array');
      expect(coverRatioStore.state.data).to.be.a('array');
    });
  });

  describe('#_coverRatio', () => {
    it('changes the data array for each year to be CFADS / Repayment', () => {
      var coverRatioStore = AltTestingUtils.makeStoreTestable(alt, CoverRatioStore);

      coverRatioStore.data = [
        { title: 2014, data: 0 },
        { title: 2015, data: 0 },
      ];

      let cashFlowStore = {
        structure: [
          {}, {accountName: 'CFADS'},
        ],
        data: [
          { title: 2014, accounts: [0, 100]},
          { title: 2015, accounts: [0, 200]},
        ],
      };

      let debtStore = {
        structure: [
          {}, {}, {accountName: 'Repayment'},
        ],
        data: [
          { title: 2014, accounts: [0, 0, 100]},
          { title: 2015, accounts: [0, 0, 50]},
        ],
      };

      coverRatioStore._coverRatio(cashFlowStore, debtStore);

      expect(coverRatioStore.data[0].data).to.equal(1);
      expect(coverRatioStore.data[1].data).to.equal(4);
    });
  });
});
