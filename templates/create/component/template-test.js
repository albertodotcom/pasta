let { expect } = require('chai');
let prequire = require('proxyquire');

// ||| MyComponent -> componentName
let MyComponent = prequire('./MyComponent', {});

// ||| MyComponent -> componentName
describe('MyComponent', () => {
  describe('#render', () => {
    it('renders', () => {
      let component = TestUtils.renderIntoDocument(
        // ||| MyComponent -> componentName
        <MyComponent />
      );

      let cellNode = ReactDOM.findDOMNode(component);
      expect(cellNode).to.exist;
    });
  });
});
