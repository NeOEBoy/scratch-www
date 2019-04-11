const React = require('react');
const FormattedMessage = require('react-intl').FormattedMessage;
const render = require('../../lib/render.jsx');

const Page = require('../../components/page/www/page.jsx');
const Video = require('../../components/video/video.jsx');

require('./about.scss');

const About = () => (
    <div className="inner about">
        <h1><FormattedMessage id="general.aboutScratch" /></h1>

        <div className="masthead">
            <div>
                <p><FormattedMessage id="about.introOne" /></p>
                <p><FormattedMessage id="about.introTwo" /></p>
                <p><FormattedMessage id="about.introThree" /></p>
            </div>

            <div className="video-container">
                <Video
                    className="about-scratch-video"
                    videoId="sucupcznsp"
                />
            </div>
        </div>
    </div>
);

render(<Page><About /></Page>, document.getElementById('app'));
