/** 
 * 星火动画组件
 * 闭包单体，数据闭包
 * 桥接模式：将部分方法通过单体对外开放（开放闭包内的部分方法）
 * 组合模式：所有粒子组合为一个集合、所有圆组合为一个集合，每轮操作时，组合内所有的元素都进行相关动作（不典型）
 */
var fire = (function () {
    /** 私有变量域 */
    let
        c = document.createElement('canvas'),
        particles = [], // 粒子集合
        particleCount = 100, // 粒子总数
        particlePath = 4, // 拖尾长度
        pillars = [], // 圆集合
        pillarCount = 10, // 圆总数
        hue = 0, // 颜色偏移参数，色调
        hueRange = 60, // 颜色偏移范围
        hueChange = 1, // 颜色渐变步长
        gravity = 0.06, // 重力
        lineWidth = 1, // 划线宽度
        lineCap = 'round', // 线条样式
        pillarSize = 30, // 圆尺寸
        PI = Math.PI,
        TWO_PI = Math.PI * 2,
        particleRadius = 0.5, // 粒子半径
        select = $("#fire"), // 选择器，容器
        pillarAlive = 0, // 圆存活总数
        particleAlive = 0, // 存活粒子总数
        colorful = false, // 色彩模式
        running = true, // 是否运行
        staticColor = 'rgba(20, 20, 40, 0.3)'; // 圆初始颜色

    /* 初始容器尺寸配置 */
    let config = function (width) {
        ctx = c.getContext('2d');
        w = c.width = width; // 画布宽度
        h = c.height = width * 2 / 3; // 画布高度
        select.height(h + "px"); // 设置容器高度，方便其他元素显示
    }

    /* 生成随机数 */
    let rand = function (min, max) {
        return Math.random() * (max - min) + min;
    }

    /* 两点间距 */
    let distance = function (a, b) {
        var dx = a.x - b.x,
            dy = a.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /* 生成随机颜色 */
    let getColor = function () {
        if (colorful) {
            return "rgba(" + ~~rand(0, 255) + ", " + ~~rand(0, 255) + ", " + ~~rand(0, 255) + ", 0.3)"
        } else {
            return staticColor;
        }
    }

    /* 粒子类 */
    Particle = function (opt) {
        this.path = []; // 拖尾
        this.reset(); // 初始化
    }

    /* 初始化粒子属性 */
    Particle.prototype.reset = function () {
        this.radius = particleRadius; // 粒子半径
        this.x = rand(0, w); // 随机从0-x出生
        this.y = 0; // 初始y坐标为0
        this.vx = 0; // 横向速度
        this.vy = 0; // 纵向速度
        this.hit = 0; // 碰撞状态
        this.path.length = 0; // 无拖尾
        if (particleAlive > particleCount) {
            particles.pop(); // 删除一个
            particleAlive--;
        }
    };

    /* 粒子每一步的动作*/
    Particle.prototype.step = function () {
        this.hit = 0;
        this.path.unshift([this.x, this.y]);
        if (this.path.length > particlePath) { // 当前粒子拖尾长度大于设定上限
            this.path.pop(); // 清除尾部拖尾
        }
        this.vy += gravity; // 纵向加速度
        this.x += this.vx; // 横向位移
        this.y += this.vy; // 纵向位移

        // 越界检验
        if (this.y > h + 10) { // 纵向越界
            this.reset();
        } else if (this.x > w + 10 || this.x < -10) { // 横向越界
            this.reset();
        }

        // 碰撞检测：粒子与圆
        var i = pillarCount;
        while (i--) { // 遍历圆
            var pillar = pillars[i];
            if (pillar && distance(this, pillar) < this.radius + pillar.renderRadius) { // 当前粒子与当前圆发生碰撞
                // 根据位置生成反弹速度
                this.vx = -(pillar.x - this.x) * rand(0.01, 0.03);
                this.vy = -(pillar.y - this.y) * rand(0.01, 0.03);
                pillar.radius -= 0.1; // 圆的形式半径下降
                this.hit = 1; // 碰撞状态中
            }
        }
    };

    /* 粒子绘制方法 */
    Particle.prototype.draw = function () {
        ctx.beginPath();
        ctx.moveTo(this.x, ~~this.y); // 移动到粒子当前位置
        for (var i = 0, length = this.path.length; i < length; i++) { // 创建粒子拖尾路径
            var point = this.path[i];
            ctx.lineTo(point[0], ~~point[1]);
        }
        // 设置颜色、绘制路径，色调、饱和度、亮度、不透明度
        ctx.strokeStyle = 'hsla(' + rand(hue + (this.x / 3), hue + (this.x / 3) + hueRange) + ', 50%, 30%, 0.3)'; // 划线颜色
        ctx.stroke(); // 划线

        // 碰撞状态发光
        if (this.hit) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, rand(1, 25), 0, TWO_PI); // 粒子当前位置创建圆形路径
            ctx.fillStyle = 'hsla(' + rand(hue + (this.x / 3), hue + (this.x / 3) + hueRange) + ', 80%, 15%, 0.1)' // 填充颜色
            ctx.fill(); // 填充
        }
    };

    /* 圆类 */
    let Pillar = function (x, y) {
        this.reset(x, y); // 初始化
    }

    /* 初始化方法 */
    Pillar.prototype.reset = function (xx, yy) {
        this.radius = rand(pillarSize, pillarSize * 2); // 形式半径
        this.renderRadius = 0; // 真实半径
        if (xx && yy) {
            // 在指定的坐标处生成
            this.x = xx;
            this.y = yy;
            pillarAlive++;
            pillarCount++;
        } else {
            this.x = rand(0, w); // 生成x坐标
            this.y = rand(h / 4, h); // 生成y坐标，下3/4位置
        }
        this.active = 0; // 真实半径达到形式半径，处于激活状态，未激活则真实半径一直增加
        this.color = getColor();
    };

    /* 每步动作 */
    Pillar.prototype.step = function () {
        if (this.active) { // 处于激活状态
            if (this.radius <= 0.5) { // 形式半径太小
                this.reset(); // 重置
            } else { // 形式半径与真实半径同步
                this.renderRadius = this.radius;
            }
        } else { // 未激活状态
            if (this.renderRadius < this.radius) { // 真实半径持续增加
                this.renderRadius += 0.2;
            } else { // 增加结束，激活
                this.active = 1;
            }
        }
    };

    /* 越界检验，只在重设窗口时使用 */
    Pillar.prototype.check = function () {
        if (this.x > w || this.y > h) {
            this.reset();
        }
    }

    /* 圆绘制方法 */
    Pillar.prototype.draw = function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.renderRadius, 0, TWO_PI, false); // 当前位置创建圆路径
        ctx.fillStyle = this.color;
        ctx.fill(); // 填充
    };

    /* 全局初始化方法 */
    let init = function () {
        // 使用画布宽度进行初始化
        config(select.width());
        ctx.lineWidth = lineWidth;
        ctx.lineCap = lineCap;

        select.append(c);
        loop();
    }

    /* 执行所有对象的每步动作 */
    let step = function () {
        hue += hueChange; // 颜色渐变

        // 圆数量检测
        if (pillarAlive > pillarCount) {
            pillars.pop(); // 从集合中清除一个
            pillarAlive--;
        }

        // 插入新粒子
        if (particleAlive < particleCount) {
            particles.push(new Particle());
            particleAlive++;
        }

        // 创建圆
        if (pillarAlive < pillarCount) {
            pillars.push(new Pillar());
            pillarAlive++;
        }

        // 执行每个粒子动作
        var i = particles.length;
        while (i--) {
            particles[i].step();
        }

        // 执行每个圆动作
        i = pillarCount;
        while (i-- && pillars[i]) {
            pillars[i].step();
        }
    }

    /* 绘制所有对象 */
    let draw = function () {
        // 背景黑色
        ctx.fillStyle = 'hsla(0, 0%, 0%, 0.1)';
        ctx.fillRect(0, 0, w, h);

        // 图像重叠时拼合图像，包括颜色和形状
        ctx.globalCompositeOperation = 'lighter';
        var i = particles.length;
        while (i--) { // 绘制所有粒子
            particles[i].draw();
        }

        // 覆盖图层下的图像
        ctx.globalCompositeOperation = 'source-over';
        i = pillarCount; // 圆颜色
        ctx.fillStyle = 'rgba(20, 20, 40, 0.3)';
        while (i-- && pillars[i]) { // 绘制所有圆
            pillars[i].draw();
        }
    }

    /* 主循环 */
    let loop = function () {
        // 动画，优化资源占用
        requestAnimationFrame(loop);
        if (running) {
            step();
            draw();
        }
    }

    /* 开始动画 */
    init();

    /* 改变粒子数量，回调函数用于提示，错误时调用，返回出错信息 */
    changeParticleCount = function (count, fn) {
        if (count > 1000) {
            fn("粒子数量太多");
        } else if (count <= 0) {
            fn("粒子数量太少");
        } else if (count) {
            particleCount = count;
        } else {
            fn("非法数值");
        }
    }

    /* 改变圆数量，回调函数用于提示，错误时调用，返回出错信息 */
    changePillarCount = function (count, fn) {
        if (count > 100) {
            fn("圆数量太多");
        } else if (count <= 0) {
            fn("圆数量太少");
        } else if (count) {
            pillarCount = count;
        } else {
            fn("非法数值");
        }
    }

    /* 改变颜色与颜色模式 */
    changeColor = function (mode, color) {
        if (mode) {
            colorful = true;
        } else {
            colorful = false;
            staticColor = color;
        }
        var i = pillarCount;
        while (i--) {
            pillars[i].color = getColor()
        }
    }

    return {
        // 点击事件监听
        hearClick: function (event) {
            // 新元素应该在的位置
            var newX = event.clientX - select[0].getBoundingClientRect().left;
            var newY = event.clientY - select[0].getBoundingClientRect().top;
            if (newX < w && newX > 0 && newY < h && newY > 0) {
                if (pillarCount >= 100) {
                    alert("无法创建更多");
                    return;
                }
                pillars.push(new Pillar(newX, newY));
            }
        },
        // 重设窗口监听
        hearResize: function () {
            // 使用画布宽度进行重设
            var i = pillarCount;
            config(select.width());
            while (i--) { // 对每个圆补充越界检验
                pillars[i].check();
            }
        },
        hearBlur: function(){
            running = false;
        },
        hearFocus: function(){
            running = true;
        },
        // 对外提供的接口
        changeParticleCount: changeParticleCount,
        changePillarCount: changePillarCount,
        changeColor: changeColor
    }
})()