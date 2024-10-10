import utils from "./utils";
import C from "./common"
import storage from "./storage";

// 天体接口
interface StarInterface {
    draw(): void;
    reset(): void;
    resize(size: number): void;
}

// 缩放模式枚举
enum ZoomEnum {
    // 放大
    IN = 1.001,
    // 缩小
    OUT = 0.999,
    // 固定
    FIX = 1,
}

const PI2 = Math.PI * 2;
const SPEED_DECAY = 80_0000;

/**
 * 星空特效
 */
export = (function (): BackSupport {

    let canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        w: number,
        h: number,
        hue: number,
        stars: Array<StarInterface>,
        // 半径配置
        minRadius: number,
        maxRadius: number,
        zoomStatus = ZoomEnum.OUT,
        // 星星初始半径
        starRadius = 50,
        // 计数器
        starCounter = 0,
        frameCounter = 0,
        // 动画未加载
        unload = true;

    let allBackConfig = storage.getData(C.constants.cache.BACKGROUP_KEY);
    if (!allBackConfig) {
        allBackConfig = {};
    }
    const container = document.getElementById("back-area");
    let backDiv: HTMLDivElement;

    // 数量配置
    let maxStars: number = allBackConfig.maxStars ? allBackConfig.maxStars : 20;
    let maxConstellation: number = allBackConfig.maxConstellation ? allBackConfig.maxConstellation : 10;
    let backImgUrl: string = allBackConfig.backImgUrl ? allBackConfig.backImgUrl : './res/hosizora.jpg';

    /** 闭包工厂，生产星星缓存画布对象，有则共享，无则创建 */
    const CacheFactory = (function () {
        const cacheData: { [key: number]: HTMLCanvasElement } = {};

        /** 绘制星星并返回画布对象 */
        const drawCache = function (hueValue: number): HTMLCanvasElement | null {
            let canvasTemp = document.createElement('canvas'),
                tempCtx = canvasTemp.getContext('2d');
            canvasTemp.width = starRadius * 2;
            canvasTemp.height = starRadius * 2;
            // 渐变圆，圆心开始，50为渐变半径
            let gradient2 = tempCtx?.createRadialGradient(starRadius, starRadius, 0, starRadius, starRadius, starRadius);
            if (!gradient2 || !tempCtx) {
                console.error('无法创建绘图对象：RadialGradient');
                return null;
            }
            // 渐变半径上设置渐变色
            gradient2.addColorStop(0.025, '#CCC');
            gradient2.addColorStop(0.1, 'hsl(' + hueValue + ', 61%, 33%)');
            gradient2.addColorStop(0.25, 'hsl(' + hueValue + ', 64%, 6%)');
            gradient2.addColorStop(1, 'transparent');
            // 绘制星星缓存
            tempCtx.fillStyle = gradient2;
            tempCtx.beginPath();
            tempCtx.arc(starRadius, starRadius, starRadius, 0, PI2);
            tempCtx.fill();
            return canvasTemp;
        }
        return {
            createCache: function (hue: number): HTMLCanvasElement | null {
                if (cacheData[hue]) {
                    return cacheData[hue];
                }
                let drawedCanvas = drawCache(hue);
                if (drawedCanvas) {
                    cacheData[hue] = drawedCanvas;
                }
                return drawedCanvas;
            }
        }
    })()

    /** 星星类，实现星星接口 */
    class Star implements StarInterface {

        // 透明度
        public alpha: number = 1;
        // 轨道半径
        public orbitRadius: number = 0;
        // 星星半径
        public radius: number = 0;
        // 转过的角度（相位）
        public timePassed: number = 0;
        // 星星坐标
        public x: number = 0;
        public y: number = 0;
        // 移动速度
        public speed: number = 0;

        // 绘图画布对象
        private canvas: HTMLCanvasElement | null;
        // 轨道中心 x 坐标
        private orbitX: number = 0;
        // 轨道中心 y 坐标
        private orbitY: number = 0;
        // 跳过本次绘制
        private pass: boolean = false;

        constructor(hue: number, jumpInit: boolean = false) {
            // 轨道坐标
            this.orbitX = w / 2;
            this.orbitY = h / 2;
            // Start 对象享元
            this.canvas = CacheFactory.createCache(hue);
            if (!jumpInit) {
                this.reset();
            }
        }

        /**
         * 静态 builder
         */
        static buildStar(hue: number, alpha: number, orbitRadius: number, radius: number,
            speed: number, timePassed: number, x: number, y: number): Star {
            let builtStar = new Star(hue);
            builtStar.alpha = alpha;
            builtStar.orbitRadius = orbitRadius;
            builtStar.radius = radius;
            builtStar.speed = speed;
            builtStar.timePassed = timePassed;
            builtStar.x = x;
            builtStar.y = y;
            return builtStar;
        }

        /** 重设 */
        reset(): void {
            // 轨道半径
            if (this.orbitRadius === 0) {
                this.orbitRadius = utils.randomNumber(0, maxRadius);
            } else {
                switch (zoomStatus) {
                    case ZoomEnum.IN:
                        this.orbitRadius = utils.randomNumber(0, minRadius * 2);
                        break;
                    case ZoomEnum.OUT:
                        this.orbitRadius = utils.randomNumber(minRadius * 2, maxRadius);
                        break;
                }
            }
            // 天体透明度、半径
            this.alpha = utils.randomNumber(0.2, 1);
            this.radius = utils.randomInt(120, this.orbitRadius) / 16;
            // 随机生成相位
            this.timePassed = utils.randomNumber(0, PI2);
            //星星移动速度，轨道半径越大，速度越快
            this.speed = utils.randomNumber(this.orbitRadius * 0.1, this.orbitRadius) / SPEED_DECAY;
            this.x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
            this.y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
        }

        /** 越界判定 */
        check(): boolean {
            return this.x < 0 || this.y < 0 || this.x > w || this.y > h;
        }

        /** 绘制星星，protect 为 true 时，即使在界外也不会加速 */
        draw(protect: boolean = false): void {
            this._doAnimate(protect);
            // 绘制星星主体
            ctx.globalAlpha = this.alpha;
            // 将缓存的星星绘制在指定的方形区域内
            if (this.canvas && !this.pass) {
                ctx.drawImage(this.canvas, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
            }
            this.timePassed += this.speed; // 相位增加
        }

        /** 缩放 */
        resize(size: number): void {
            this.orbitRadius *= size;
            // 轨道半径过小(概率性)、过大时重置
            if (this.orbitRadius > maxRadius ||
                (this.orbitRadius < minRadius && utils.randomInt(0, 20) === 0)) {
                this.reset();
            }
            // 降低变化倍率
            let power = size - 1.0;
            power /= 10;
            power += 1.0;
            this.speed *= power;
            this.radius *= power;
        }

        private _doAnimate(protect: boolean = false): void {
            this.x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
            this.y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;

            // 界外的星星无需绘制，使其加速
            if (!(this.pass = this.check()) && !protect) {
                this.timePassed += this.speed * 4;
                return;
            }

            // 星光闪耀，10%变暗，10%变亮
            let twinkle = utils.randomInt(0, 10);
            if (twinkle === 1 && this.alpha > 0) {
                this.alpha -= 0.05;
            } else if (twinkle === 2 && this.alpha < 1) {
                this.alpha += 0.05;
            }
        }

        getOrbitX(): number {
            return this.orbitX;
        }

        getOrbitY(): number {
            return this.orbitY;
        }
    }

    /** 星座类，实现星星接口 */
    class Constellation implements StarInterface {
        // 星座轨道
        private orbitRad: number = 0;
        // 星星组合
        private starArray: Star[];
        // 星座色彩基调
        private hue: number;

        constructor(starCount: number) {
            this.starArray = [];
            // 以基调生成当前星座色彩
            this.hue = (hue + utils.randomInt(-30, 30)) % 360;
            // 创建星星，添加到组合
            let i = 0;
            while (i < starCount) {
                i = this.starArray.push(new Star(this.hue, true));
            }
            starCount = i;
            this.reset();
        }

        // 迭代所有子元素的方法，组合模式使用
        each(fn: (star: Star) => void): void {
            this.starArray.forEach(ele => {
                fn(ele);
            });
        }

        reset(): void {
            // 星座轨道半径
            this.orbitRad = utils.randomInt(0, maxRadius * 0.6);
            // 随机生成相位
            let time = utils.randomNumber(0, PI2);
            //星星移动速度，轨道半径越大，速度越快
            let speed = utils.randomNumber(maxRadius * 0.1, maxRadius) / SPEED_DECAY;

            // 重设星座位置、形状，不改变颜色
            this.each((element: Star) => {
                element.alpha = 0.1;
                // 半径设置
                element.orbitRadius = this.orbitRad + utils.randomInt(0, 150);
                element.radius = utils.randomInt(60, element.orbitRadius) / 16;
                // 星座内星星速度一致
                element.speed = speed;
                // 允许偏差内随机位置
                element.timePassed = time + utils.randomNumber(0, 0.5 - speed);
                element.x = Math.sin(element.timePassed) * element.orbitRadius + element.getOrbitX();
                element.y = Math.cos(element.timePassed) * element.orbitRadius + element.getOrbitY();
            });
        }

        /** 绘制星座 */
        draw() {
            this.starArray.forEach(element => element.draw(true));
            // 画笔放到第一个星星的位置
            let i = 0;
            ctx.beginPath();
            ctx.moveTo(this.starArray[i].x, this.starArray[i].y);
            for (let len = this.starArray.length; i < len; i++) {
                ctx.lineTo(this.starArray[i].x, this.starArray[i].y);
            }
            ctx.lineWidth = 1; // 描边半径，不设颜色、透明度，与最后一个星星保持一致
            ctx.strokeStyle = 'hsla(' + this.hue + ', 80%, 30%, 0.5)'; // 划线颜色
            ctx.stroke(); // 描边
            ctx.closePath(); // 结束绘制
        }

        resize(size: number): void {
            this.orbitRad *= size;
            if (this.orbitRad > maxRadius || this.orbitRad < minRadius) {
                this.reset();
                return;
            }
            this.starArray.forEach(ele => {
                ele.resize(size);
            })
        }
    }

    /** 主循环 */
    function loop(): void {
        if (C.config.windowFocus) {
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 0.3; // 半透明的背景图，实现拖尾
            ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 0.5)';
            ctx.fillRect(0, 0, w, h)

            ctx.globalCompositeOperation = 'lighter';
            stars.forEach(star => star.draw());
            frameCounter++;
            if (frameCounter === 4) {
                stars.forEach(ele => ele.resize(zoomStatus));
                frameCounter = 0;
            }
        }
        if (unload) {
            return;
        }

        window.requestAnimationFrame(loop);
    }

    return {
        key: 'Hosizora',
        name: '星空',
        init: function () {
            // 初始化星空
            stars = [];
            // 生成主体星空颜色
            hue = utils.randomInt(0, 360);

            w = window.innerWidth;
            h = window.innerHeight;
            maxRadius = ~~Math.sqrt(w * w + h * h) / 2;
            minRadius = maxRadius * 0.1;

            // 创建星星，添加到组合
            for (let i = 0; i < maxStars; i++) {
                starCounter = stars.push(new Star(hue));
            }
            for (let i = 0; i < maxConstellation; i++) {
                // 每个星座星星数量
                stars.push(new Constellation(utils.randomInt(2, 9)));
            }
            // 动画首次加载时，设置监听、启动主循环
            if (unload) {
                backDiv = document.createElement('div');
                canvas = document.createElement('canvas');

                backDiv.classList.add('back', 'back-cover');
                backDiv.style.zIndex = '-1';
                backDiv.style.opacity = '0.4';

                canvas.classList.add('back');
                canvas.style.zIndex = '-2';
                canvas.style.backgroundColor = 'black';

                container!.appendChild(backDiv);
                container!.appendChild(canvas);

                ctx = canvas.getContext('2d')!;

                utils.EventCenter.subscribe(C.constants.WINDOW_RESIZE_EVENT, {
                    key: 'hosizora-resize-consumer',
                    callback: this.init,
                });
                utils.EventCenter.subscribe(C.constants.WINDOW_CLICK_EVENT, {
                    key: 'hosizora-click-consumer',
                    callback: (event: MouseEvent) => {
                        let xDistance = event.clientX - w / 2;
                        let yDistance = event.clientY - h / 2;
                        let clickOrbitRadius = Math.sqrt(xDistance * xDistance + yDistance * yDistance);

                        let timePassByAtan = Math.atan2(xDistance, yDistance);
                        let speed = utils.randomNumber(maxRadius * 0.1, maxRadius) / SPEED_DECAY;
                        let newStar = Star.buildStar(hue, 0.8, clickOrbitRadius, utils.randomInt(0, starRadius),
                            speed, timePassByAtan, event.clientX, event.clientY);
                        stars.push(newStar);
                    },
                });
                unload = false;
                loop();
            }
            backDiv.style.backgroundImage = 'url(' + backImgUrl + ')';

            canvas.width = w;
            canvas.height = h;
        },
        unload() {
            stars = [];
            unload = true;
        },
        configureFunction() {
            utils.modalForm({
                title: '配置天体规则',
                form: [{
                    type: 'text',
                    name: 'back-img-inp',
                    label: '背景图片链接',
                    placeholder: '输入背景图片链接',
                    initValue: backImgUrl,
                }, {
                    type: 'number',
                    name: 'star-count-inp',
                    label: '星星数量',
                    placeholder: '星星数量必须为整数',
                    initValue: maxStars + '',
                }, {
                    type: 'number',
                    name: 'cons-count-inp',
                    label: '星座数量',
                    placeholder: '星座数量必须为整数',
                    initValue: maxConstellation + '',
                }],
                btns: [{
                    text: '切换颜色',
                    class: 'btn btn-primary',
                    callback: this.init
                }, {
                    text: '确定',
                    class: 'btn btn-primary',
                    callback: data => {
                        backImgUrl = allBackConfig.backImgUrl = data['back-img-inp'] as string;
                        maxStars = allBackConfig.maxStars = parseInt(data['star-count-inp'] as string);
                        maxConstellation = allBackConfig.maxConstellation = parseInt(data['cons-count-inp'] as string);
                        storage.setData(C.constants.cache.BACKGROUP_KEY, allBackConfig);
                        this.init();
                    },
                }],
            });
        },
    }
})();