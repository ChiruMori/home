/** 
 * 闭包单体
 * 装饰者模式：拓展日期类，拓展了格式化行为、剩余天数
 * 最后修改于：2019.04.24 增加CountDown组件
 */

let todo = (function () {

  // 所有的todo对象
  let allObj = [];

  let scroll = $("#scroll-mar");

  let ItemList = function () {
    this.itemMap = {};
    this.ul = $(`<ul class="list-group list-group-flush"></ul>`);
  }

  // 添加DOM对象到集合内(li添加到ul)
  ItemList.prototype.addItem = function (item) {
    this.itemMap[item.key] = item;
  }

  // 移除集合内指定DOM对象并返回被移除的对象
  ItemList.prototype.removeItem = function (item) {
    let res = this.itemMap[item.key]
    delete this.itemMap[item.key];
    return res;
  }

  // 刷新DOM对象(ul列表)
  ItemList.prototype.renderDom = function () {
    let theUl = this.ul;
    theUl.html("");
    if (this.each(ele => {
        ele.renderDom();
        theUl.append(ele.dom);
      }) === 0) {
      theUl.append(`<p>暂无内容</p>`);
    }
  }

  // 迭代每个元素的方法
  ItemList.prototype.each = function (fn) {
    let counter = 0;
    for (let key in this.itemMap) {
      fn(this.itemMap[key]);
      counter++;
    }
    return counter;
  }

  // 私有Item数组
  let todoStudy = new ItemList(),
    todoMake = new ItemList(),
    doneStudy = new ItemList(),
    doneMake = new ItemList(),
    giveupStudy = new ItemList(),
    giveupMake = new ItemList();
  let keyLen = 12; // key长度


  /** 组合DOM */

  /** 日期装饰者类，继承方法 */
  class DateWrapper extends Date {
    constructor(para) {
      super(para);
    }
  };

  /** 拓展行为，提供日期格式化方法 */
  DateWrapper.prototype.format = function (formatStr) {
    var str = formatStr;
    str = str.replace(/yyyy|YYYY/, this.getFullYear());
    str = str.replace(/MM/, (this.getMonth() + 1) > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    return str;
  }

  // 当前对象时间距离现在时间的天数
  DateWrapper.prototype.totalDays = function () {
    let nowTime = new Date().getTime();
    let toTime = this.getTime();
    return ~~((toTime - nowTime) / 86400000);
  }

  /** 随机key值生成器，不会生成重复的key */
  let randomKey = (function () {
    /** 随机数生成器 */
    function random(max) {
      return ~~(Math.random() * max);
    }
    let memory = {};
    let chars = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm_*-=+";
    let len = chars.length;
    let generate = function (keyLen) {
      res = "";
      while (keyLen--) {
        res += chars[random(len)];
      }
      if (memory[res]) {
        return arguments.callee(keyLen); // 递归
      } else {
        memory[res] = true; // 记忆
        return res;
      }
    }
    return function (keyLen, prefix) {
      return prefix + generate(keyLen);
    }
  })()

  /** TODO元素接口 */
  let TodoInterface = new CXLM.Interface("TodoInterface", ["done", "giveUp", "rollBack"]);

  /** todo元素类 */
  let ItemAbstract = function (name, type, time, info) {
    this.name = name;
    this.type = type;
    this.time = time ? time : new DateWrapper().format("yyyy.MM.dd");
    if (info) this.info = info;
    CXLM.Interface.check(this, TodoInterface); // 接口检验
  }
  // 方法默认实现：未经重写就调用则抛异常
  ItemAbstract.prototype.done = function () {
    throw new Error("当前状态无法完成");
  }
  ItemAbstract.prototype.giveUp = function () {
    throw new Error("当前状态无法放弃");
  }
  ItemAbstract.prototype.rollBack = function () {
    throw new Error("当前状态无法回退");
  }
  ItemAbstract.prototype.renderDom = function () {
    let span = $(`<span class="float-right text-muted">` + this.time + `</span></li>`);
    this.dom = $(`<li class="list-group-item bg-dark-trans">` + this.name + `</li>`);
    if (this.info) {
      span.append(`<i class="fas fa-info-circle cur-pointer text-info ml-1" onclick="swal(\'INFO\', \'` + this.info + `\', \'info\')"></i>`);
    }
    switch (this.state) {
      case "todo":
        span.append(`<i onclick="todo.check('` + this.key + `')" class="fas fa-check-circle cur-pointer text-success ml-1"></i>`);
      case "giveUp":
      case "done":
        span.append(`<i onclick="todo.times('` + this.key + `')" class="fas fa-times-circle cur-pointer text-danger ml-1"></i>`)
    }
    this.dom.append(span);
  }

  let convertObject = function (target, fromMap1, fromMap2, newState, updateTime) {
    fromMap1.removeItem(target);
    fromMap2.removeItem(target);
    target.state = newState;
    if (updateTime) {
      delete target.time;
    }
    itemConvert(target);
    refreshDom();
    writeToStorage();
  }
  /** TODO子类 */
  let TodoItem = function (name, type, time, info) {
    this.state = "todo";
    TodoItem.superClass.constructor.call(this, name, type, time, info); // 调用父类构造方法，相当于面向对象语言中的super()
  }
  CXLM.extend(TodoItem, ItemAbstract);
  TodoItem.prototype.done = function () {
    // 需要的操作：从todo列表删除，添加到done列表中，同时更新缓存
    convertObject(this, todoStudy, todoMake, 'done', true);
  }
  TodoItem.prototype.giveUp = function () {
    // 需要的操作：从todo列表删除，添加到giveUp列表中，同时更新缓存
    convertObject(this, todoStudy, todoMake, 'giveUp');
  }
  /** GiveUp子类 */
  let GiveUpItem = function (name, type, time, info) {
    this.state = "giveUp";
    TodoItem.superClass.constructor.call(this, name, type, time, info);
  }
  CXLM.extend(GiveUpItem, ItemAbstract);
  GiveUpItem.prototype.rollBack = function () {
    // 从giveUp列表删除，更新日期后添加到todo列表中，同时更新缓存
    convertObject(this, giveupStudy, giveupMake, 'todo', true);
  }
  /** Done子类 */
  let DoneItem = function (name, type, time, info) {
    this.state = "done";
    TodoItem.superClass.constructor.call(this, name, type, time, info);
  }
  CXLM.extend(DoneItem, ItemAbstract);
  DoneItem.prototype.rollBack = function () {
    // 从done列表删除，更新日期后添加到todo列表中，同时更新缓存
    convertObject(this, doneStudy, doneMake, 'todo', true);
  }

  /**
   * 将对象包装为ItemAbstace对象
   * 同时将对象推入指定集合
   */
  let itemConvert = function (obj, read) {
    switch (obj.state) {
      case "todo":
        pushItem(new TodoItem(obj.name, obj.type, obj.time, obj.info), todoStudy, todoMake, "t", read);
        break;
      case "done":
        pushItem(new DoneItem(obj.name, obj.type, obj.time, obj.info), doneStudy, doneMake, "d", read);
        break;
      case "giveUp":
        obj.key = "g";
        pushItem(new GiveUpItem(obj.name, obj.type, obj.time, obj.info), giveupStudy, giveupMake, "g", read);
        break;
      default:
        console.error(obj);
        throw new Error("异常数据状态，请检查并修复");
    }
  }

  /** 添加到指定数组，接受ItemAbstace对象 */
  let pushItem = function (obj, studyMap, makeMap, addPrefix, read) {
    if (obj.type === "make") {
      obj.key = randomKey(keyLen, addPrefix + "m");
      makeMap.addItem(obj);
    } else if (obj.type === "study") {
      obj.key = randomKey(keyLen, addPrefix + "s");
      studyMap.addItem(obj);
    } else {
      console.error(obj);
      throw Error("无法识别的类型");
    }
    if (read) {
      allObj.push(obj);
    }
  }

  /** 读取缓存 */
  let readStorage = function () {
    let tempData = dataManager.getData("todoData");
    if (tempData) {
      console.log("已加载todo数据：" + tempData.length + "条");
      tempData.forEach(element => {
        itemConvert(element, true);
      });
    } else {
      console.debug("缓存中没有todo数据");
    }
  }

  let refreshDom = function () {
    todoStudy.renderDom();
    todoMake.renderDom();
    doneStudy.renderDom();
    doneMake.renderDom();
    giveupStudy.renderDom();
    giveupMake.renderDom();
    scroll.html(""); // 清空
    let renderScroll = function (ele) {
      scroll.append(`<p class="` + (ele.info ? (' cur-pointer" onclick="swal(\'INFO\', \'' + ele.info + '\', \'info\')"') : '"') + `>to ` + ele.type + `: ` + ele.name + `</p>`)
    }
    let total = todoStudy.each(renderScroll) + todoMake.each(renderScroll);
    if (total === 0) {
      scroll.append(`<p>暂无内容</p>`);
    }
  }

  let compare = function (property) {
    return function (a, b) {
      var value1 = a[property];
      var value2 = b[property];
      return new Date(value1) - new Date(value2);
    }
  }

  let countDateReg = /^2\d{3}\/(0[1-9]|1[12])\/(0[1-9]|2\d|1\d|30|31) [01]\d|2[0-3]:[0-5]\d:[0-5]\d$/;

  // CountDown元素类
  class CountDownItem {
    constructor(content, deadline) {
      // 检验日期格式，接受形如：2019-04-24 16:12:59形式的字符串
      if (countDateReg.test(deadline) && new Date(deadline).getTime()) {
        this.content = content;
        this.deadline = deadline;
      } else {
        throw Error("日期不符合标准(yyyy/mm/dd hh:mm:ss)：" + deadline);
      }
    }
  }

  let countDownArr = [];

  let readCountDown = function () {
    countDownArr = dataManager.getData("countDown");
    if (countDownArr && countDownArr.length) {
      countDownArr = countDownArr.filter(ele => {
        return new Date().getTime() < new Date(ele.deadline).getTime();
      })
      dataManager.setData("countDown", countDownArr)
      console.log("已加载countdown数据：" + countDownArr.length + "条");
    } else {
      console.log("缓存中没有countDown数据");
    }
  }

  let renderCountDown = function () {
    if (!countDownArr || !countDownArr.length) {
      countDownDiv.html(`<span class="text-secondary">没有内容</sapn>`);
      console.debug(countDownArr.length);
      return;
    }
    countDownDiv.html(``);
    countDownArr.forEach(ele => {
      let leaveDays = new DateWrapper(ele.deadline).totalDays();
      let key = randomKey(6, "cd");
      ele.key = key;
      let className = '';
      if(leaveDays > 99){
        className = 'text-secondary';
      }else if (leaveDays > 29) {
        className = 'text-primary';
      } else if (leaveDays > 13) {
        className = 'text-white';
      } else if (leaveDays > 6) {
        className = 'text-warning';
      } else {
        className = 'text-danger font-weight-bold';
      }
      let span = $(`<span key="` + ele.key + `" class="` + className + `"></span>`);
      let iBtn = $(`<i onclick="todo.countOver('` + ele.key + `')" class="fas fa-check-circle cur-pointer text-success ml-2"></i>`);
      let divTag = $(`<div title="` + ele.deadline + `"></div>`);
      divTag.append(span);
      divTag.append(iBtn);
      countDownDiv.append(divTag);
      span.countdown(ele.deadline, {
          elapse: false,
        })
        .on('update.countdown', function (event) {
          span.html(ele.content + event.strftime('： %-D days %-H:%M:%S left. '));
        }).on('finish.countdown', function () {
          countOver(ele.key);
          console.debug(ele.content + "计时结束");
        });
    })
  }

  let init = function () {
    $("#modalDiv").css({
      height: document.documentElement.clientHeight * 0.6 + 'px'
    });
    readStorage();
    refreshDom();
    readCountDown();
    renderCountDown();
  }


  let studyTitle = $(`<h5 id="study">Study</h5>`);
  let makeTitle = $(`<h5 id="make">Make</h5>`);

  /** 数据写入缓存 */
  let writeToStorage = function () {
    dataManager.setData("todoData", allObj);
    // console.log("已更新缓存数据："+allObj.length+"条数据");
  }

  let countDownDiv = $("#countDown"); // countdown容器

  init();

  let countOver = function (key) {
    // 删除CountDownItem
    countDownArr = countDownArr.filter(ele => {
      return ele.key !== key;
    })
    dataManager.setData('countDown', countDownArr);
    renderCountDown();
  }

  return {
    countOver: countOver,
    newCountDown: function (content, timeStr) {
      // 增加倒计时项目
      countDownArr.push(new CountDownItem(content, timeStr));
      countDownArr.sort(compare('deadline'));
      renderCountDown();
      dataManager.setData('countDown', countDownArr);
    },
    newTodo: function (obj) {
      itemConvert(obj, true);
      refreshDom();
      writeToStorage();
      // console.log(obj);
    },
    show: function (mode) {
      let titleObj = $("#todoModalLabel");
      let modalDiv = $("#modalDiv");
      modalDiv.html(''); // 清空原有内容
      switch (mode) {
        case 'todo':
          titleObj.html('What To Do?');
          modalDiv.append(studyTitle);
          modalDiv.append(todoStudy.ul);
          modalDiv.append(makeTitle);
          modalDiv.append(todoMake.ul);
          break;
        case 'done':
          titleObj.html('What Have Done?');
          modalDiv.append(studyTitle);
          modalDiv.append(doneStudy.ul);
          modalDiv.append(makeTitle);
          modalDiv.append(doneMake.ul);
          break;
        case 'giveup':
          titleObj.html('What Have Given Up?');
          modalDiv.append(studyTitle);
          modalDiv.append(giveupStudy.ul);
          modalDiv.append(makeTitle);
          modalDiv.append(giveupMake.ul);
          break;
      }
      $("#todoModal").modal();
    },
    check: function (key) {
      if (confirm("确定已完成？")) {
        switch (key.slice(0, 2)) {
          case "ts":
            todoStudy.itemMap[key].done();
            break;
          case "tm":
            todoMake.itemMap[key].done();
            break;
        }
      } else {
        console.log("已取消操作")
      }
    },
    times: function (key) {
      if (confirm("确定放弃该todo项目或回滚？")) {
        switch (key.slice(0, 2)) {
          case "ts":
            todoStudy.itemMap[key].giveUp();
            break;
          case "tm":
            todoMake.itemMap[key].giveUp();
            break;
          case "ds":
            doneStudy.itemMap[key].rollBack();
            break;
          case "dm":
            doneMake.itemMap[key].rollBack();
            break;
          case "gs":
            giveupStudy.itemMap[key].rollBack();
            break;
          case "gm":
            giveupMake.itemMap[key].rollBack();
            break;
        }
      } else {
        console.log("已取消操作");
      }
    }
  }
})()