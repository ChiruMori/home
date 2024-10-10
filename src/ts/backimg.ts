import storage from './storage';
import C from './common';
import utils from './utils';
import hosizora from './hosizora';

const backArea = $('#back-area');
const backDropMenu = $('#back-drop-menu');
const registeredBack: Array<BackSupport> = [];

let rejectRegister = false;

function register(backgroupSuppoert: BackSupport): void {
    if (rejectRegister) {
        return console.error('当前状态不支持追加注册');
    }
    registeredBack.push(backgroupSuppoert);
}

function init(): void {
    // 从 Storage 中读取当前使用的背景方案（键）
    let activedBackKey = storage.getData(C.constants.cache.DEFAULT_BACK_KEY);
    activedBackKey = activedBackKey || 'pure_color';
    let activedBack: BackSupport | undefined;
    // 可选方案添加到下拉菜单中
    backDropMenu.empty();
    registeredBack.forEach(backgroupSupport => {
        if (backgroupSupport.key === activedBackKey) {
            activedBack = backgroupSupport;
        }
        const menuItem = $(`<li><a class="dropdown-item" href="#">${backgroupSupport.name}</a></li>`);
        menuItem.on('click', () => {
            activedBack?.unload();
            storage.setData(C.constants.cache.DEFAULT_BACK_KEY, backgroupSupport.key);
            init();
        });
        backDropMenu.append($(menuItem));
    });
    console.info('当前使用的背景方案：', activedBack?.key);

    const backConfigBtn = $('#back-config-btn');
    backConfigBtn.off('click').on('click', () => activedBack?.configureFunction());
    activedBack?.init();
}

// 内置背景方案：纯色
const pureColor: BackSupport = function (): BackSupport {
    let allBackConfig = storage.getData(C.constants.cache.BACKGROUP_KEY);
    if (!allBackConfig) {
        allBackConfig = {};
    }
    let pureColorConfig = allBackConfig.pureColor;
    pureColorConfig = pureColorConfig || '#000000';
    let backDiv: JQuery<HTMLElement>;

    return {
        key: 'pure_color',
        name: '纯色',
        init: function () {
            backDiv = $('<div class="back"></div>');
            backDiv.css('background-color', pureColorConfig);
            backArea.append(backDiv);
        },
        unload: function () {
            backArea.empty();
            console.info('纯色背景方案已卸载');
        },
        configureFunction: function () {
            utils.modalForm({
                title: '选择背景颜色',
                form: [{
                    type: 'color',
                    name: 'back-color-inp',
                    label: '背景颜色',
                    placeholder: '',
                    initValue: pureColorConfig,
                }],
                btns: [{
                    text: '确定',
                    class: 'btn btn-primary',
                    callback: data => {
                        pureColorConfig = allBackConfig.pureColor = data['back-color-inp'] as string;
                        storage.setData(C.constants.cache.BACKGROUP_KEY, allBackConfig);
                        this.unload();
                        init();
                    },
                }],
            });
        }
    }
}();
register(pureColor);

// 内置背景方案：轮播图
const carousel: BackSupport = function (): BackSupport {
    let allBackConfig = storage.getData(C.constants.cache.BACKGROUP_KEY);
    if (!allBackConfig) {
        allBackConfig = {};
    }
    let [maskColor, opacity, imgs, changeTime] = [
        allBackConfig.maskColor || '#000000',
        allBackConfig.maskOpacity || 0.5,
        allBackConfig.imgs || 'https://www.cxlm.work/home/imgs/63752068_p0.png,https://www.cxlm.work/home/imgs/44.jpg',
        allBackConfig.changeTime || 5000,
    ];
    let maskArea: JQuery<HTMLElement>;
    let aboveImg: JQuery<HTMLElement>;
    let belowImg: JQuery<HTMLElement>;
    let imgList: Array<string>;

    let intervalId: NodeJS.Timer;

    const generateNextIndex = () => utils.randomInt(0, imgList.length);
    const clearImgInterval = () => {
        if (intervalId) {
            clearInterval(intervalId); // 清除原动画计时器
        }
    };

    // 开始背景图片动画
    const startCarousel = function () {
        clearImgInterval();
        if (!imgList || imgList.length === 0) {
            return;
        }
        // 背景图多于一张，需要执行切换
        if (imgList.length > 1) {
            let nowIndex = generateNextIndex(),
                nextIndex = generateNextIndex();
            aboveImg.css('background-image', `url("${imgList[nowIndex]}")`);
            intervalId = setInterval(async () => {
                if (!C.config.windowFocus) return;
                let nowImgUrl = imgList[nextIndex];
                belowImg.css('background-image', `url("${nowImgUrl}")`);
                nowIndex = nextIndex;
                nextIndex = generateNextIndex();
                // 调整图层
                belowImg.css('z-index', "9");
                aboveImg.css('z-index', "10");
                // 透明度调整
                belowImg.css('opacity', '1');
                await utils.domAnimate(aboveImg[0], 'opacity', 1, 0, 50);
                [aboveImg, belowImg] = [belowImg, aboveImg];
            }, changeTime);
        } else {
            aboveImg.css('background-image', `url("${imgList[0]}")`);
        }
    }; // changeBgImg

    return {
        key: 'carousel',
        name: '轮播图',
        init: function () {
            imgList = imgs.split(',');

            maskArea = $('<div class="back"></div>');
            maskArea.css('background-color', maskColor);
            maskArea.css('opacity', opacity);
            maskArea.css('z-index', 12);
            aboveImg = $('<div id="back-img-area1" class="back back-cover"></div>');
            belowImg = $('<div id="back-img-area2" class="back back-cover"></div>');
            backArea.append(aboveImg);
            backArea.append(belowImg);
            backArea.append(maskArea);
            startCarousel();
        },
        unload: function () {
            clearImgInterval();
            backArea.empty();
            console.log('轮播图背景方案已卸载');
        },
        configureFunction: function () {
            utils.modalForm({
                title: '轮播图配置',
                form: [{
                    type: 'color',
                    name: 'mask-color-inp',
                    label: '遮罩颜色',
                    placeholder: '',
                    initValue: maskColor,
                }, {
                    type: 'number',
                    name: 'mask-opacity-inp',
                    label: '遮罩透明度',
                    placeholder: '输入遮罩层透明度，0-1',
                    initValue: opacity,
                }, {
                    type: 'number',
                    name: 'change-time-inp',
                    label: '背景图切换时间',
                    placeholder: '输入背景图切换时间，单位毫秒',
                    initValue: changeTime,
                }, {
                    type: 'textarea',
                    name: 'imgs-inp',
                    label: '图片地址',
                    placeholder: '输入图片地址，多个用英文逗号分隔',
                    initValue: imgs,
                }],
                btns: [{
                    text: '确定',
                    class: 'btn btn-primary',
                    callback: data => {
                        maskColor = allBackConfig.maskColor = data['mask-color-inp'] as string;
                        opacity = allBackConfig.maskOpacity = data['mask-opacity-inp'] as number;
                        imgs = allBackConfig.imgs = data['imgs-inp'] as string;
                        changeTime = allBackConfig.changeTime = data['change-time-inp'] as number;
                        storage.setData(C.constants.cache.BACKGROUP_KEY, allBackConfig);
                        this.unload();
                        init();
                    },
                }],
            });
        }
    }
}();
register(carousel);

// 注册外部背景方案
register(hosizora);

export = { init }