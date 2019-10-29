const jar = require('./lib/jar');
const api = require('../src/lib/api');

/**
 * -----------------------------------------------------------------------------
 * L10N
 * -----------------------------------------------------------------------------
 */
(() => {
  /*
   * Bind locale code from cookie if available. Uses navigator language API as a fallback.
   *
   * @return {string}
   */
  const updateLocale = () => {
    let obj = jar.get('scratchlanguage');
    if (typeof obj === 'undefined') {
      obj = window.navigator.userLanguage || window.navigator.language;
      if (['pt', 'pt-pt', 'PT', 'PT-PT'].indexOf(obj) !== -1) {
        obj = 'pt-br'; // default Portuguese users to Brazilian Portuguese due to our user base. Added in 2.2.5.
      }
      /// 获取到时zh-CN，需要兼容转换成小写 -neo
      if ('zh-CN' === obj) {
        obj = 'zh-cn';
      }
    }
    return obj;
  };

  window._locale = updateLocale();
  document.documentElement.lang = window._locale;
})();

/**
 * -----------------------------------------------------------------------------
 * Console warning
 * -----------------------------------------------------------------------------
 */
(() => {
  window.onload = function () {
    /* eslint-disable no-console */
    console.log('%cStop!', 'color: #F00; font-size: 30px; -webkit-text-stroke: 1px black; font-weight:bold');
    console.log(
      'This is part of your browser intended for developers. ' +
      'If someone told you to copy-and-paste something here, ' +
      'don\'t do it! It could allow them to take over your ' +
      'Scratch account, delete all of your projects, or do many ' +
      'other harmful things. If you don\'t understand what exactly ' +
      'you are doing here, you should close this window without doing ' +
      'anything.'
    );
    /* eslint-enable no-console */

    let is_weixin = navigator.userAgent.toLowerCase().match(/MicroMessenger/i) == "micromessenger";
    if (is_weixin) {
      /**
        * 微信配置
        */
      const params = { url: location.href.split('#')[0] };
      api({
        uri: '/wechat/sign',
        params: params,
        withCredentials: true
      }, (err, res) => {
        // console.log('/wechat/sign err = ' + err);
        // console.log('/wechat/sign res = ' + JSON.stringify(res));

        if (!err && res) {
          /// 如果没有传递过来appid，则微信接口出错，前端不处理后续流程
          if(!res.appId) return;

          /**
           * 微信JSSDK注入配置信息
           */
          wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: res.appId, // 必填，公众号的唯一标识
            timestamp: res.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.nonceStr, // 必填，生成签名的随机串
            signature: res.signature,// 必填，签名
            jsApiList: [
              'updateAppMessageShareData',
              'updateTimelineShareData'
            ] // 必填，需要使用的JS接口列表
          });

          wx.ready(function () {
            /**
             * config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，
             * config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，
             * 则须把相关接口放在ready函数中调用来确保正确执行。
             * 对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
             * */
            // console.log('wx ready');

            // 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
            wx.updateAppMessageShareData({
              title: document.title, // 分享标题
              desc: location.href, // 分享描述
              link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: 'https://scratch.ruyue.xyz/images/儒.png', // 分享图标
              success: function () {
                // 设置成功
                // console.log('wx.updateAppMessageShareData success');
              },
              fail: function (res) {
                // 设置失败
                // console.log('wx.updateAppMessageShareData fail');
              }
            });

            // 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
            wx.updateTimelineShareData({
              title: document.title, // 分享标题
              link: location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
              imgUrl: 'https://scratch.ruyue.xyz/images/儒.png', // 分享图标
              success: function () {
                // 设置成功
                // console.log('wx.updateTimelineShareData success');
              },
              fail: function () {
                // 设置失败
                // console.log('wx.updateTimelineShareData fail');
              }
            });
          });

          wx.error(function (res) {
            /**
             * config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，
             * 也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
             */
            // console.log('wx error res = ' + JSON.stringify(res));
          });
        }
      });
    }
  };
})();
