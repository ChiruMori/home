'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};
// 标记：书签缓存为空
let bookmarksCacheEmpty = false;
let bookmarkOpt = dataManager.getData("bookmarks");
if (!bookmarkOpt || typeof bookmarkOpt !== 'object' || bookmarkOpt.dic.length === 0) {
  bookmarksCacheEmpty = true;
  bookmarkOpt = {
    showAllBookmarks: false,
    maxBookmarkShowNumber: 10, // 最大书签显示数量
    dic: [{
      icon: 'https://m.baidu.com/se/static/img/iphone/bearicon.png', // 支持网址和 fa 图标
      text: '百度一下',
      link: 'https://wwww.baidu.com/',
      weight: 0,
    }, {
      icon: 'fas',
      text: '未设定',
      link: 'javascript:;',
      weight: 0,
    }, {
      icon: 'fas',
      text: '未设定',
      link: 'javascript:;',
      weight: 0,
    }, {
      icon: 'fas',
      text: '未设定',
      link: 'javascript:;',
      weight: 0,
    }]
  }
};

let bookmarkFuncs = (() => {

  let showNodeListHead = null;
  let controlBtn = null;
  const toggleFrame = 10; // 切换动画帧数
  // 定位链表头部
  function findListHead() {
    if (!showNodeListHead) {
      let btns = document.getElementsByClassName('cxlm-a_btn');
      showNodeListHead = btns[bookmarkOpt.maxBookmarkShowNumber - 1];
      controlBtn = btns[btns.length - 2];
    }
  }

  async function hideBtn(nowBtn) {
    nowBtn.style.opacity = '1';
    await cxlm.domAnimate(nowBtn, 'opacity', 1, 0, toggleFrame);
    nowBtn.style.display = 'none';
    return Promise.resolve();
  }

  async function showBtn(nowBtn) {
    nowBtn.style.opacity = '0';
    nowBtn.style.display = 'inline-block';
    await cxlm.domAnimate(nowBtn, 'opacity', 0, 1, toggleFrame);
    return Promise.resolve();
  }

  // 折叠多出的按钮
  async function foldLinkBtns() {
    findListHead();
    let nowDom = controlBtn;
    while (nowDom.previousSibling && nowDom.previousSibling !== showNodeListHead) {
      nowDom = nowDom.previousSibling;
      await hideBtn(nowDom);
    }
    await Promise.all([showBtn(controlBtn.nextSibling), hideBtn(controlBtn)]);
  }

  // 显示全部按钮
  async function expandLinkBtns() {
    findListHead();
    let nowDom = showNodeListHead;
    while (nowDom.nextSibling && nowDom.nextSibling !== controlBtn) {
      nowDom = nowDom.nextSibling;
      await showBtn(nowDom);
    }
    await Promise.all([hideBtn(controlBtn.nextSibling), showBtn(controlBtn)]);
  }

  // 更新整个按钮容器
  function updateAll() {
    let btnAreaOpt = {
      props: {
        id: 'btn_area',
        class: 'cxlm-btn_area',
      },
      son: cxlm.buildBookmarkDom(),
    }
    dataManager.setData('bookmarks', bookmarkOpt);
    document.getElementById("btn_area").outerHTML = cxlm.buildDom(btnAreaOpt).outerHTML;
  }

  /**
   * 新增书签项
   *
   * @param {String} icon 图标，支持 fa 图标和链接
   * @param {String} text 显示文字，太长会折叠显示
   * @param {String} link 链接
   * @param {Number} weight 权重，影响书签的位置
   */
  function newOne(icon, text, link, weight) {
    let id = 'BM' + (new Date().getTime());
    let newBM = { // 新生成的书签对象
      icon,
      text,
      link,
      weight,
      id
    };
    if (bookmarksCacheEmpty) bookmarkOpt.dic = [newBM];
    else bookmarkOpt.dic.push(newBM);
    updateAll();
  }

  function searchOne(id) {
    let res = null;
    bookmarkOpt.dic.forEach(element => {
      if (element.id === id) res = element;
    });
    return res;
  }

  function updateOne(id, icon, text, link, weight) {
    let target = searchOne(id);
    if (target) {
      target.icon = icon;
      target.text = text;
      target.link = link;
      target.weight = weight;
      updateAll();
    }
  }

  function deleteOne(id) {
    let originLen = bookmarkOpt.dic.length;
    bookmarkOpt.dic = bookmarkOpt.dic.filter(ele => ele.id !== id);
    if (bookmarkOpt.dic.length < originLen) {
      updateAll();
    }
  }

  // 读取本地存储并生成书签节点 DOM 配置对象数组
  cxlm.buildBookmarkDom = function () {
    function buildADom(icon, link, text, id) {
      let iconObj;
      let btnFlag = link.startsWith('javascript:');
      if (icon.startsWith('http')) {
        iconObj = {
          tag: 'img',
          props: {
            class: 'cxlm-btn_icon_img',
            src: icon,
          }
        }
      } else {
        iconObj = {
          tag: 'i',
          props: {
            class: icon
          }
        };
      }
      let res = {
        tag: 'a',
        props: {
          href: btnFlag ? 'javascript:' : link,
          class: 'cxlm-a_btn',
          target: btnFlag ? '' : '_blank',
          onclick: btnFlag ? link.substring(11) : ';'
        },
        son: [{
          props: {
            class: 'cxlm-c_btn'
          },
          son: [{
            props: {
              class: 'cxlm-btn_icon'
            },
            son: [iconObj]
          }, {
            props: {
              class: 'cxlm-btn_text'
            },
            text: (text.length > 6) ? (text.substring(0, 4) + '...') : text,
          }]
        }]
      };
      if (id)
        res.props.id = id;
      return res;
    } // -- buildADom

    // 读取本地存储
    let useBookmarks = bookmarkOpt.dic;
    let resArr = [];
    let maxShowNumber = bookmarkOpt.maxBookmarkShowNumber ? bookmarkOpt.maxBookmarkShowNumber : 10;
    useBookmarks.sort((a, b) => b.weight - a.weight);
    for (let bIndex in useBookmarks) {
      let nowDomOption = useBookmarks[bIndex];
      let nowDomObj = buildADom(nowDomOption.icon, nowDomOption.link, nowDomOption.text, nowDomOption.id);
      if (!bookmarkOpt.showAllBookmarks && bIndex >= maxShowNumber) {
        nowDomObj.style = {
          display: 'none'
        }
      }
      resArr.push(nowDomObj);
    }
    if (useBookmarks.length > maxShowNumber) {
      let altBtnLeft = buildADom('fas fa-angle-double-left', 'javascript:bookmarkFuncs.foldLinkBtns();', '折叠');
      let altBtnRight = buildADom('fas fa-angle-double-right', 'javascript:bookmarkFuncs.expandLinkBtns();', '展开');
      if (bookmarkOpt.showAllBookmarks) {
        altBtnRight.style = {
          display: 'none'
        };
      } else {
        altBtnLeft.style = {
          display: 'none'
        };
      }
      resArr.push(altBtnLeft, altBtnRight);
    }
    return resArr;
  }; // -- cxlm.buildBookmarkDom
  return {
    foldLinkBtns,
    expandLinkBtns,
    newOne,
    deleteOne,
    updateOne,
    searchOne,
  }
})()