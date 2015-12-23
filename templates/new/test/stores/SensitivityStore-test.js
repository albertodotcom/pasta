import { expect } from 'chai';
import AltTestingUtils from 'alt/utils/AltTestingUtils';

import alt from '../../app/alt';
import sensitivityStoreWrapped, {SensitivityStore} from '../../app/stores/SensitivityStore';

describe('SensitivityStore', () => {
  let sensitivityStoreUnwrapped;

  beforeEach(() => {
    sensitivityStoreUnwrapped = AltTestingUtils.makeStoreTestable(alt, SensitivityStore);
  });

  describe('#constructor', () => {
    it('has an "on" key and a "data" key', () => {
      expect(sensitivityStoreWrapped.state.on).to.be.a('boolean');
      expect(sensitivityStoreWrapped.state.data).to.be.a('array');
    });
  });

});
