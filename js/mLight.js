var mLight = (function (window) { // 闭包

    let ctx,
        hue,
        w = 0,
        h = 0,
        target = {}, // 生成卷须节点的目标坐标
        tendrils = [],
        particle = [], // 烟花粒子数组
        settings = {
            friction: 0.5, // 摩擦
            trails: 5, // 卷须数
            size: 50, // 卷须节点数
            dampening: 0.25, // 阻力
            tension: 0.98, // 张力
            hanabiNum: 80, // 烟花分支数
            MaxHanabi: 1000, // 烟花存在的最大粒子数
            pRadius: 1, // 粒子半径
            particlePath: 6, // 路径长度
            gravity: 0.04, // 重力
            hanabiSpeed: 3, // 烟花粒子移动实际速度
            TWO_PI: Math.PI * 2,
        };

    /** 用这个函数放烟花 */
    function hanabi(event, x, y) {
        var newX, newY;
        if (event) {
            if (event.touches) {
                newX = event.touches[0].pageX;
                newY = event.touches[0].pageY;
            } else {
                newX = event.clientX
                newY = event.clientY;
            }
        } else {
            newX = x;
            newY = y;
        }
        if (particle.length > settings.MaxHanabi) {
            console.warn("粒子过多，停止创建");
            return;
        }
        for (let i = 0, step = settings.TWO_PI / settings.hanabiNum; i < settings.TWO_PI; i += step) {
            let vx = Math.cos(i) * settings.hanabiSpeed; // x速度
            let vy = Math.sin(i) * settings.hanabiSpeed; // y速度
            particle.push(new SimpleParticle(newX, newY, vx, vy)); // 创建粒子
        }
    }

    /** 用这个函数画烟花 */
    function hanabiStep() {
        particle = particle.filter(function (ele) {
            if (ele.active) {
                ele.step();
                ele.draw();
                return true;
            }
            return false;
        })
        if (particle.length < 120) {
            hanabi(undefined, w * Math.random(), h * Math.random())
        }
    }

    /* 粒子类 */
    SimpleParticle = function (x, y, vx, vy) {
        this.active = true;
        this.path = []; // 拖尾
        this.init(x, y, vx, vy); // 初始化
    }

    /* 初始化粒子属性 */
    SimpleParticle.prototype.init = function (x, y, vx, vy) {
        this.radius = settings.pRadius; // 粒子半径
        this.x = x; // 随机从0-x出生
        this.y = y; // 初始y坐标为0
        this.vx = vx; // 横向速度
        this.vy = vy; // 纵向速度
        this.path.length = 0; // 无拖尾
    };

    /* 粒子每一步的动作*/
    SimpleParticle.prototype.step = function () {
        this.path.unshift([this.x, this.y]); // 当前位置推入拖尾数组首位
        if (this.path.length > settings.particlePath) { // 当前粒子拖尾长度大于设定上限
            this.path.pop(); // 清除尾部拖尾
        }
        this.vy += settings.gravity; // 纵向加速度
        this.x += this.vx; // 横向位移
        this.y += this.vy; // 纵向位移

        // 越界检验
        if (this.y > h + 10) { // 纵向越界
            this.active = false;
        } else if (this.x > w + 10 || this.x < -10) { // 横向越界
            this.active = false;
        }
    };

    /* 粒子绘制方法 */
    SimpleParticle.prototype.draw = function () {
        ctx.beginPath();
        ctx.moveTo(this.x, ~~this.y); // 移动到粒子当前位置
        for (var i = 0, length = this.path.length; i < length; i++) { // 创建粒子拖尾路径
            var point = this.path[i];
            ctx.lineTo(point[0], ~~point[1]);
        }
        // 设置颜色、绘制路径，色调、饱和度、亮度、不透明度
        ctx.strokeStyle = 'hsla(' + ~~(hue.value()) + ', 80%, 30%, 0.5)'; // 划线颜色
        ctx.lineWidth = this.radius;
        ctx.stroke(); // 划线
    };

    // ========================================================================================
    // Oscillator 振荡器
    // ----------------------------------------------------------------------------------------

    function Oscillator(options) {
        this.init(options || {});
    }

    /** 为每个振荡器创建一个闭包 */
    Oscillator.prototype = (function () {

        var value = 0;

        return {

            /** 
             * 初始化振荡器，options可选，参数如下 
             * phase        相位
             * offset       偏移
             * frequency    频率
             * amplitude    振幅
             */
            init: function (options) {
                this.phase = options.phase || 0;
                this.offset = options.offset || 0;
                this.frequency = options.frequency || 0.001;
                this.amplitude = options.amplitude || 1;
            },

            /** 每次更新，值在三角函数上震荡一个频率的相位 */
            update: function () {
                this.phase += this.frequency; // 相位增加频率
                value = this.offset + Math.sin(this.phase) * this.amplitude; // 值为三角函数值
                return value;
            },

            /** 获取振荡器当前的值 */
            value: function () {
                return value;
            }
        };

    })();

    // ========================================================================================
    // Tendril 卷须
    // ----------------------------------------------------------------------------------------

    function Tendril(options) {
        this.init(options || {});
    }

    Tendril.prototype = (function () {

        /**
         * 卷须节点：x、y坐标，x、y方向速度
         */
        function Node() {
            this.x = 0;
            this.y = 0;
            this.vy = 0;
            this.vx = 0;
        }

        return {
            // 初始化参数、创建卷须节点
            init: function (options) {

                this.spring = options.spring + (Math.random() * 0.1) - 0.05; // 弹力，这里应该为惯性
                this.friction = settings.friction + (Math.random() * 0.01) - 0.005; // 节点摩擦力
                this.nodes = []; // 节点数组

                // 创建指定数量的节点
                for (var i = 0, node; i < settings.size; i++) {
                    // 初始化在指定节点
                    node = new Node();
                    node.x = target.x;
                    node.y = target.y;
                    // 添加到节点数组
                    this.nodes.push(node);
                }
            },

            update: function () {
                var spring = this.spring,
                    node = this.nodes[0];
                // 第一个节点，根据目标位置与节点位置的坐标差计算节点速度，与惯性和坐标差有关
                node.vx += (target.x - node.x) * spring;
                node.vy += (target.y - node.y) * spring;
                // 更新每个节点的速度
                for (var prev, i = 0, n = this.nodes.length; i < n; i++) {
                    node = this.nodes[i];
                    if (i > 0) {
                        prev = this.nodes[i - 1];
                        // 当前节点速度增加：增加的值为与前一个节点的坐标差
                        node.vx += (prev.x - node.x) * spring;
                        node.vy += (prev.y - node.y) * spring;
                        // 当前节点速度增加：增加的值为前一个节点的速度*阻力
                        node.vx += prev.vx * settings.dampening;
                        node.vy += prev.vy * settings.dampening;
                    }
                    // 根据摩擦力减弱当前速度
                    node.vx *= this.friction;
                    node.vy *= this.friction;
                    // 计算新的坐标值
                    node.x += node.vx;
                    node.y += node.vy;
                    // 越靠后的节点，惯性越弱
                    spring *= settings.tension;
                }
            },

            draw: function () {
                var x = this.nodes[0].x,
                    y = this.nodes[0].y,
                    now, next;
                // 画笔放到第一个节点的位置
                ctx.beginPath();
                ctx.moveTo(x, y);

                for (var i = 1, n = this.nodes.length - 2; i < n; i++) {

                    now = this.nodes[i];
                    next = this.nodes[i + 1];
                    // 下一个点为两个节点中点
                    x = (now.x + next.x) * 0.5;
                    y = (now.y + next.y) * 0.5;
                    // 在两个点之间做曲线
                    ctx.quadraticCurveTo(now.x, now.y, x, y);
                }
                now = this.nodes[i];
                next = this.nodes[i + 1];
                // 最后一个点，会直到路径末尾
                ctx.quadraticCurveTo(now.x, now.y, next.x, next.y);
                ctx.lineWidth = 1; // 卷须描边半径
                ctx.stroke(); // 描边
                ctx.closePath(); // 结束绘制
            }
        };

    })();

    // ----------------------------------------------------------------------------------------

    function init(event) {
        // 移除绑定的本函数
        document.removeEventListener('mousemove', init);
        document.removeEventListener('touchstart', init);
        // 增加新的监听后那数
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('touchmove', mousemove);
        document.addEventListener('touchstart', touchstart);
        // 开始表演
        mousemove(event);
        reset();
        loop();
    }

    /** 重设函数，创建卷须节点 */
    function reset() {

        tendrils = []; // 卷须节点数组

        for (var i = 0; i < settings.trails; i++) { // 创建指定条数的卷须

            tendrils.push(new Tendril({
                spring: 0.45 + 0.025 * (i / settings.trails) // 卷须弹性不同
            }));
        }
    }

    // 主循环，处理卷须动画
    function loop() {

        if (!settings.running) return;

        // 绘制背景区域
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(8,5,16,0.4)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        // 设定曲线颜色
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'hsla(' + Math.round(hue.update()) + ',90%,50%,0.25)';
        ctx.lineWidth = 1;
        hanabiStep(); // 烟花

        // 没卵用，log一定的信息
        // if (ctx.frame % 60 == 0) {
        //     console.log(hue.update(), Math.round(hue.update()), hue.phase, hue.offset, hue.frequency, hue.amplitude);
        // }
        // ctx.frame++;

        // 执行每一个卷须的更新、绘制方法
        for (var i = 0, tendril; i < settings.trails; i++) {
            tendril = tendrils[i];
            tendril.update();
            tendril.draw();
        }
        requestAnimFrame(loop);
    }

    // 窗口尺寸更新
    function resize() {
        w = ctx.canvas.width = window.innerWidth;
        h = ctx.canvas.height = window.innerHeight;
    }

    // 开始动画，设定为running
    function start() {
        if (ctx && !settings.running) {
            settings.running = true;
            loop();
        }
    }

    // 停止动画，stop
    function stop() {
        settings.running = false;
    }

    // 鼠标移动监听
    function mousemove(event) {
        if (event.touches) {
            target.x = event.touches[0].pageX;
            target.y = event.touches[0].pageY;
        } else {
            target.x = event.clientX
            target.y = event.clientY;
        }
        event.preventDefault(); // 组织默认事件
    }

    // 触摸移动监听
    function touchstart(event) {
        if (event.touches.length == 1) {
            target.x = event.touches[0].pageX;
            target.y = event.touches[0].pageY;
        }
    }

    window.requestAnimFrame = (function () { // 兼容浏览器的动画帧频发生器
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
            function (fn) {
                window.setTimeout(fn, 1000 / 60)
            };
    })();

    // 事件交由发布者统一处理
    return {
        hearFocus: start,
        hearBlur: stop,
        hearClick: hanabi,
        hearResize: resize,
        hearLoad: function () {

            ctx = document.getElementById('mLight').getContext('2d');
            settings.running = true;
            ctx.frame = 1;

            hue = new Oscillator({
                phase: Math.random() * Math.TWO_PI,
                amplitude: 85,
                frequency: 0.0015,
                offset: 285
            });

            document.addEventListener('mousemove', init);
            document.addEventListener('touchstart', init);
            document.body.addEventListener('orientationchange', resize);

            resize();
        }
    }
})(window);