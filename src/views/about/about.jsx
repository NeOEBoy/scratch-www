const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const render = require('../../lib/render.jsx');

const Page = require('../../components/page/www/page.jsx');
const Video = require('../../components/video/video.jsx');

require('./about.scss');

const About = () => (
  <div className="inner about">
    <h1 style={{ padding: 10 }}>关于积木编程</h1>

    <div>
      <div style={{ padding: 10 }}>
        <p>小窗口连接大世界，我们支持你通过Scratch创作工具，创建你自己的窗口，连接到广阔的世界。</p>
      </div>
    </div>
  </div>
);

render(<Page><About /></Page>, document.getElementById('app'));
