'use strict';

if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

// 书签使用的模态弹窗初始化
const bgModalInit = () => {
  let cxlmModalTool = {
    iconInp: $('#bmIcon'),
    textInp: $('#bmText'),
    linkInp: $('#bmLink'),
    weightInp: $('#bmWeight'),
    modifyBtn: $('#bmModifyBtn'),
    newBtn: $('#bmNewBtn'),
    modal: $('#bmModal'),
    show: function (toModified) {
      if (toModified) {
        this.iconInp.val(toModified.icon);
        this.textInp.val(toModified.text);
        this.linkInp.val(toModified.link);
        this.weightInp.val(toModified.weight);
        this.modifyBtn.attr('onclick', `cxlm.modalTool.modify('${toModified.id}');`);
        this.modifyBtn.show();
        this.newBtn.hide();
      } else {
        this.modifyBtn.hide();
        this.newBtn.show();
      }
      this.modal.modal('show');
    },
    modify: function (id) {
      bookmarkFuncs.updateOne(id,
        this.iconInp.val(),
        this.textInp.val(),
        this.linkInp.val(),
        Number(this.weightInp.val())
      );
      this.modal.modal('hide');
    },
    create: function () {
      bookmarkFuncs.newOne(
        this.iconInp.val(),
        this.textInp.val(),
        this.linkInp.val(),
        Number(this.weightInp.val())
      );
      this.modal.modal('hide');
    }
  }
  cxlm.modalTool = cxlmModalTool;

  // 输入框自动激活，但是体验效果不太好
  // $(window).bind('focus load', () => document.getElementById('search_inp').focus());

  // 鼠标点击动画将用到此代码块
  // $(window).bind('click', function (e) {
  //   let targetX = e.offsetX,
  //     targetY = e.offsetY;
  // });

  // 右键菜单配置
  $.contextMenu({
    selector: '.cxlm-a_btn',
    callback: function (key, options) {
      let btnId = options.$trigger.attr('id');
      switch (key) {
        case 'edit':
          if (!btnId) return alert('无法操作该书签');
          let toModify = bookmarkFuncs.searchOne(btnId);
          cxlmModalTool.show(toModify);
          break;
        case 'delete':
          if (!btnId) return alert('无法操作该书签');
          if (confirm("确定要删除该书签？？？")) {
            bookmarkFuncs.deleteOne(btnId);
          }
          break;
        case 'new':
          cxlmModalTool.show();
          break;
        default:
          console.error(key);
      }
    },
    items: {
      "edit": {
        name: "编辑",
        icon: "edit"
      },
      "new": {
        name: "新建",
        icon: "copy"
      },
      "delete": {
        name: "删除",
        icon: "delete"
      }
    }
  });

  // 模态弹窗消失监听
  cxlmModalTool.modal.on('hidden.bs.modal', function (e) {
    // 表单清空
    cxlmModalTool.iconInp.val('');
    cxlmModalTool.textInp.val('');
    cxlmModalTool.linkInp.val('');
    cxlmModalTool.weightInp.val('')
  })
}

cxlm.randerDom = (() => {

  // 重设显示区域
  let mainArea;
  const relocateShowArea = function (xPre = 0.5, yPre = 0.5) {
    let factor = useOption.moveFactor;
    let xOffset = (0.5 - xPre) * factor * innerWidth;
    let yOffset = (0.5 - yPre) * factor * innerHeight;
    mainArea.style.marginTop = (innerHeight * (1 - useOption.mainHeight) / 2 + yOffset) + 'px';
    mainArea.style.marginLeft = (innerWidth * (1 - useOption.mainWidth) / 2 + xOffset) + 'px';
  };
  const resizeShowArea = function () {
    if (mainArea) {
      mainArea.style.width = innerWidth * useOption.mainWidth + 'px';
      mainArea.style.height = innerHeight * useOption.mainHeight + 'px';
      relocateShowArea();
    }
  };

  // 更新内存中的 DOM
  const refreshDom = function (initFlag) {
    let originDom = document.getElementById('main_area');
    if (originDom && !initFlag) // 清除原 DOM
      $(originDom).remove();
    mainArea = document.getElementById('main_area');
    resizeShowArea();
  }

  console.log('%ccxlm@cxlm.work%c2020.01.30 ~ 2020.02.01%c',
    'border-radius:3px;padding:3px;background:#000;color:#fff;',
    'border-radius:3px;padding:3px;background:#0af;color:#fff;',
    'background:transparent;');
  console.log('%c2020.02.24: fixed 4 bugs%c',
    'border-radius:3px;padding:3px;background:#FA0;color:#fff;',
    'background:transparent;');

  // 监听浏览器焦点事件
  cxlm.EventUtil.bindHandler(window, 'blur', () => cxlm.running = false);
  cxlm.EventUtil.bindHandler(window, 'focus', () => cxlm.running = true);
  cxlm.EventUtil.bindHandler(window, 'resize', resizeShowArea);
  cxlm.EventUtil.bindHandler(window, 'load', resizeShowArea);
  // 鼠标移动事件监听
  cxlm.EventUtil.bindHandler(window, 'mousemove', e => relocateShowArea(e.clientX / innerWidth, e.clientY / innerHeight));
  return function (opt, initFlag = false) {
    if (opt && typeof opt === 'object') {
      useOption = opt;
      dataManager.setData('opt', opt);
    }
    let elem = cxlm.buildDom(useOption.dom);
    let wrapperEle = document.getElementById(useOption.wrapper);
    wrapperEle.appendChild(elem);
    refreshDom(initFlag);
    bgModalInit();
  };
})();

cxlm.running = true;
cxlm.randerDom(undefined, true);