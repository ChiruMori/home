
/** 
 * 集中处理事件监听
 * 观察者模式：由所有的发布者对每一个需要监听的对象进行绑定
 * 责任链模式：所有的发布者均为一条责任链上的对象，每个发布者根据自己处理的消息种类进行任务绑定
 * 简单链式、闭包单体
 */
var listener = (function () {

  // 发布者，被观察者
  var PublisherImplement = new CXLM.Interface("publisher", ["setNext"]);

  // 拓展函数类对象，js装饰者。
  // 只要是函数即可进行订阅
  Function.prototype.subscribe = function (publish) {
    var that = this; // 订阅者
    var exits = publish.subscribers.some(function (item) { // 避免重复订阅
      return item === that;
    });
    if (!exits) { // 新的订阅
      publish.subscribers.push(that);
    }
    return this; // 链式调用需要，只订阅一个发布者貌似没用
  }

  var Publisher = function (canDo) {
    this.canDo = canDo; // 负责的事件分类
    this.subscribers = []; // 保存所有的订阅者，函数数组
    this.next = null; // 下一个发布者
  }

  // 构建责任链，简单链式调用
  Publisher.prototype.setNext = function(next){
    this.next = next;
    return next;
  }

  // 发布消息
  let deliver = function (event, that) {
    // 这里的this指的是发布者
    that.subscribers.forEach(function (fn) {
      fn(event, that); // 消息发布到指定的函数
      return that;
    });
  }

  loadPublisher = new Publisher("hearLoad"); // Load事件发布者
  resizePublisher = new Publisher("hearResize"); // resize事件发布者
  clickPublisher = new Publisher("hearClick"); // 点击事件发布者
  blurPublisher = new Publisher("hearBlur"); // 失去焦点事件发布者
  focusPublisher = new Publisher("hearFocus"); // 获取到焦点事件发布者

  CXLM.Interface.check(loadPublisher, PublisherImplement); // 接口检查，只进行一个对象的检查

  // 链式设置责任链中各发布者的关联关系，loadPublisher为责任链首
  loadPublisher.setNext(resizePublisher).setNext(clickPublisher).setNext(blurPublisher).setNext(focusPublisher);
  
  // 添加事件监听到发布者
  CXLM.EventUtil.bindHandler(window, "load", deliver, loadPublisher);
  CXLM.EventUtil.bindHandler(window, "resize", deliver, resizePublisher);
  CXLM.EventUtil.bindHandler(window, "click", deliver, clickPublisher);
  CXLM.EventUtil.bindHandler(window, "blur", deliver, blurPublisher);
  CXLM.EventUtil.bindHandler(window, "focus", deliver, focusPublisher);

  // 接受任务，放到责任链中，各发布者寻找自己的订阅者，链式调用
  handleObserver = function(obj){
    let nowPublisher = loadPublisher; // 责任链开头
    while(nowPublisher){
      if(obj[nowPublisher.canDo]){ // 如果当前任务对象存在当前发布者对象能处理的任务（函数）
        obj[nowPublisher.canDo].subscribe(nowPublisher); // 进行订阅
      }
      nowPublisher = nowPublisher.next; // 任务对象推给下一个发布者
    }
    return this;
  }

  return {
    handleObserver: handleObserver
  };
})()