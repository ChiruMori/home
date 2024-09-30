'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};


// 实现跨浏览器的事件处理程序
cxlm.EventUtil = {
  bindHandler: function (element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false); // false：冒泡事件
    } else if (element.attachEvent) { // IE
      element.attachEvent("on" + type, handler);
    }
  },
  removeHandler: function (element, type, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false);
    } else if (element.detachEvent) { // IE
      element.detachEvent("on" + type, handler);
    }
  }
}

/**
 * 创建 DOM 节点
 * 
 * @param {Object} dom DOM 描述
 * DOM 支持属性如下：  
 *  tag: 节点名，默认为 div  
 *  text: 节点文本内容，script 节点将解释为脚本并执行  
 *  style: css 对象  
 *  props: 标签属性对象，如果已有 style 属性，则会将其覆盖  
 *  son: DOM 描述数组
 */
cxlm.buildDom = function (dom) {
  if (!dom.tag) {
    dom.tag = 'div'; // div 节点可以不指定节点名
  }
  let nowNode = document.createElement(dom.tag);
  // 节点内容
  if (dom.text) {
    if (dom.tag === 'script') {
      nowNode.text = dom.text;
    } else {
      nowNode.innerText = dom.text;
    }
  }
  // 设置 style
  if (dom.style && typeof dom.style === 'object') {
    for (let cssKey in dom.style) {
      nowNode.style[cssKey] = dom.style[cssKey];
    }
  }
  // 设置属性
  if (dom.props && typeof dom.props === 'object') {
    for (let propKey in dom.props) {
      nowNode.setAttribute(propKey, dom.props[propKey]);
    }
  }
  // 递归子节点
  if (dom.son && dom.son.length) {
    for (let eleOption in dom.son) {
      let sonEle = cxlm.buildDom(dom.son[eleOption]);
      nowNode.appendChild(sonEle);
    }
  }
  return nowNode;
};

// 搜索，支持 URL
cxlm.search = function (keyWord) {
  if (keyWord.startsWith('http://') || keyWord.startsWith('https://')) {
    window.open(keyWord)
  } else {
    window.open(useOption.searchEnginePrefix + keyWord);
  }
}

/** 休眠指定毫秒数 */
cxlm.sleep = function (time) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => resolve(), time);
  })
}

/**
 * 节点 CSS 属性动画
 * @param {HtmlElement} ele 需要做动画处理的 html 节点
 * @param {String} attr 动画作用的属性
 * @param {Number} from 属性初始值
 * @param {Number} to 属性结束值
 * @param {Number} frame 动画帧数
 * @param {String} suffix css 属性尾缀
 */
cxlm.domAnimate = (ele, attr, from, to, frame, suffix = '') => new Promise(async (res) => {
  const frameTime = 20;
  let stepValue = (to - from) / frame;
  ele.style[attr] = from + suffix;
  while (Math.abs(from - to) > Math.abs(stepValue)) {
    from += stepValue;
    ele.style[attr] = from + suffix;
    await cxlm.sleep(frameTime);
  }
  res();
});

/**
 * 扩展字符串方法，与 Java 的 hashCode 行为一致
 * @returns {String} 字符串的 Hash 值
 */
String.prototype.hashCode = function () {
  let res = 0;
  for (let charIndex = 0, len = this.length; charIndex < len; charIndex++) {
    res = (31 * res + this.codePointAt(charIndex)) % 2147483648;
  }
  return res;
}

// 显示提示，并在 10 秒后销毁
cxlm.showToast = async function (title, subTitle, msg) {
  let htmlStr = `
  <div id="msgToast" role="alert" aria-live="assertive" aria-atomic="true" class="toast" data-autohide="false"
    style="position: absolute; right: 20px; bottom: 20px;">
    <div class="toast-header">
      <strong class="mr-auto" id="mainTitle">${title}</strong>
      <small id="subTitle">${subTitle}</small>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="toast-body" id="msgArea">
      ${msg}
    </div>
  </div>
  `;
  let toastJqObj = $(htmlStr);
  $(document.body).append(toastJqObj);
  toastJqObj.toast('show');
  await this.sleep(10000);
  toastJqObj.toast('dispose');
}

// 将字符串拷贝到剪贴板
cxlm.copyToBoard = function(str){
  let hideInp = document.createElement('input');
  hideInp.value = str;
  document.body.appendChild(hideInp);
  hideInp.select(); // 选择对象
  let state = document.execCommand("Copy"); // 执行浏览器复制命令
  $(hideInp).remove();
  return state;
}