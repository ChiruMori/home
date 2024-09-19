/**
 * 对原有缓存方法做了简单的封装，提供备份恢复等功能
 * 闭包单体，饿汉式单体
 * 形似适配器，对象适配器（适配原有缓存对象），没有目标抽象类，因为整个系统使用一个单例，创建一个闭包单体作为目标对象
 * 最后修改于：2019.4.23，拓展数据过期功能
 */
var dataManager = (function () {
  // 私有变量区
  let storage = window.localStorage; // 浏览器缓存对象，被适配者
  let separator1 = "_*|*_"; // 备份用分隔符
  let separator2 = "_*:*_"; // 备份用分隔符

  let instance = {};

  let initTime = new Date(); // 读取缓存时时间

  // 检查当前内部对象是否过期，未设置期限时默认为未过期
  let checkTime = function (obj) {
    let tempObj = JSON.parse(obj);
    return !(tempObj.deadline && initTime > new Date(tempObj.deadline));
  }

  /** 向缓存中添加数据，键值对形式 */
  instance.setData = function (key, value, deadline) {
    let tempObj = {
      val: value,
    }
    if (deadline) { // 设置有效时间，可缺省，为永久有效
      let dateObj = new Date(deadline);
      if (dateObj.getDate()) {
        if (initTime < dateObj) {
          tempObj.deadline = deadline;
        } else {
          throw Error("失效时间早于当前时间：" + deadline);
        }
      } else {
        throw Error("日期字符串无法识别：" + deadline);
      }
    }
    if (typeof value === 'object') {
      tempObj.type = 'obj';
    } else {
      tempObj.type = 'str';
    }
    value = JSON.stringify(tempObj);
    storage.setItem(key, value);
  }

  /** 转换数据，去掉前缀并转码 */
  let parseData = function (strValue) {
    return JSON.parse(strValue).val;

    /*if (strValue.indexOf('obj-') === 0) {
      return JSON.parse(strValue.slice(4));
    } else if (strValue.indexOf('str-') === 0) {
      return strValue.slice(4);
    }*/
  }

  /** 通过键从缓存中读取数据，如果已过期则删除 */
  instance.getData = function (key) {
    let value = storage.getItem(key);
    if (!value) {
      return null;
    } else if (checkTime(value)) {
      return parseData(value);
    }
    console.warn("请求的对象：[" + key + "]已过期");
    console.warn(instance.removeData(key));
    return null;
  }

  /** 清空缓存中所有数据 */
  instance.clearData = function () {
    if (confirm("确定清空所有数据？")) {
      window.localStorage.clear();
    }
  }

  /** 移除并返回指定数据 */
  instance.removeData = function (key) {
    let value = storage.getItem(key);
    if (!value) {
      console.error("没有指定的数据：" + key);
    } else {
      storage.removeItem(key);
      return parseData(value);
    }
  }

  /** 显示缓存中所有的数据 */
  instance.displayAll = function () {
    for (key in window.localStorage) {
      let nowValue = window.localStorage[key];
      if (typeof nowValue === 'string') {
        console.log(key + ": " + nowValue.slice(4));
      }
    }
  }

  /** 将所有数据保存到string中，作为参数放入回调函数 */
  instance.backup = function (fn) {
    let backupStr = "";
    for (key in window.localStorage) {
      let nowValue = window.localStorage[key];
      if (typeof nowValue === 'string') {
        backupStr += (key + separator2 + nowValue + separator1);
      }
    }
    fn(backupStr);
  }

  /** 恢复数据，必须使用相同的规则备份的字符串 */
  instance.recover = function (backupStr) {
    let dataArr = backupStr.split(separator1);
    dataArr.forEach(pair => {
      if (pair === "") return;
      let key = pair.split(separator2)[0];
      let value = pair.split(separator2)[1];
      storage.setItem(key, value);
      console.log("已恢复数据：" + key);
    });
  }

  return instance; // 返回创建的实例
})()