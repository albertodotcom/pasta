import { expect } from 'chai';
import React, {PropTypes} from 'react';
import TestUtils from 'react-addons-test-utils';
import ReactDOM from 'react-dom';
import sinon from 'sinon';

import Cell from '../../../app/components/App/Cell';

describe('Cell', () => {
  let cell;
  let cellNode;

  beforeEach(() => {
    cell = TestUtils.renderIntoDocument(
      <Cell value={-10} onBlur={() => {}}/>
    );

    cellNode = ReactDOM.findDOMNode(cell);
  });

  describe('#render', () => {
    it('renders an input', () => {
      expect(cellNode._localName).to.equal('input');
    });

    it('checks that onBlur is passed in as function', () => {
      expect(Cell.propTypes.onBlur).to.deep.equal(PropTypes.func.isRequired);
    });

    it('checks that value is passed in as number', () => {
      expect(Cell.propTypes.value).to.deep.equal(PropTypes.number);
    });

    it('checks that className is passed in as string', () => {
      expect(Cell.propTypes.className).to.deep.equal(PropTypes.string);
    });

  });

  describe('#_onFocus', () => {
    it.skip('sets the value on the input to the formatted value', () => {
      expect(cell.props.value).to.equal(-10);
      expect(cellNode.value).to.equal('(10)');

      TestUtils.Simulate.focus(cellNode);
      expect(cellNode.value).to.equal('-10');
    });
  });

  describe('#_onBlur', () => {
    let onBlurMock;

    let createCell = (value) => {
      let cell = TestUtils.renderIntoDocument(
        <Cell value={value} onBlur={onBlurMock} />
      );

      let cellNode = ReactDOM.findDOMNode(cell);

      TestUtils.Simulate.blur(cellNode);
    };

    beforeEach(() => {
      onBlurMock = sinon.spy();
    });

    it('executes the prop.onBlur function passing the current value', () => {
      createCell(20);
      expect(onBlurMock.calledWith(20)).to.true;

    });

    it('executes prop.onBlur passing 0 if the input is not a number', () => {
      createCell('hello');
      expect(onBlurMock.calledWith(0)).to.true;
    });

  });
});

