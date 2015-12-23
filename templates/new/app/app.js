import FastClick from 'fastclick';

window.addEventListener('load', () => {
  FastClick.attach(document.body);
});

require('velocity-animate');
require('velocity-animate/velocity.ui');

require('./style/main.scss');
require('./components/App.js');
