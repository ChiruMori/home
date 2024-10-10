// 库类型声明补充，没有标准 d.ts 的类型声明文件
// =================================


// 自定义类型
// =================================
interface SearchConfig {

    /**
     * 图标，如 fas fa-search
     */
    icon: string;

    /**
     * 2~3字的提示文字，如咕狗
     */
    title: string;

    /**
     * 搜索引擎的 URL
     */
    url: string;

    /**
     * 搜索的关键字参数名，如 q
     */
    key: string;

    /**
     * 显示在搜索框 placeholder 中的文字
     */
    holder: string;
}

interface BookmarkConfig {

    /**
     * 图标，如 fas fa-search，可以是网址
     */
    icon: string;

    /**
     * 大标题
     */
    title: string;

    /**
     * 副标题
     */
    subTitle: string;

    /**
     * 点击后的动作，可以为网址，也可以是函数
     */
    action: string;

    /**
     * 权重，越大越靠前
     */
    weight?: string;
}

interface BookmarkGroupConfig {

    /**
     * 该组下的书签
     */
    elements: Array<BookmarkConfig>;

    /**
     * 组的标题
     */
    title: string;

    /**
     * 权重，越大越靠前
     */
    weight?: string;
}

interface FormItemConfig {

    /**
     * 变量名
     */
    name: string;

    /**
     * Placeholder
     */
    placeholder: string;

    /**
     * text | number 等
     */
    type: string;

    /**
     * 提示文字
     */
    label: string;

    /**
     * 默认值
     */
    initValue?: string;
}

interface BtnConfig {

    /**
     * 按钮上显示的文字
     */
    text: string;

    /**
     * 按钮使用的 css 类
     */
    class: string;

    /**
     * 按钮点击后的回调，表单内容会作为参数传入
     */
    callback: (object) => any;
}

interface FormModalConfig {

    /**
     * 标题
     */
    title: string;

    /**
     * 表单
     */
    form: Array<FormItemConfig>;

    /**
     * 底部按钮组
     */
    btns: Array<BtnConfig>;
}

interface EvtConsumer {

    /**
     * 消费者的唯一键
     */
    key: string;

    /**
     * 消费者的处理函数
     */
    callback: Function;

    /**
     * 消费多少次后自动取消订阅，默认 -1 表示永远不取消订阅
     */
    times?: number = -1;
}

interface ConstantStore {
    [key: string]: any;
}

interface BackSupport {

    /**
     * 键名
     */
    key: string;

    /**
     * 显示名
     */
    name: string;

    /**
     * 点击编辑按钮后的监听函数
     */
    configureFunction: () => void;

    /**
     * 初始化函数
     */
    init: () => void;

    /**
     * 释放资源
     */
    unload: () => void;
}
