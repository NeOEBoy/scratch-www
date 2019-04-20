const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const render = require('../../lib/render.jsx');

const Page = require('../../components/page/www/page.jsx');
const Video = require('../../components/video/video.jsx');

require('./about.scss');

const About = () => (
  <div className="inner about">
    <h1>关于积木编程</h1>

    <div>
      <div>
        <p>使用 Scratch，你可以编写属于你的互动媒体，像是故事、游戏、动画，然后你可以将你的创意分享给全世界。</p>
        <p>Scratch 帮助年轻人更具创造力、逻辑力、协作力。 这些都是生活在 21 世纪不可或缺的基本能力。</p>
        <p>Scratch是MIT媒体实验室终生幼儿园小组开发的一个免费项目。</p>
      </div>
    </div>
  </div>
);

render(<Page><About /></Page>, document.getElementById('app'));
