
/**
 * 全局配置
 */
const globalConfig = {
    debugMode: true,
    editMode: false,
    windowFocus: true,
    search: Array<SearchConfig>({
        icon: 'fab fa-google',
        title: '谷歌',
        url: 'https://www.google.com/search',
        key: 'q',
        holder: '谷歌搜索',
    }, {
        icon: 'fab fa-github',
        title: 'Github',
        url: 'https://github.com/search',
        key: 'q',
        holder: 'Github',
    }, {
        icon: 'fas fa-paw',
        title: '百度',
        url: 'https://www.baidu.com/s',
        key: 'wd',
        holder: '百度一下',
    }, {
        icon: 'fab fa-microsoft',
        title: '必应',
        url: 'https://cn.bing.com/search',
        key: 'q',
        holder: '必应搜索',
    }, {
        icon: 'fas fa-image',
        title: '壁纸',
        url: 'https://wallhaven.cc/search',
        key: 'q',
        holder: '壁纸',
    }, {
        icon: 'fab fa-dribbble',
        title: '创意',
        url: 'https://dribbble.com/search',
        key: 'q',
        holder: '创意与素材',
    }),
    defaultBookmarkGrps: Array<BookmarkGroupConfig>({
        title: '常用',
        elements: Array<BookmarkConfig>({
            title: 'Github',
            subTitle: '探察と発見',
            action: 'https://github.com',
            icon: 'fab fa-github',
        }),
    }),
}

/**
 * 全局常量
 */
const constants: ConstantStore = {
    cache: {
        SEARCH_ENGINE_KEY: 'search-engine',
        BOOKMAEKS_KEY: 'bookmarks_v2',
        DEFAULT_BACK_KEY: 'default-back',
        BACKGROUP_KEY: 'backgroup',
    } as ConstantStore,
    EDIT_MODE_CHANGE_EVENT: 'edit-mode-change',
    WINDOW_FOCUS_EVENT: 'window-focus',
    WINDOW_BLUR_EVENT: 'window-blur',
    WINDOW_RESIZE_EVENT: 'window-resize',
    WINDOW_CLICK_EVENT: 'window-click',
}

export = { config: globalConfig, constants }

let b : {[k: string]: string} = {}