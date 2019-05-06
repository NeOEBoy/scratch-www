const React = require('react');

const FooterBox = require('../container/footer.jsx');

require('./footer.scss');

const Footer = () => (
  <FooterBox>
    <div className="copyright">
      <p>积木编程-小窗口大世界</p>
    </div>
  </FooterBox>
);

module.exports = Footer;
