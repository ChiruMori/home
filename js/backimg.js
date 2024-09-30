'use strict';

if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

cxlm.bgTool = (() => {

  const defaultImgs = [
    'https://www.cxlm.work/home/imgs/44.jpg',
    'https://www.cxlm.work/home/imgs/64899423_p0.jpg',
    'https://www.cxlm.work/home/imgs/61024101.jpg',
    'https://www.cxlm.work/home/imgs/68203125.jpg',
    'https://www.cxlm.work/home/imgs/63752068_p0.png',
    'https://www.cxlm.work/home/imgs/38967800_p0.jpg'
  ];

  const bgItemListUl = $('#bgModalList'),
    bgModalLinkInp = $('#bgModalLinkInp'),
    bgModalLinkBtn = $('#bgModalLinkBtn');

  let useImgArr = dataManager.getData('bgImgs'),
    bgAnimateHandle = 0;

  // 本地不存在记录，使用默认配置
  if (!useImgArr) useImgArr = defaultImgs;

  // 开始背景图片动画
  const changeBgImg = function () {
    let bgContainer = document.getElementById('bg_container');
    // 如果当前 DOM 结构中不包含背景图片的 container，则无法渲染背景图
    if (!bgContainer) return;

    if (bgAnimateHandle)
      clearInterval(bgAnimateHandle); // 清除原动画计时器
    if (useOption && useImgArr && useImgArr.length) {
      // 背景图 DOM 对象
      let bgDomObj = {
        props: {
          class: 'cxlm-bg_ele cxlm-lt_full',
        }
      }
      let activeDiv = cxlm.buildDom(bgDomObj);
      // 背景图多于一张，需要执行切换
      if (useImgArr.length > 1) {
        let mutedDiv = cxlm.buildDom(bgDomObj);
        bgContainer.appendChild(activeDiv);
        bgContainer.appendChild(mutedDiv);
        const generateNextIndex = () => ~~(Math.random(new Date()) * useImgArr.length);
        let nowIndex = generateNextIndex(),
          nextIndex = generateNextIndex();
        activeDiv.style.backgroundImage = `url("${useImgArr[nowIndex]}")`;
        let bgChangeTime = useOption.bgChangeTime ? useOption.bgChangeTime : 5000;
        bgAnimateHandle = setInterval(async () => {
          if (!cxlm.running) return;
          let nowImgUrl = useImgArr[nextIndex];
          mutedDiv.style.backgroundImage = `url("${nowImgUrl}")`;
          nowIndex = nextIndex;
          nextIndex = generateNextIndex();
          // 调整图层
          mutedDiv.style.zIndex = "9";
          activeDiv.style.zIndex = "10";
          // 透明度调整
          mutedDiv.style.opacity = '1';
          await cxlm.domAnimate(activeDiv, 'opacity', 1, 0, 50);
          let tempDiv = mutedDiv;
          mutedDiv = activeDiv;
          activeDiv = tempDiv;
        }, bgChangeTime);
      } else {
        activeDiv.style.backgroundImage = `url("${useImgArr[0]}")`;
        bgContainer.appendChild(activeDiv);
      }
    } else {
      bgContainer.innerHtml = '';
    }
  }; // -- changeBgImg
  changeBgImg();

  const buildLi = function (link) {
    return cxlm.buildDom({
      tag: 'li',
      style: {
        height: '2.4em',
      },
      props: {
        class: 'list-group-item'
      },
      son: [{
        props: {
          class: 'cxlm-link_show'
        },
        son: [{
          tag: 'a',
          props: {
            href: link,
            target: '_blank',
            class: 'cxlm-modal_a'
          },
          text: link,
        }]
      }, {
        props: {
          class: 'cxlm-link_btn'
        },
        son: [{
          tag: 'button',
          props: {
            class: 'cxlm-trash_btn',
            id: link.hashCode(),
            onclick: `cxlm.bgTool.deleteOne(this)`
          },
          son: [{
            tag: 'i',
            props: {
              class: 'fas fa-trash'
            }
          }]
        }]
      }]
    });
  }

  const showModal = function () {
    bgItemListUl.html(''); // 清空原列表
    let bgUlDom = bgItemListUl[0];
    for (let nowLink of useImgArr) { // 逐个添加到列表
      let liDom = buildLi(nowLink);
      bgUlDom.appendChild(liDom);
    };
    $('#bgModal').modal('show');
  };

  const updateStorage = function () {
    dataManager.setData('bgImgs', useImgArr);
  }

  const deleteOne = async function (ele) {
    if (confirm('确认删除该背景图片？')) {
      let linkHash = ele.id;
      let originLen = useImgArr.length;
      useImgArr = useImgArr.filter(ele => ele.hashCode() != linkHash);
      if (useImgArr.length >= originLen) {
        return alert('无法找到匹配项');
      }
      let toHide = ele.parentElement.parentElement;
      await cxlm.domAnimate(toHide, 'opacity', 1, 0, 20);
      toHide.style.display = 'none';
    }
    updateStorage();
  };

  bgModalLinkBtn.on('click', async () => {
    let link = bgModalLinkInp.val();
    useImgArr.push(link);
    let liDom = buildLi(link);
    liDom.style.opacity = 0;
    bgItemListUl[0].appendChild(liDom);
    await cxlm.domAnimate(liDom, 'opacity', 0, 1, 20);
    updateStorage();
  });

  return {
    showModal,
    deleteOne,
  }
})()