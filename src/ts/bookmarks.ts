// *********************
// 书签支持
// *********************
import utils from './utils';
import storage from './storage';
import C from './common';


function compareBookmarkConfig(a: BookmarkConfig, b: BookmarkConfig): number {
    let bWeight = b.weight ? Number(b.weight) : 0;
    let aWeight = a.weight ? Number(a.weight) : 0;
    let res = bWeight - aWeight;
    return res ? res : 0;
}

function compareBkmkGrpConfig(a: BookmarkGroupConfig, b: BookmarkGroupConfig): number {
    let bWeight = b.weight ? Number(b.weight) : 0;
    let aWeight = a.weight ? Number(a.weight) : 0;
    let res = bWeight - aWeight;
    return res ? res : 0;
}

let bookmarks = storage.getData(C.constants.cache.BOOKMAEKS_KEY);
if (!bookmarks) {
    bookmarks = C.config.defaultBookmarkGrps;
    console.info('未配置书签，使用默认配置占位');
}
let bookmarkGrps = bookmarks as Array<BookmarkGroupConfig>;

/**
 * 删除当前配置的书签
 */
function delBookmark(grp: BookmarkGroupConfig, bmk: BookmarkConfig): boolean {
    // 不能删除最后一个元素，并提示
    if (grp.elements.length === 1) {
        utils.showToast('操作失败', '', '不能再删了，再删没喽。');
        return false;
    }
    if (!confirm('确定删除书签？')) {
        return false;
    }
    let index = grp.elements.indexOf(bmk);
    if (index >= 0) {
        grp.elements.splice(index, 1);
    }
    storage.setData(C.constants.cache.BOOKMAEKS_KEY, bookmarks);
    return true;
}

// 书签组功能函数

function delGrp(grp: BookmarkGroupConfig): boolean {
    // 不能删除最后一个组
    if (bookmarks.length === 1) {
        utils.showToast('操作失败', '', '不能再删了，再删没喽。');
        return false;
    }
    if (!confirm('确定删除书签组？')) {
        return false;
    }
    let index = bookmarks.indexOf(grp);
    if (index >= 0) {
        bookmarks.splice(index, 1);
    }
    storage.setData(C.constants.cache.BOOKMAEKS_KEY, bookmarks);
    return true;
}

function addToGrp(grp: BookmarkGroupConfig): void {
    utils.modalForm({
        title: '添加书签',
        form: buildModalFormParam(),
        btns: [{
            text: '添加',
            class: 'btn btn-primary',
            callback: function (data) {
                let bmk: BookmarkConfig = {
                    title: data['bkmk-title'] as string,
                    subTitle: data['bkmk-subtitle'] as string,
                    icon: data['bkmk-icon'] as string,
                    action: data['bkmk-action'] as string,
                    weight: data['bkmk-weight'] as string,
                };
                grp.elements.push(bmk);
                grp.elements.sort(compareBookmarkConfig);
                storage.setData(C.constants.cache.BOOKMAEKS_KEY, bookmarks);
                initBookmarks();
            },
        }],
    });
}

function buildModalFormParam(defaultVal?: BookmarkConfig) {
    return [{
        type: 'text',
        name: 'bkmk-title',
        label: '书签名',
        placeholder: '书签大标题',
        initValue: defaultVal ? defaultVal.title : '',
    }, {
        type: 'text',
        name: 'bkmk-subtitle',
        label: '书签描述',
        placeholder: '书签副标题',
        initValue: defaultVal ? defaultVal.subTitle : '',
    }, {
        type: 'text',
        name: 'bkmk-icon',
        label: '书签图标',
        placeholder: '书签图标，fa-icon名称，或 URL',
        initValue: defaultVal ? defaultVal.icon : '',
    }, {
        type: 'text',
        name: 'bkmk-action',
        label: '书签动作',
        placeholder: '书签动作，URL 或 JS 代码片段',
        initValue: defaultVal ? defaultVal.action : '',
    }, {
        type: 'number',
        name: 'bkmk-weight',
        label: '书签权重',
        placeholder: '书签权重，越大越靠前，默认为 0',
        initValue: defaultVal ? defaultVal.weight : '',
    }];
}

function renameGrp(grp: BookmarkGroupConfig): void {
    utils.modalForm({
        title: '编辑书签组',
        form: [{
            type: 'text',
            name: 'bkmk-title',
            label: '书签组名',
            placeholder: '书签组名',
            initValue: grp.title ? grp.title : '',
        }, {
            type: 'number',
            name: 'bkmk-weight',
            label: '书签组权重',
            placeholder: '书签组权重，越大越靠前，默认为 0',
            initValue: grp.weight ? grp.weight : '',
        }],
        btns: [{
            text: '修改',
            class: 'btn btn-primary',
            callback: function (data) {
                Object.assign(grp, {
                    title: data['bkmk-title'] as string,
                    weight: data['bkmk-weight'] as string,
                });
                bookmarks.sort(compareBkmkGrpConfig);
                storage.setData(C.constants.cache.BOOKMAEKS_KEY, bookmarks);
                initBookmarks();
            }
        }],
    });
}

