// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
export function makeDateFormat(date, fmt) {
  var o = {
    "M+": date.getMonth() + 1,                 //月份   
    "d+": date.getDate(),                    //日   
    "h+": date.getHours(),                   //小时   
    "m+": date.getMinutes(),                 //分   
    "s+": date.getSeconds(),                 //秒   
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
    "S": date.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

export function converDateBy(stringTime) {
  var minute = 1000 * 60;
  var hour = minute * 60;
  var day = hour * 24;
  var week = day * 7;
  var month = day * 30;

  var time1 = new Date().getTime();//当前的时间戳
  console.log(time1);
  var time2 = Date.parse(new Date(stringTime));//指定时间的时间戳
  console.log(time2);
  var time = time1 - time2;

  var result = '';
  if (time < 0) {
    // alert("设置的时间不能早于当前时间！");
  } else if (time / month >= 1) {
    result = "更新于" + parseInt(time / month) + "月前！";
  } else if (time / week >= 1) {
    result = "更新于" + parseInt(time / week) + "周前！";
  } else if (time / day >= 1) {
    result = "更新于" + parseInt(time / day) + "天前！";
  } else if (time / hour >= 1) {
    result = "更新于" + parseInt(time / hour) + "小时前！";
  } else if (time / minute >= 1) {
    result = "更新于" + parseInt(time / minute) + "分钟前！";
  } else {
    result = "刚刚更新！";
  }

  return result;
}
