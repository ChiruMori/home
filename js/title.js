/**
 * 文字动画相关操作，惰性单体、简单工厂、桥接
 * 使用方法：
 *  title.getInstance()  获取到工厂单例，
 *  工厂公有方法如下：
 *    getOne(idName, value):  获取单个动画对象
 *    getAll(dataArr)         获取一组动画对象，数组的每个对象需要有idName、value
 *  工厂私有方法如下：
 *    animateCSS()        元素动画方法
 *    timer()             定时器方法，定时执行任务
 *  动画对象有如下两个公有方法：
 *    show()              重新渲染动画
 *    changeText(value)   改变元素文本并重新渲染动画
 * 最后修改于：2019.4.23 删除多元素动态标题遗留代码
 */
var title = (function () {
  /** 
   * 元素动画方法，传入参数如下：
   *  容器：可为空
   *  动画HTML单标签
   *  动画名数组
   *  回调（可选）当前标签动画执行完毕后的操作
   *  替换标记：是否替换标签内容
   */
  let animateCSS = function (coll, obj, animationName, callback, flag) {
    if (coll) {
      if (flag) {
        coll.html(obj[0]);
      } else {
        coll.append(obj);
      }
    }
    let node = obj[0];
    node.classList.add('animated')
    animationName.forEach((name) => {
      node.classList.add(name);
    })

    function handleAnimationEnd() {
      node.classList.remove('animated')
      animationName.forEach((name) => {
        node.classList.remove(name);
      })
      node.removeEventListener('animationend', handleAnimationEnd)
      if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
  }


  /** 
   * 定时器方法，执行指定次数
   * letterArr：  字符数组
   * wait：       动画间隔时间，单位ms
   * callback：   针对每个单独元素的回调函数
   */
  let timerIt = function (letterArr, wait, callback) {
    let t1 = window.setInterval(refreshCount, wait);
    let times = letterArr.length;
    let index = 0;

    function refreshCount() {
      if (times--) {
        callback(letterArr[index++]);
      } else {
        //去掉定时器的方法  
        window.clearInterval(t1);
      }
    }
  }

  let fontSize = $(document).width() * 0.03, // 文字大小
    space = fontSize / 3;

  /** 文字动画类 */
  let LetterShow = function (idName, initValue, animateIn, animateOut) { // 构造函数
    this.ele = $("#" + idName);
    this.value = initValue;
    this.letterArr = [];
    this.state = true; // 占位标记，设两种状态
    this.animateIn = animateIn;
    this.animateOut = animateOut;
    this.show();
  }

  LetterShow.prototype = {
    constructor: LetterShow, // 还原构造器
    show: function () { // 显示动画，需要配合css使用
      letters = this.value.split(''); // 分割为单个文字
      this.ele.html("<span>&#8195;</span>"); // 清空原有，防止元素高度变为0
      let that = this;
      for (let i = 0, n = letters.length, letter; i < n; i++) {
        letter = letters[i];
        let letterObj = $('<div class="line"><span style="font-size: ' + fontSize + 'px; margin-right: ' + space + 'px;">' + letter + '</span></div>')
        that.letterArr.push(letterObj)
      }

      let coll = this.ele;
      // 开始动画
      timerIt(this.letterArr, 300, function (obj) {
        animateCSS(coll, obj, that.animateIn, null, that.state);
        that.state = false;
      })
    },
    changeText: function (newValue, animateIn, animateOut) { // 切换动画内容并刷新动画
      let that = this;
      animateCSS(false, this.ele, this.animateOut, function () {
        that.value = newValue;
        that.letterArr = [];
        that.animateIn = animateIn;
        that.show();
      });
      this.animateOut = animateOut;
      that.state = true;
    }
  }

  let instance;

  let timer,
    index = 0,
    amount,
    option,
    titleObj = [];

  // 简单工厂，私有工厂，生产标题参数对象
  let arrFactory = function (obj) {
    let res = {
      "idName": "dis1",
    }
    res.value = obj.text;
    res.animateIn = obj.in;
    res.animateOut = obj.out;
    return res;
  }
  let refreshCount = function () {
    index++;
    if (index === amount) {
      index = 0;
    }
    instance.changeContent(arrFactory(option[index]), titleObj);
  }

  let reset = function (opt) {
    option = opt;
    amount = opt.length;
    let element = arrFactory(option[0]);
    titleObj = new LetterShow(element.idName, element.value, element.animateIn, element.animateOut);
    if (timer) {
      window.clearInterval(timer);
      timer = null
    }
    timer = window.setInterval(refreshCount, 6000);
  }

  // 初始化单例，惰性单体，只在第一次调用时实例化，不用则不实例化
  let init = function (opt) {
    reset(opt);

    return {
      hearBlur: function () {
        window.clearInterval(timer);
      },
      hearFocus: function () {
        timer = window.setInterval(refreshCount, 6000);
      },
      getOne: function (idName, value, animateIn, animateOut) {
        return new LetterShow(idName, value, animateIn, animateOut);
      },
      changeContent: function (options, obj) {
        obj.changeText(options.value, options.animateIn, options.animateOut);
      },
      hearResize: function () {
        fontSize = $(document).width() * 0.03; // 重设主文字大小
        space = fontSize / 3;
      },
      renderTitle: function () {

        // 使用第一组参数初始化动画
        titleObj = title.getInstance(option).getAll(arrFactory(option[0]))
        // 定时切换一次参数
        timer = window.setInterval(refreshCount, 6000);
        return titleObj;
      }
    }
  }

  return {
    getInstance: function (option) {
      if (!instance) { // 不存在则进行实例化
        instance = init(option);
      }
      return instance;
    },
    resetInstance: function (option) {
      window.clearInterval(timer);
      return instance = init(option); // 重设并返回
    }
  }
})()