function newGrp(): void {
    utils.modalForm({
        title: '新建书签组',
        form: [{
            type: 'text',
            name: 'bkmk-title',
            label: '书签组名',
            placeholder: '书签组名',
        }, {
            type: 'number',
            name: 'bkmk-weight',
            label: '书签组权重',
            placeholder: '书签组权重，越大越靠前，默认为 0',
        }],
        btns: [{
            text: '确认',
            class: 'btn btn-primary',
            callback: function (data) {
                let newGrp: BookmarkGroupConfig = {
                    title: data['bkmk-title'] as string,
                    weight: data['bkmk-weight'] as string,
                    elements: C.config.defaultBookmarkGrps[0].elements,
                };
                bookmarks.push(newGrp);
                bookmarks.sort(compareBkmkGrpConfig);
                storage.setData(C.constants.cache.BOOKMAEKS_KEY, bookmarks);
                initBookmarks();
            }
        }],
    });
}

/**
 * 初始化书签组功能区
 */
function initBookmarks(): void {
    const bookmarkArea = $('#bookmark-area');
    bookmarkArea.empty();

    bookmarkGrps.forEach(grpConfig => {
        // 构建外层容器、标题区域
        const bookmarkGrpEle = $(`<div class="bmg">
          <p class="bmg-title fs-4 mb-0">
            <strong>${grpConfig.title}</strong>
            <span class="grp-btns">
              <span class="title-del-btn"><i class="fas fa-minus-circle text-major"></i></span>
              <span class="title-add-btn"><i class="fas fa-plus-circle text-major title-add-btn"></i></span>
              <span class="title-edit-btn"><i class="fas fa-edit text-major title-edit-btn"></i></span>
            </span>
          </p>
        </div>`);
        bookmarkGrpEle.find('.title-del-btn').on('click', () => {
            let deleted = delGrp(grpConfig);
            if (deleted) {
                bookmarkGrpEle.remove();
            }
        });
        bookmarkGrpEle.find('.title-add-btn').on('click', () => addToGrp(grpConfig));
        bookmarkGrpEle.find('.title-edit-btn').on('click', () => renameGrp(grpConfig));
        // 非编辑模式隐藏按钮组
        const btnGrp = bookmarkGrpEle.find('.grp-btns');
        utils.EventCenter.subscribe(C.constants.EDIT_MODE_CHANGE_EVENT, {
            // 防止书签组重名导致的键冲突
            key: 'bkmk-edit-sync' + grpConfig.title + new Date().getTime() % 1000,
            callback: (editMode: boolean) => btnGrp.toggleClass('d-none', !editMode),
        });
        // 构建组书签内容
        const bookmarksContainer = $('<div class="row p-2"></div>');
        grpConfig.elements.forEach(bookmark => {
            let iconHtml = bookmark.icon.startsWith('http')
                ? `<img class="img-fluid rounded-start" src="${bookmark.icon}"/>`
                : `<i class="img-fluid rounded-start ${bookmark.icon}"></i>`;

            let actionShort = bookmark.action.length > 10 ? bookmark.action.substring(0, 10) + '...' : bookmark.action;
            let bookmarkEle = $(`<div class="bmg-flow col-sm-4 col-md-3"></div>`);
            // let delBall = $(`<span class="del-btn"><i class="fas fa-minus-circle"></i></span>`);
            let aArea = $(`<a href="javascript:" class="bmg-item text-black" title="${actionShort}">
                  <div class="bmg-item-icon">${iconHtml}</div>
                  <div class="bmg-item-content">
                    <strong class="bm-title">${bookmark.title}</strong>
                    <small class="bm-text text-white-50">${bookmark.subTitle}</small>
                  </div>
                </a>`);
            // 绑定事件
            aArea.on('click', () => {
                if (C.config.editMode) {
                    return utils.modalForm({
                        title: '修改书签',
                        form: buildModalFormParam(bookmark),
                        btns: [{
                            text: '确认',
                            class: 'btn btn-primary',
                            callback: function (data) {
                                Object.assign(bookmark, {
                                    title: data['bkmk-title'] as string,
                                    subTitle: data['bkmk-subtitle'] as string,
                                    icon: data['bkmk-icon'] as string,
                                    action: data['bkmk-action'] as string,
                                    weight: data['bkmk-weight'] as string,
                                });
                                grpConfig.elements.sort(compareBookmarkConfig);
                                storage.setData(C.constants.cache.BOOKMAEKS_KEY, bookmarks);
                                initBookmarks();
                            },
                        }, {
                            text: '删除',
                            class: 'btn btn-danger',
                            callback: function () {
                                let deleted = delBookmark(grpConfig, bookmark);
                                if (deleted) {
                                    bookmarkEle.remove();
                                }
                            }
                        }],
                    });
                }
                if (bookmark.action.startsWith('http')) {
                    window.open(bookmark.action, '_blank');
                } else {
                    eval(bookmark.action);
                }
            });
            // 组装各组件
            // bookmarkEle.append(delBall);
            bookmarkEle.append(aArea);
            bookmarksContainer.append(bookmarkEle);
        });
        bookmarkGrpEle.append(bookmarksContainer);
        bookmarkArea.append(bookmarkGrpEle);
    });
}

export = { init: initBookmarks, newGrp };