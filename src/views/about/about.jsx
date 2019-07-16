const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const render = require('../../lib/render.jsx');

const Page = require('../../components/page/www/page.jsx');
const Video = require('../../components/video/video.jsx');

require('./about.scss');

const About = () => (
  <div className="inner about">
    <h1 style={{ padding: 10 }}>关于</h1>

    <div>
      <div style={{ padding: 10 }}>
        <p>儒越编程致力于少儿编程教育的推广，为少儿编程爱好者提供一个良好的社区平台。</p>
      </div>
    </div>
  </div>
);

render(<Page><About /></Page>, document.getElementById('app'));
