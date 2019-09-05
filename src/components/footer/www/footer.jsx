const React = require('react');

const FooterBox = require('../container/footer.jsx');

require('./footer.scss');

const Footer = () => (
  <FooterBox>
    <div className="copyright">
      <p>儒越编程 地址: 夏商·书香名苑·2栋2单元207室</p>
    </div>
  </FooterBox>
);

module.exports = Footer;
