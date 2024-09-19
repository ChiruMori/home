/**
 * 光斑动画组件
 * 闭包单体，数据闭包
 * 桥接模式：将部分方法通过单体对外开放
 * 组合模式：所有光斑组合为一个集合
 */
var light = (function () {
	let
		container = document.getElementById("light"), // 容器，id为light，不要使用style属性，如需指定样式，需使用css类
		c1 = document.createElement('canvas'), // 画布1对象
		c2 = document.getElementById("lightCanvas2"), // 画布2对象
		ctx1 = c1.getContext('2d'), // 画布1画笔对象
		ctx2 = c2.getContext('2d'), // 画布2画笔对象
		twopi = Math.PI * 2,
		lightObj = null, // 模糊光斑对象
		parts = [], // 光斑集合
		sizeBase = null, // 基础数量：画布宽+高
		cw = null, // 画布宽度
		ch = null, // 画布高度
		hue = null, // 主色调
		count = null, // 背景圆数量
		alphaArray = []; // 光斑透明度抖动数值数组

	/* 生成min-max之间的随机浮点数 */
	rand = function (min, max) {
		return Math.random() * (max - min) + min;
	}

	/* 返回hsla色彩字符串，色调、饱和度、亮度、不透明度 */
	hsla = function (h, s, l, a) {
		return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	}

	/** 光斑类 */
	LightSpot = function (x, y) {
		this.reset(x, y); // 构造方法：进行重置，即初始化
	}

	/* 光斑类原型 */
	LightSpot.prototype = {
		constructor: LightSpot, // 还原构造器
		reset: function (clickX, clickY) {
			this.radius = rand(10, sizeBase * 0.05); // 光斑半径
			if (clickX && clickY) {
				this.x = clickX;
				this.y = clickY;
			} else {
				this.x = rand(0, cw); // 初始坐标
				this.y = rand(0, ch);
			}
			this.angle = rand(0, twopi); // 光斑运动方向
			this.vel = rand(0.1, 0.4); // 光斑移动速度
			this.tick = rand(0, 200); // 光斑透明度抖动
			this.xStep = Math.cos(this.angle) * this.vel; // x轴步长
			this.yStep = Math.sin(this.angle) * this.vel; // y轴步长
			this.active = false; // 激活状态：false
			this.alpha = rand(0.1, 0.25); // 透明度
			this.alphaCount = 0; // 透明度抖动计算计数器
			this.alphaIndex = 0; // 透明度抖动索引
			this.tempAlpha = 0; // 临时透明度，激活之间使用
			this.hue = rand((hue + 260) % 360, hue + 50); // 生成色调
			this.sat = rand(30, 100); // 生成饱和度
			this.lig = rand(20, 50); // 生成亮度
			this.blur = rand(0, this.radius / 2); // 生成羽化值
		},
		step: function () {
			// 光斑移动
			this.x += this.xStep;
			this.y += this.yStep;
			this.x += alphaArray[this.alphaIndex] * 3; // 方向抖动
			this.y -= alphaArray[this.alphaIndex] * 3; // 方向抖动
			if (this.active) {
				this.alphaIndex = (this.alphaIndex + 1) % alphaArray.length;
				this.tempAlpha = this.alpha + alphaArray[this.alphaIndex] // 计算透明度
			} else {
				this.tempAlpha += 0.001; // 透明度增加
				if (this.tempAlpha >= this.alpha) {
					this.active = true;
				}
			}
			// 光斑越界检验与处理
			if (this.x - this.radius > cw || this.x + this.radius < 0 ||
				this.y - this.radius > ch || this.y + this.radius < 0) {
				this.reset();
			}
		},
		draw: function () {
			// 绘制当前光斑
			ctx2.shadowColor = hsla(this.hue, this.sat, this.lig, this.tempAlpha); // 阴影颜色
			ctx2.shadowBlur = this.blur; // 阴影羽化级别
			ctx2.beginPath();
			ctx2.arc(this.x, this.y, this.radius, 0, twopi);
			// ctx2.fillStyle = hsla(this.hue, this.sat, this.lig, this.tempAlpha);
			ctx2.fill();
		}
	}

	/* 初始化模糊光斑对象 */
	lightInit = function () {
		lightObj = {
			radiusMin: 1, // 最小半径
			radiusMax: sizeBase * 0.06, // 最大半径
			blurMin: 10, // 最小羽化值
			blurMax: sizeBase * 0.04, // 最大羽化值
			hueMin: hue, // 色调偏移下限
			hueMax: hue + 100, // 色调偏移上限
			saturationMin: 10, // 饱和度下限
			saturationMax: 70, // 饱和度上限
			lightnessMin: 20, // 亮度下限
			lightnessMax: 50, // 亮度上限
			alphaMin: 0.1, // 透明度下限
			alphaMax: 0.5, // 透明度上限
			display: function () { // 显示光斑的方法
				var radius = rand(this.radiusMin, this.radiusMax), // 生成半径
					blur = rand(this.blurMin, this.blurMax), // 生成羽化半径
					x = rand(0, cw), // x坐标
					y = rand(0, ch), // y坐标
					hue = rand(this.hueMin, this.hueMax), // 生成色调
					saturation = rand(this.saturationMin, this.saturationMax), // 生成饱和度
					lightness = rand(this.lightnessMin, this.lightnessMax), // 生成亮度
					alpha = rand(this.alphaMin, this.alphaMax); // 生成透明度
				ctx1.shadowColor = hsla(hue, saturation, lightness, alpha); // 阴影颜色
				ctx1.shadowBlur = blur; // 阴影羽化级别
				ctx1.beginPath(); // 进行绘制
				ctx1.arc(x, y, radius, 0, twopi);
				ctx1.closePath();
				ctx1.fill();
			}
		}
	}

	/* 创建需要的对象 */
	create = function () {
		sizeBase = cw + ch;
		count = ~~(sizeBase * 0.2); // 创建数量与sizeBase正相关，向下取整
		hue = rand(0, 360); // 随机生成色调
		ctx1.clearRect(0, 0, cw, ch); // 创建与画布同宽高的矩形
		ctx1.globalCompositeOperation = 'lighter'; // 图像叠加模式：显示原图像+目标图像
		var len = count;
		lightInit();
		while (len--) { // 在画布1中，创建指定数量的，背景中的模糊光斑
			lightObj.display();
		}
		parts.length = 0; // 清空光斑数组
		for (var i = 0, len = ~~count / 10; i < len; i++) { // 创建一定数量的光斑对象
			parts.push(new LightSpot());
		}
	}

	/* 初始化 */
	init = function () {
		// 计算透明度抖动值
		for (i = 0; i < twopi; i += 0.02) {
			alphaArray.push(Math.sin(i) * 0.1);
		}
		resize(); // 重设画布大小
		create(); // 创建、初始化对象
		loop(); // 开始主循环
	}

	/* 帧计算 */
	step = function () {
		var i = parts.length; // 迭代索引
		while (i--) {
			parts[i].step(); // 帧计算
		}
	}

	/* 绘制 */
	draw = function () {
		ctx2.clearRect(0, 0, cw, ch); // 清空画布2的矩形区域
		ctx2.globalCompositeOperation = 'source-over'; // 图像叠加模式：覆盖原图像
		ctx2.shadowBlur = 0; // 不进行羽化
		ctx2.drawImage(c1, 0, 0); // 将画布1绘制在画布2上
		ctx2.globalCompositeOperation = 'lighter'; // 图像叠加模式：原图+新图
		var i = parts.length; // 迭代索引
		ctx2.shadowBlur = 15; // 阴影羽化半径
		ctx2.shadowColor = '#fff'; // 阴影颜色：白色
		while (i--) {
			parts[i].draw(); // 绘制
		}
	}

	let running = true;

	/* 主循环 */
	loop = function () {
		// 优化资源占用的主循环
		requestAnimationFrame(loop);
		if (running) {
			step();
			draw();
		}
	}

	/* 重设画布、重设窗口尺寸事件监听 */
	resize = function () {
		cw = c1.width = c2.width = container.clientWidth; // 区域宽度设置为容器宽度
		ch = c1.height = c2.height = container.clientWidth * 2 / 3; // 区域高度为宽度2/3
		container.style.height = ch + "px"; // 重设容器宽度，方便其他元素正常显示
		create();
	}

	/* 点击事件监听 */
	click = function (event) {
		// 新元素应该在的位置
		var newX = event.clientX - container.getBoundingClientRect().left;
		var newY = event.clientY - container.getBoundingClientRect().top;
		if (newX < cw && newX > 0 && newY < ch && newY > 0) {
			parts.push(new LightSpot(newX, newY));
		}
	}

	/* 随机添加，光斑数量过多调用回调函数 */
	randomAdd = function (fn) {
		if (parts.length >= sizeBase) {
			fn("数量太多");
		} else {
			parts.push(new LightSpot());
		}
	}

	/* 进行初始化 */
	init();
	return {
		// 监听
		hearResize: resize,
		hearClick: click,
		hearBlur: function () {
			running = false;
		},
		hearFocus: function () {
			running = true;
		},
		// 对外接口
		randomAdd: randomAdd,
		create: create
	}
})()