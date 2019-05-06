const React = require('react');

const render = require('../../lib/render.jsx');
const splashActions = require('../../redux/splash.js');

const Page = require('../../components/page/www/page.jsx');
const SplashPresentation = require('./presentation.jsx');

const Splash = () => <SplashPresentation />

render(
  <Page><Splash /></Page>,
  document.getElementById('app'),
  { splash: splashActions.splashReducer }
);
