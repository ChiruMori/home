/**
 * 星空特效
 * 闭包单体：一直以来青睐的模式
 * 享元模式：每组颜色相同的星空使用一个星星缓存对象
 * 简单闭包工厂：用于生产每组星星使用的缓存对象
 * 组合模式：每组星座为一个组合
 */
var star = (function () {

  let canvas = document.getElementById('starCanvas'),
    ctx = canvas.getContext('2d'),
    w = canvas.width = window.innerWidth,
    h = canvas.height = window.innerHeight,
    hue = 0,
    stars = [],
    count,
    offsetX = 0, // 偏移
    offsetY = 0,
    maxStars = 300, //星星数量
    maxConstellation = 30, // 星座数量
    PI2 = Math.PI * 2,
    minRadius, // 最小半径
    maxRadius, // 最大半径
    moveState =  1, // 1: 放大，0不动，-1缩小
    starRadius = 50; // 星星初始半径

  // 星星接口
  let StarInterface = new CXLM.Interface("StarInterface", ["draw", "reset", "resize"]);

  /** 星座类，实现星星接口 */
  let Constellation = function (starCount) {
    this.starCount = starCount; // 星星数量
    this.starArray = []; // 星星组合
    this.hue = random(360); // 随机生成当前星座颜色
    let i = 0;
    while (i < starCount) {
      i = this.starArray.push(new Star(this.hue, true)); // 创建星星，添加到组合
    }
    this.reset();
    CXLM.Interface.check(this, StarInterface); // 接口检验
  }

  /** 星座类公有方法 */
  Constellation.prototype = {
    constructor: Constellation,
    each: function (fn) { // 迭代所有子元素的方法，组合模式使用
      this.starArray.forEach(ele => {
        fn(ele);
      });
    },
    reset: function () {
      this.orbitRad = random(0, maxRadius * 0.6); // 星座轨道半径
      let
        time = random(0, PI2, true), // 随机生成相位
        speed = random(2, this.orbitRad) / 50000; //星星移动速度，轨道半径越大，速度越快

      // 重设星座位置、形状，不改变颜色
      this.each(element => {
        element.alpha = 0.1;
        element.orbitRadius = this.orbitRad + random(0, 150); // 轨道半径
        element.radius = random(60, element.orbitRadius) / 16; // 星星半径
        element.speed = speed; // 星座内星星速度一致
        element.timePassed = time + random(0, 0.5 - speed, true); // 允许偏差内随机位置
        element.x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
        element.y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
      });
    },
    /** 绘制星座 */
    draw: function () {
      this.starArray.forEach(element => {
        element.draw();
      });
      // 画笔放到第一个星星的位置
      let i = 0;
      ctx.beginPath();
      ctx.moveTo(this.starArray[i].x + offsetX, this.starArray[i].y + offsetY);
      for (let len = this.starArray.length; i < len; i++) {
        ctx.lineTo(this.starArray[i].x + offsetX, this.starArray[i].y + offsetY);
      }
      ctx.lineWidth = 1; // 描边半径，不设颜色、透明度，与最后一个星星保持一致
      ctx.strokeStyle = 'hsla(' + this.hue + ', 80%, 30%, 0.5)'; // 划线颜色
      ctx.stroke(); // 描边
      ctx.closePath(); // 结束绘制
    },
    resize: function (size) {
      this.orbitRad *= size;
      if (this.orbitRad > maxRadius || this.orbitRad < minRadius) {
        this.reset();
        return;
      }
      this.starArray.forEach(ele => {
        ele.resize(size, true);
      })
    }
  }

  /** 星星类，实现星星接口 */
  let Star = function (hue, jump) {
    this.jump = jump;
    if (!jump) { // 跳过默认初始化方法
      this.reset();
      this.alpha = random(0.2, 1, true); // 生成透明度
    }
    this.orbitX = w / 2; // 轨道坐标
    this.orbitY = h / 2;
    this.starCanvas = CacheFactory.createCache(hue); // 使用缓存，享元
    CXLM.Interface.check(this, StarInterface); // 接口检验
  }

  /** 重设 */
  Star.prototype.reset = function (rad) {
    if (rad) {
      this.orbitRadius = rad; // 轨道半径
    } else {
      this.orbitRadius = random(maxRadius); // 轨道半径
    }
    this.radius = random(120, this.orbitRadius) / 16; // 星星半径

    this.timePassed = random(0, PI2, true); // 随机生成相位
    this.speed = random(this.orbitRadius) / 50000; //星星移动速度，轨道半径越大，速度越快
    this.x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
    this.y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
  }

  /** 越界判定 */
  Star.prototype.check = function () {
    return this.x < 0 || this.y < 0 || this.x > w || this.y > h;
  }

  /** 绘制星星 */
  Star.prototype.draw = function () {
    this.x = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
    this.y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;

    // 界外的星星无需绘制，使其加速
    if (this.check() && !this.jump) {
      this.timePassed += this.speed * 2;
      return;
    }
    let twinkle = random(10);

    // 星光闪耀，10%变暗，10%变亮
    if (twinkle === 1 && this.alpha > 0) {
      this.alpha -= 0.05;
    } else if (twinkle === 2 && this.alpha < 1) {
      this.alpha += 0.05;
    }

    // 绘制星星主体
    ctx.globalAlpha = this.alpha;
    // 将缓存的星星绘制在指定的方形区域内
    ctx.drawImage(this.starCanvas, this.x - this.radius + offsetX, this.y - this.radius + offsetY, this.radius * 2, this.radius * 2);
    this.timePassed += this.speed; // 相位增加
  }

  /** 缩放 */
  Star.prototype.resize = function (size, frozen) {
    this.orbitRadius *= size;
    if (!frozen) {
      if (this.orbitRadius > maxRadius) {
        this.reset(random(minRadius * 2));
      } else if (this.orbitRadius < minRadius && random(50) === 1) { // 半径过小时，有一定几率重置
        this.reset(maxRadius);
      }
    }
    this.speed *= size;
    this.radius *= size;
  }

  /** 闭包工厂，生产星星缓存画布对象，有则共享，无则创建 */
  let CacheFactory = (function () {
    let cacheData = {};
    return {
      createCache: function (hue) {
        if (cacheData[hue]) {
          return cacheData[hue];
        } else {
          return cacheData[hue] = drawCache(hue);
        }
      }
    }
  })()

  /** 绘制星星并返回画布对象 */
  let drawCache = function (hueValue) {
    let canvasTemp = document.createElement('canvas'),
      tempCtx = canvasTemp.getContext('2d');
    canvasTemp.width = starRadius * 2;
    canvasTemp.height = starRadius * 2;
    // 渐变圆，圆心开始，50为渐变半径
    gradient2 = tempCtx.createRadialGradient(starRadius, starRadius, 0, starRadius, starRadius, starRadius);
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


  /** 随机数生成器 */
  function random(min, max, float) {
    if (arguments.length < 2) return ~~(Math.random() * min);

    if (min > max) {
      let hold = max;
      max = min;
      min = hold;
    }
    if (float) return Math.random() * (max - min) + min;
    return ~~(Math.random() * (max - min + 1)) + min;
  }

  /** 计算最大允许半径 */
  function maxOrbit(x, y) {
    return ~~Math.sqrt(x * x + y * y) / 2;
  }

  let hearScroll = function (e) {
    let up = 0;
    if (e.wheelDelta) { //IE/Opera/Chrome，↑↓：120、-120
      up = (e.wheelDelta > 0) ? 1.01 : 0.99;
    } else if (e.detail) { //Firefox，↑↓：-3、3
      up = (e.detail < 0) ? 1.01 : 0.99;
    } else if (e) {
      up = e;
    }
    if (up) {
      stars.forEach(ele => {
        ele.resize(up);
      })
    } else {
      console.error("无法识别的值：" + up);
    }
  }

  let running = true;
  let counter = 0;
  /** 主循环 */
  function loop() {
    if (running) {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.5; // 半透明的背景图，实现拖尾
      ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 0.5)';
      ctx.fillRect(0, 0, w, h)

      ctx.globalCompositeOperation = 'lighter';
      for (var i = 1, l = stars.length; i < l; i++) {
        stars[i].draw();
      };
      counter++;
      if (counter === 4) {
        hearScroll(1 + 0.005 * moveState);
        counter = 0;
      }
    }

    window.requestAnimationFrame(loop);
  }
  loop();

  // 初始化星空
  let init = function () {
    stars = [];
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    maxRadius = maxOrbit(w, h);
    minRadius = maxRadius * 0.05;
    hue = random(360); // 主体星空颜色

    // 创建星星
    for (let i = 0; i < maxStars; i++) {
      count = stars.push(new Star(hue)); // 添加到组合
    }
    for (let i = 0; i < maxConstellation; i++) {
      stars.push(new Constellation(random(2, 9))); // 每个星座星星数量
    }
  }

  /* 监听滚轮事件 */
  if (document.addEventListener) {
    document.addEventListener('DOMMouseScroll', hearScroll, false);
  }
  window.onmousewheel = document.onmousewheel = hearScroll; //IE/Opera/Chrome
  /** 迭代所有星星的函数 */
  let doAll = function (fn) {
    stars.forEach(star => {
      if (star.starArray) {
        star.each(fn);
      } else {
        fn(star);
      }
    });
  }
  let step = 1;
  let hearKey = function (e) {

    switch (e.keyCode) {
      case 37:
        {
          // left
          doAll(function (star) {
            star.orbitX -= step;
          })
          break;
        }
      case 38:
        {
          // up
          doAll(function (star) {
            star.orbitY -= step;
          })
          break;
        }
      case 39:
        {
          // right
          doAll(function (star) {
            star.orbitX += step;
          })
          break;
        }
      case 40:
        {
          // down
          doAll(function (star) {
            star.orbitY += step;
          })
          break;
        }
      case 32:
        if (moveState === 1) {
          moveState = -1;
        } else {
          moveState += 1;
        }
        break;
    }
  }
  window.onkeydown = hearKey;

  //元素的鼠标落下事件
  document.onmousedown = function (eDown) {
    //获取鼠标按下的坐标
    var x1 = eDown.clientX;
    var y1 = eDown.clientY;

    //给可视区域添加鼠标的移动事件
    document.onmousemove = function (eMove) {

      //获取鼠标移动时的坐标
      var x2 = eMove.clientX;
      var y2 = eMove.clientY;

      //计算出鼠标的移动距离
      offsetX = x2 - x1;
      offsetY = y2 - y1;
    }

    //清除
    document.onmouseup = function (eUp) {
      doAll(function (star) {
        star.orbitX += offsetX;
        star.orbitY += offsetY;
      })
      offsetX = 0;
      offsetY = 0;
      document.onmousemove = null;
    }

  }

  init();
  return {
    hearBlur: function () {
      running = false;
    },
    hearFocus: function () {
      running = true;
    },
    hearResize: init
  }
})()