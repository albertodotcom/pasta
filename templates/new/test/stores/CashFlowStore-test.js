import { expect } from 'chai';
import AltTestingUtils from 'alt/utils/AltTestingUtils';

import alt from '../../app/alt';
import cashFlowStoreWrapped, {CashFlowStore} from '../../app/stores/CashFlowStore';

describe('CashFlowStore', () => {
  let cashFlowStoreUnwrapped;

  beforeEach(() => {
    cashFlowStoreUnwrapped = AltTestingUtils.makeStoreTestable(alt, CashFlowStore);
  });

  describe('#constructor', () => {
    it('has a structure array, a data array', () => {
      expect(cashFlowStoreWrapped.state.structure).to.be.a('array');
      expect(cashFlowStoreWrapped.state.data).to.be.a('array');
    });

    it('has 3 specific accountTypes', () => {

      let accountTypes = [
        {value: 'annual accounts', label: 'annual accounts'},
        {value: 'management accounts', label: 'management accounts'},
        {value: 'forecast', label: 'forecast'},
      ];

      expect(cashFlowStoreWrapped.state.accountTypes).to.deep.equal(accountTypes);
    });
  });

  describe('#computeData', () => {
    it('computes the accounts based on the sumOf field', () => {
      cashFlowStoreUnwrapped.data[0].accounts = [0, 1, 2, 3, 4, 0];
      let computedData = cashFlowStoreUnwrapped.computeData();
      expect(computedData[0].accounts).to.deep.equal([0, 1, 2, 3, 4, 0, 10]);
    });

    it('computes the accounts based on the sumOf field even if a value has been delete', () => {
      cashFlowStoreUnwrapped.data[0].accounts = [0, 1, 2, 3, 4, 0];
      delete cashFlowStoreUnwrapped.data[0].accounts[2];

      let computedData = cashFlowStoreUnwrapped.computeData();
      expect(computedData[0].accounts).to.deep.equal([0, 1, undefined, 3, 4, 0, 8]);
    });
  });

  describe('#handleUpdateColumnCell', () => {
    it('update the 2nd year replacing the 4th element in accounts with 10', () => {
      cashFlowStoreUnwrapped.handleUpdateColumnCell({
        column: 1,
        index: 3,
        value: 10,
      });

      expect(cashFlowStoreUnwrapped.data[0].accounts).to.deep.equal([0, 0, 0, 0, 0, 0, 0]);
      expect(cashFlowStoreUnwrapped.data[1].accounts).to.deep.equal([0, 0, 0, 10, 0, 0, 10]);
    });
  });

  describe('#handleUpdateAccountType', () => {
    it('updates the account type for the first update', () => {
      expect(cashFlowStoreUnwrapped.data[0].accountType).to.deep.equal('annual accounts');

      cashFlowStoreUnwrapped.handleUpdateAccountType({
        yearIndex: 0,
        newValue: 'forecast',
      });

      expect(cashFlowStoreUnwrapped.data[0].accountType).to.deep.equal('forecast');
    });

    it('doesn\'t change the accountType if the passed in value doesn\'t exit');
  });

  describe('#_handleAddAdjustment', () => {
    it('adds an adjustment to the structure', () => {
      let structureLength = cashFlowStoreUnwrapped.structure.length;

      cashFlowStoreUnwrapped.handleAddAdjustment();

      expect(cashFlowStoreUnwrapped.structure.length).to.equal(structureLength + 1);
    });

    it('adds an object with accountName, isTitle and isEditable', () => {
      cashFlowStoreUnwrapped.handleAddAdjustment();

      let adjustment = cashFlowStoreUnwrapped.structure[cashFlowStoreUnwrapped.structure.length - 2];

      expect(adjustment).to.deep.equal({
        accountName: '',
        isTitle: false,
        isEditable: true,
      });
    });

    it('adds 0 to all the years at the second last position');
    it('adds the element index to the last element of the structure');
  });

  describe('#_handleChangeAdjustmentLabel', () => {
    it('changes the accountName field in the structure element');
  });

  describe('#handleRemoveAdjustment', () => {
    it('removes the item from the structure');
    it('deletes the item from the data for every year, without changing the data indexes');
    it('recomputes the CFADS fields');
  });

  describe('#getFieldsValue', () => {
    it('returns an array of objects { title: string, accountType: string, value: Number }', () => {

      cashFlowStoreUnwrapped.data[1].accounts[1] = 50;
      cashFlowStoreUnwrapped.data[2].accounts[1] = 100;

      let result = cashFlowStoreUnwrapped.getFieldsValue('EBITDA');
      let expectedResult = [
        { title: 'FY2013', accountType: 'annual accounts', value: 0 },
        { title: 'FY2014', accountType: 'annual accounts', value: 50 },
        { title: 'FY2015', accountType: 'forecast', value: 100 },
        { title: 'FY2016', accountType: 'forecast', value: 0 },
      ];

      expect(result).to.deep.equal(expectedResult);
    });

    it('returns an array of objects { title: string, accountType: string, value: null }', () => {
      let result = cashFlowStoreUnwrapped.getFieldsValue('doesn exit');
      let expectedResult = [
        { title: 'FY2013', accountType: 'annual accounts', value: null },
        { title: 'FY2014', accountType: 'annual accounts', value: null },
        { title: 'FY2015', accountType: 'forecast', value: null },
        { title: 'FY2016', accountType: 'forecast', value: null },
      ];

      expect(result).to.deep.equal(expectedResult);
    });
  });
});
