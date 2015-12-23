let React = require('react');
let ReactDOM = require('react-dom');
let { Router, Route, IndexRoute } = require('react-router');
let { createHistory } = require('history');

let Index = require('./Index');

const history = createHistory();

class App extends React.Component {
  render() {
    return (
      <div>
        <h1>My App</h1>
        {this.props.children}
      </div>
    );
  }
}

ReactDOM.render((
  <Router history={history}>
    <Route path='/' component={App}>
      <IndexRoute component={Index} />
      <Route path='/index' component={Index} />
    </Route>
  </Router>
), document.getElementById('app'));
