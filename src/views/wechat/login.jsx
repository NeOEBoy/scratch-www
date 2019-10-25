const React = require('react');
const render = require('../../lib/render.jsx');
const navigationActions = require('../../redux/navigation.js');
const connect = require('react-redux').connect;

import { message } from 'antd';

require('./login.scss');

class Login extends React.Component { // eslint-disable-line react/no-multi-comp
  constructor(props) {
    super(props);
  }

  GetUrlParam(paraName) {
    var url = document.location.toString();
    var arrObj = url.split("?");

    if (arrObj.length > 1) {
      var arrPara = arrObj[1].split("&");
      var arr;

      for (var i = 0; i < arrPara.length; i++) {
        arr = arrPara[i].split("=");

        if (arr != null && arr[0] == paraName) {
          return  decodeURIComponent(arr[1]);
        }
      }
      return "";
    }
    else {
      return "";
    }
  }

  componentDidMount() {
    let code = this.GetUrlParam('code');
    let fromWhere = this.GetUrlParam('fromWhere');

    // message.info(code);

    let formData = { code: code };
    this.props.onOpenLogIn(formData, (result) => {
      if(result.success) {
        // 跳转到原来页面
        document.location = fromWhere;
      }
    });
  }

  render() {
    return (
      <div style={{ position: 'fixed', backgroundColor: 'gray', width: '100%', height: '100%' }}>
        <h1 style={{}}>微信登录中</h1>
      </div>
    );
  }
}

const mapStateToProps = state => ({
});

const mapDispatchToProps = dispatch => ({
  onOpenLogIn: (formData, callback) => {
    dispatch(navigationActions.handleOpenLogIn(formData, callback));
  }
});

let LoginConnected = connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);

render(<LoginConnected />, document.getElementById('app'));
