var { expect } = require('chai');
var prequire = require('proxyquire');

// ||| MyComponent -> componentName
var MyComponent = prequire('./MyComponent', {});

// ||| MyComponent -> componentName
describe('MyComponent', () => {
  describe('#render', () => {
    it('renders', () => {
      let component = TestUtils.renderIntoDocument(
        // ||| MyComponent -> componentName
        <MyComponent value={-10} onBlur={() => {}}/>
      );

      let cellNode = ReactDOM.findDOMNode(component);
      expect(cellNode).to.exist;
    });
  });
});
