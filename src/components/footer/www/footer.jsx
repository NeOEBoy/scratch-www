const FormattedMessage = require('react-intl').FormattedMessage;
const injectIntl = require('react-intl').injectIntl;
const intlShape = require('react-intl').intlShape;
const React = require('react');

const FooterBox = require('../container/footer.jsx');
const LanguageChooser = require('../../languagechooser/languagechooser.jsx');

require('./footer.scss');

const Footer = props => (
  <FooterBox>
    <LanguageChooser locale={props.intl.locale} />

    <div className="copyright">
      <p>积木编程-小窗口大世界</p>
    </div>
  </FooterBox>
);

Footer.propTypes = {
  intl: intlShape.isRequired
};

module.exports = injectIntl(Footer);
