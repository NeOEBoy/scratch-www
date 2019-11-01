const React = require('react');

const FooterBox = require('../container/footer.jsx');

require('./footer.scss');

const Footer = () => (
  <FooterBox>
    <div className="copyright">
      <div>儒越编程 地址: 夏商·书香名苑·2栋2单元207室</div>
      <div>
        <span>&copy; 2019 漳州儒越教育咨询服务有限公司 </span>
        <a href="http://www.beian.miit.gov.cn">闽ICP备19021080号</a>
      </div>
    </div>
  </FooterBox>
);

module.exports = Footer;
