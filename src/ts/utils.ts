/// <reference path="lib.d.ts" />  // 引入 lib.d.ts 文件

// ****************************************
// 工具方法
// ****************************************

const toastArea = $('#toast-area');
/**
 * 显示一个 toast 弹窗，过一段时间自动消失
 * 
 * @param title 标题
 * @param subTitle 副标题
 * @param msg 要显示的消息内容
 * @param duration 要持续显示的时长，单位 ms，默认 2000ms
 */
const showToast = async function (title: string = '', subTitle: string = '',
    msg: string = '', duration: number = 2000): Promise<void> {

    let htmlStr: string = `<div role="alert" aria-live="assertive" aria-atomic="true" class="toast mt-2" data-autohide="false">
      <div class="toast-header">
        <strong class="mr-auto" id="mainTitle">${title}</strong>
        <small id="subTitle">${subTitle}</small>
      </div>
      <div class="toast-body" id="msgArea">
        ${msg}
      </div>
    </div>`;
    let toastJqObj: JQuery = $(htmlStr);
    toastArea.append(toastJqObj);
    toastJqObj.toast('show');
    await sleep(duration);
    toastJqObj.toast('dispose');
};

/**
 * 模态弹窗显示一个表单，通过按钮点击后获取表单数据
 * 
 * @param config 弹窗表单配置
 */
const modalForm = function (config: FormModalConfig): void {
    let template = $(`<div class="modal fade show" id="form-modal" tabindex="-1" role="dialog" aria-labelledby="mTitle" aria-modal="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="bmTitle">${config.title}</h5>
          </div>
          <div class="modal-body">
            <form id="modal-content-form"></form>
          </div>
          <div class="modal-footer" id="modal-footer-btns"></div>
        </div>
      </div>
    </div>`);
    const contentForm = template.find('#modal-content-form');
    const modalFooterBtns = template.find('#modal-footer-btns');
    config.form.forEach(item => {
        let field = $(`<div class="form-group">
              <label for="${item.name}" class="col-form-label">${item.label}:</label>
            </div>`)
        let inp;
        if (item.type === 'textarea') {
            inp = $(`<textarea class="form-control" id="${item.name}" name="${item.name}" placeholder="${item.placeholder}"></textarea>`);
        } else {
            inp = $(`<input type="${item.type}" class="form-control" id="${item.name}" name="${item.name}" placeholder="${item.placeholder}">`);
        }
        if (item.initValue) {
            inp.val(item.initValue);
        }
        field.append(inp);
        contentForm.append(field);
    });
    config.btns.forEach(item => {
        let btn = $(`<button type="button" class="${item.class}">${item.text}</button>`);
        // 从表格中取数据，构建后传给按钮的回调函数
        btn.on('click', () => {
            let formData: any = {};
            config.form.forEach(field => formData[field.name] = contentForm.find(`#${field.name}`).val());
            item.callback(formData);
            template.modal('hide');
        });
        modalFooterBtns.append(btn);
    });
    $(document.body).append(template);
    template.modal('show');
    template.on('hidden.bs.modal', () => template.remove());
}


/**
 * 节点 CSS 属性动画
 * @param {HTMLElement} ele 需要做动画处理的 html 节点
 * @param {String} attr 动画作用的属性
 * @param {Number} from 属性初始值
 * @param {Number} to 属性结束值
 * @param {Number} frame 动画帧数
 * @param {String} suffix css 属性尾缀
 */
const domAnimate = function (ele: HTMLElement, attr: string, from: number, to: number,
    frame: number, suffix: string = ''): Promise<void> {

    return new Promise(async (res) => {
        const frameTime = 20;
        let stepValue = (to - from) / frame;
        let targetNode = $(ele);
        targetNode.css(attr, from + suffix);
        while (Math.abs(from - to) >= Math.abs(stepValue)) {
            from += stepValue;
            targetNode.css(attr, from + suffix);
            await sleep(frameTime);
        }
        targetNode.css(attr, to + suffix);
        res();
    });
};

/** 休眠指定毫秒数 */
const sleep = function (time: number): Promise<void> {
    return new Promise(function (resolve, _reject) {
        setTimeout(() => resolve(), time);
    })
};

/**
 * 生成随机整数
 * 
 * @param min 最小值（包含）
 * @param max 最大值（不包含）
 */
const randomInt = function (min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * 生成随机数
 * 
 * @param min 最小值（包含）
 * @param max 最大值（不包含）
 */
const randomNumber = function(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}


/**
 * 简易发布订阅模型，发布时需要同步等待所有订阅者执行完毕
 * 发布时没有订阅者时，直接丢弃
 */
class EventCenter {

    // 事件列表
    public static events: { [eventName: string]: Map<String, EvtConsumer> } = {};

    /**
     * 订阅事件
     */
    public static subscribe(eventName: string, consumer: EvtConsumer) {
        if (!this.events[eventName]) {
            this.events[eventName] = new Map();
        }
        this.events[eventName].set(consumer.key, consumer);
    }

    /**
     * 发布事件
     */
    public static publish(eventName: string, ...args: any[]) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName].forEach((consumer, k) => {
            consumer.callback(...args);
            if (consumer.times === 1) {
                this.events[eventName].delete(k);
            } else if (consumer.times) {
                consumer.times--;
            }
        });
    }

    /**
     * 取消订阅
     */
    public static unsubscribe(eventName: string, key: String) {
        if (!this.events[eventName]) {
            return;
        }
        this.events[eventName].delete(key);
    }

}

// ****************************************
// 拓展方法
// ****************************************

declare global {
    interface String {

        /**
         * 扩展字符串方法，与 Java 的 hashCode 行为一致
         * @returns {String} 字符串的 Hash 值
         */
        hashCode(): number;
    }
}

String.prototype.hashCode = function (): number {
    let res: number = 0;
    for (let charIndex = 0, len = this.length; charIndex < len; charIndex++) {
        res = (31 * res + this.codePointAt(charIndex)!) % 2147483648;
    }
    return res;
}

export = { showToast, domAnimate, sleep, modalForm, randomInt, randomNumber, EventCenter };