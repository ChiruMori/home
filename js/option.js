'use strict';

// 注入命名空间到全局
if (typeof window.cxlm !== 'object') {
  window.cxlm = {}
};

// 默认配置
if (!useOption) {
  useOption = {
    wrapper: 'wrapper', // 包装 div 的 ID
    bgChangeTime: null, // 背景图切换时间间隔，单位 ms，默认 5000
    mainWidth: 0.8, // 主显示区域宽高比例
    mainHeight: 0.6,
    moveFactor: 0.2, // 移动系数，这个数越大则移动越灵敏
    searchEnginePrefix: 'https://www.google.com/search?q=',
    dom: {
      props: {
        id: 'container'
      },
      son: [{
        props: {
          class: 'cxlm-full_bg cxlm-lt_full',
          id: 'bg_container',
        },
      }, {
        props: {
          id: 'main_area',
        },
        son: [{
          tag: 'form',
          props: {
            id: 'search_form',
            onsubmit: 'return inputSearch()',
          },
          son: [{
            tag: 'input',
            props: {
              title: '谷歌搜索',
              placeholder: '键入回车以搜索，支持 URL',
              type: 'text',
              id: 'search_inp',
              class: 'cxlm-search_inp',
              autocomplete: 'off',
              onfocus: 'cxlm.domAnimate(this, "width", this.parentElement.clientWidth * 0.4, this.parentElement.clientWidth * 0.8, 15, "px")',
              onblur: 'cxlm.domAnimate(this, "width", this.parentElement.clientWidth * 0.8, this.parentElement.clientWidth * 0.4, 15, "px")',
            }
          }]
        }, {
          tag: 'script',
          text: `
          function inputSearch(){
            let keyWord = document.getElementById('search_inp').value;
            cxlm.search(keyWord);
            return false;
          };
        `,
        }, {
          props: {
            id: 'btn_area',
            class: 'cxlm-btn_area',
          },
          son: cxlm.buildBookmarkDom(),
        }, {
          props: {
            id: 'tools',
            class: 'cxlm-tools'
          },
          son: [{
            props: {
              id: 'imgTool',
              class: 'cxlm-tool',
              onclick: 'cxlm.bgTool.showModal();',
            },
            son: [{
              tag: 'i',
              props: {
                class: 'fas fa-image'
              }
            }, {
              tag: 'span',
              text: ' 背景图'
            }]
          }, {
            props: {
              id: 'backTool',
              class: 'cxlm-tool',
              onclick: 'backupAllData()'
            },
            son: [{
              tag: 'i',
              props: {
                class: 'fas fa-save'
              }
            }, {
              tag: 'span',
              text: ' 备份'
            }],
          }, {
            props: {
              id: 'recoverTool',
              class: 'cxlm-tool',
              onclick: 'recoverAllData()',
            },
            son: [{
              tag: 'i',
              props: {
                class: 'fas fa-recycle'
              }
            }, {
              tag: 'span',
              text: ' 恢复'
            }]
          }, {
            tag: 'script',
            text: `
            function backupAllData(){
              dataManager.backup((msg)=>{
                if(cxlm.copyToBoard(msg)){
                  cxlm.showToast('完成操作', '您需要完成以下的操作', '数据已经复制到剪贴板，请将其粘贴、保存。在恢复数据时您将需要这个数据。');
                }else{
                  alert('拷贝失败，请查看控制台获取请求的数据');
                  console.log(msg);
                }
              });
            };
            function recoverAllData(){
              let dataStr = prompt('请将数据拷贝到这里', '');
              if(!dataStr) return;
              dataManager.recover(dataStr);
              window.location.reload();
            }
          `
          }]
        }]
      }, {
        props: {
          class: 'modal fade',
          id: 'bmModal',
          tabindex: '-1',
          role: 'dialog',
          'aria-labelledby': 'mTitle',
          'aria-hidden': 'true',
        },
        son: [{ // <div class="modal-dialog" role="">
          props: {
            class: 'modal-dialog',
            role: 'document',
          },
          son: [{ // <div class="modal-content">
            props: {
              class: 'modal-content'
            },
            son: [{ // <div class="modal-header">
              props: {
                class: 'modal-header',
              },
              son: [{ // <h5 class="modal-title" id="bmTitle">书签信息</h5>
                tag: 'h5',
                props: {
                  class: 'modal-title',
                  id: 'bmTitle',
                },
                text: '书签信息',
              }, { // <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                tag: 'button',
                props: {
                  type: 'button',
                  class: 'close',
                  'data-dismiss': 'modal',
                  'aria-label': 'Close',
                },
                son: [{ // <span aria-hidden="true">&times;</span>
                  tag: 'span',
                  props: {
                    'aria-hidden': 'true'
                  },
                  text: '×'
                }]
              }]
            }, { // <div class="modal-body">
              props: {
                class: 'modal-body'
              },
              son: [{ // <form>
                tag: 'form',
                son: [{ // <div class="form-group">
                  props: {
                    class: 'form-group'
                  },
                  son: [{ // <label for="" class="col-form-label"></label>
                    tag: 'label',
                    props: {
                      for: 'bmIcon',
                      class: 'col-form-label'
                    },
                    text: '图标:'
                  }, { // <input type="text" class="form-control" id="bmIcon" placeholder="支持链接、font awesome 图标">
                    tag: 'input',
                    props: {
                      type: 'text',
                      class: 'form-control',
                      id: 'bmIcon',
                      placeholder: '支持链接、font awesome 图标'
                    }
                  }]
                }, { // <div class="form-group">
                  props: {
                    class: 'form-group'
                  },
                  son: [{ // <label for="bmText" class="col-form-label"></label>
                    tag: 'label',
                    props: {
                      for: 'bmText',
                      class: 'col-form-label'
                    },
                    text: '文本:'
                  }, { // <input type="text" class="form-control" id="bmText" placeholder="书签名">
                    tag: 'input',
                    props: {
                      type: 'text',
                      class: 'form-control',
                      id: 'bmText',
                      placeholder: '书签名'
                    }
                  }]
                }, { // <div class="form-group">
                  props: {
                    class: 'form-group'
                  },
                  son: [{ // <label for="bmLink" class="col-form-label">链接:</label>
                    tag: 'label',
                    props: {
                      for: 'bmLink',
                      class: 'col-form-label'
                    },
                    text: '链接:'
                  }, { // <input type="text" class="form-control" id="bmLink" placeholder="书签链接">
                    tag: 'input',
                    props: {
                      type: 'text',
                      class: 'form-control',
                      id: 'bmLink',
                      placeholder: '书签链接'
                    }
                  }]
                }, { // <div class="form-group">
                  props: {
                    class: 'form-group'
                  },
                  son: [{ // <label for="bmWeight" class="col-form-label">权重:</label>
                    tag: 'label',
                    props: {
                      for: 'bmWeight',
                      class: 'col-form-label'
                    },
                    text: '权重:'
                  }, { // <input type="text" class="form-control" id="bmWeight" placeholder="该书签权重，这决定了它的位置">
                    tag: 'input',
                    props: {
                      type: 'text',
                      class: 'form-control',
                      id: 'bmWeight',
                      placeholder: '该书签权重，这决定了它的位置'
                    }
                  }]
                }]
              }]
            }, { // <div class="modal-footer">
              props: {
                class: 'modal-footer',
              },
              son: [{ // <button type="button" id="bmModifyBtn" class="btn btn-primary">修改</button>
                tag: 'button',
                props: {
                  type: 'button',
                  id: 'bmModifyBtn',
                  class: 'btn btn-primary',
                },
                text: '修改'
              }, { // <button type="button" id="bmNewBtn" class="btn btn-primary">新增</button>
                tag: 'button',
                props: {
                  type: 'button',
                  id: 'bmNewBtn',
                  class: 'btn btn-primary',
                  onclick: 'cxlm.modalTool.create()',
                },
                text: '新增'
              }]
            }]
          }]
        }]
      }, { // <div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" id="bgModal">
        tag: 'div',
        props: {
          class: 'modal fade',
          tabindex: '-1',
          role: 'dialog',
          'aria-hidden': 'true',
          id: 'bgModal'
        },
        son: [{ // <div class="modal-dialog">
          props: {
            class: 'modal-dialog',
          },
          son: [{ // <div class="modal-content">
            props: {
              class: 'modal-content'
            },
            son: [{ // <div class="modal-header">
              props: {
                class: 'modal-header',
              },
              son: [{ // <h5 class="modal-title" id="bgModalTitle">背景图设置</h5>
                tag: 'h5',
                props: {
                  class: 'modal-title',
                  id: 'bgModalTitle',
                },
                text: '背景图设置'
              }, { // <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                tag: 'button',
                props: {
                  type: 'button',
                  class: 'close',
                  'data-dismiss': 'modal',
                  'aria-label': 'Close'
                },
                son: [{ // <span aria-hidden="true">×</span>
                  tag: 'span',
                  props: {
                    'aria-hidden': 'true'
                  },
                  text: '×',
                }]
              }]
            }, { // <div class="modal-body cxlm-scroll_modal">
              props: {
                class: 'modal-body cxlm-scroll_modal'
              },
              son: [{ // <ul class="list-group" id="bgModalList" style="max-height: 30em;">
                tag: 'ul',
                props: {
                  class: 'clist-group',
                  id: 'bgModalList'
                },
                style: {
                  maxHeight: '30em',
                },
              }]
            }, { // <div class="modal-footer">
              props: {
                class: 'modal-footer'
              },
              son: [{ // <div class="input-group mb-3">
                props: {
                  class: 'input-group mb-3'
                },
                son: [{ // <input type="text" class="form-control" placeholder="图片链接" aria-label="图片链接" aria-describedby="bgModalLinkBtn" id="bgModalLinkInp">
                  tag: 'input',
                  props: {
                    type: 'text',
                    class: 'form-control',
                    placeholder: '图片链接',
                    'aria-label': '图片链接',
                    'aria-describedby': 'bgModalLinkBtn',
                    'id': 'bgModalLinkInp'
                  }
                }, {
                  props: { // <div class="input-group-append">
                    class: 'input-group-append'
                  },
                  son: [{ // <button class="btn btn-outline-secondary" type="button" id="bgModalLinkBtn">新增</button>
                    tag: 'button',
                    props: {
                      class: 'btn btn-outline-secondary',
                      type: 'button',
                      id: 'bgModalLinkBtn',
                    },
                    text: '新增'
                  }]
                }]
              }]
            }]
          }]
        }]
      }],
    }
  };
  // TODO DOM 结构存储，书签动态 DOM 处理
  // dataManager.setData('opt', useOption);
}