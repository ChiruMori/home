import utils from './utils';
import storage from './storage';
import bkmk from './bookmarks';
import C from './common';
import backimg from './backimg';

// 控制台彩蛋
console.log('%ccxlm@cxlm.work%c2020.01.30 ~ 2022.07.?%c',
    'border-radius:3px;padding:3px;background:#000;color:#fff;',
    'border-radius:3px;padding:3px;background:#0af;color:#fff;',
    'background:transparent;');
console.log('%cWelcome to https://cxlm.work%c',
    'border-radius:3px;padding:3px;background:#FA0;color:#fff;',
    'background:transparent;');


// 搜索引擎支持
// ===============================
function initSearchEngine(): void {
    const searchToggleBtn = $('#search-toggle-btn');
    const searchDropdowns = $('#search-dropdowns');
    const searchForm = $('#search-form');
    const searchInput = $('#search-input');
    const allEngines = C.config.search;
    // 不存在搜索引擎，log.error
    if (allEngines.length === 0) {
        console.error('No search engine configured.');
        return;
    }

    const refreshSearchArea = function () {
        let engine = storage.getData(C.constants.cache.SEARCH_ENGINE_KEY);
        // 未设定搜索引擎时，使用第一个
        if (!engine) {
            engine = allEngines[0].title;
        }

        for (let engineConfig of allEngines) {
            if (engineConfig.title === engine) {
                searchForm.attr('action', engineConfig.url);
                searchInput.attr('placeholder', engineConfig.holder);
                searchToggleBtn.html(`<i class="${engineConfig.icon}"></i>`);
                searchInput.attr('name', engineConfig.key);
                break;
            }
        }
    }

    allEngines.forEach(engineConfig => {
        let dropdown = $(`<li><a class="dropdown-item" href="javascript:;"><i class="${engineConfig.icon}"></i> ${engineConfig.title}</a></li>`);
        dropdown.on('click', () => {
            storage.setData(C.constants.cache.SEARCH_ENGINE_KEY, engineConfig.title);
            refreshSearchArea();
        });
        searchDropdowns.append(dropdown);
    });
    refreshSearchArea();
}

// 编辑模式支持
// ===============================
function initEditMode(): void {
    const navGrp = $('#navGrp');
    utils.EventCenter.subscribe(C.constants.EDIT_MODE_CHANGE_EVENT, {
        key: 'navbar-sync',
        callback: (flag: boolean) => {
            if (C.config.debugMode) {
                console.log('Edit Mode:', flag);
            }
            C.config.editMode = flag;
            navGrp.toggleClass('edit', flag);
        }
    });
    $('#enter-edit-btn').on('click', () => {
        utils.EventCenter.publish(C.constants.EDIT_MODE_CHANGE_EVENT, true);
    });
    $('#exit-edit-btn').on('click', () => {
        utils.EventCenter.publish(C.constants.EDIT_MODE_CHANGE_EVENT, false);
    });
    // 初始化结束后，推一条默认消息，方便一些模块的初始化处理
    utils.EventCenter.publish(C.constants.EDIT_MODE_CHANGE_EVENT, C.config.editMode);
}

// 编辑模式下，底部按钮支持
// ===============================
function initEditModeBtns(): void {
    // 书签组底部按钮组
    let btnGrp = $('#edit-btns');
    // 编辑模式时展示
    utils.EventCenter.subscribe(C.constants.EDIT_MODE_CHANGE_EVENT, {
        key: 'footer-btns',
        callback: (flag: boolean) => {
            btnGrp.toggleClass('d-none', !flag);
        }
    });
    let recoveryBtn = $(`<button class="btn btn-outline-secondary btn0af" type="button" id="edit-btn-recovery">
      <i class="fas fa-redo"></i> 备份恢复
    </button>`)
    let newGrpBtn = $(`<button class="btn btn-outline-secondary btn0af" type="button" id="new-grp-btn">
      <i class="fas fa-folder-plus"></i> 新建组
    </button>`)
    let backConfigureBtn = $(`<button class="btn btn-outline-secondary btn0af" type="button" id="back-config-btn">
      <i class="fas fa-folder-plus"></i> 背景设置
    </button>`)
    // 备份恢复按钮事件
    recoveryBtn.on('click', () => {
        let backupObj: { [key: string]: any } = {};
        for (let key in C.constants.cache) {
            let cacheKey = C.constants.cache[key];
            backupObj[cacheKey] = storage.getData(cacheKey);
        };

        // 中文编码
        let encoded = encodeURIComponent(JSON.stringify(backupObj));
        // base64 编码
        let base64 = btoa(encoded);
        utils.modalForm({
            title: '备份与恢复',
            form: [{
                type: 'textarea',
                name: 'backup-inp',
                label: '备份码',
                placeholder: '将需要恢复的数据（备份码）拷贝到这里',
                initValue: base64,
            }],
            btns: [{
                text: '解析并恢复',
                class: 'btn btn-primary',
                callback: data => {
                    let backupObj;
                    try {
                        let rawBase64 = data['backup-inp'] as string;
                        let rawDeBased = atob(rawBase64);
                        let rawDeEncoded = decodeURIComponent(rawDeBased);
                        backupObj = JSON.parse(rawDeEncoded);
                    } catch (e) {
                        utils.showToast('错误', '备份恢复', '无法解析备份码，请检查');
                        console.error(e);
                        return;
                    }
                    for (let key in backupObj) {
                        storage.setData(key, backupObj[key]);
                    }
                    window.location.reload();
                }
            }],
        })
    });
    // 新增书签组按钮
    newGrpBtn.on('click', bkmk.newGrp);
    // 组装
    btnGrp.append(recoveryBtn);
    btnGrp.append(newGrpBtn);
    btnGrp.append(backConfigureBtn);
}

// 绑定关注的全局事件
// ===============================
function bindGlobalEvents(): void {
    window.addEventListener('focus', () => {
        utils.EventCenter.publish(C.constants.WINDOW_FOCUS_EVENT);
        C.config.windowFocus = true;
    });
    window.addEventListener('blur', () => {
        utils.EventCenter.publish(C.constants.WINDOW_BLUR_EVENT);
        C.config.windowFocus = false;
    });
    window.addEventListener('resize', () => {
        utils.EventCenter.publish(C.constants.WINDOW_RESIZE_EVENT);
    });
    window.addEventListener('click', (event: MouseEvent) => {
        utils.EventCenter.publish(C.constants.WINDOW_CLICK_EVENT, event);
    });
}

// 初始化搜索引擎
initSearchEngine();
// 初始化书签
bkmk.init();
// 初始化底部按钮组
initEditModeBtns();
// 初始化编辑功能区
initEditMode();
// 初始化全局事件监听
bindGlobalEvents();
// 初始化背景区域
backimg.init();
