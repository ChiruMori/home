/*
 * JS面向对象编程，部分常用方法
 * extends:			类继承
 * Interface:		接口
 * 	check					接口方法检验
 * deepClone:		对象深拷贝
 * EventUtil:		绑定监听事件
 * each:				二维数组遍历
 */

var CXLM = {}; // 命名空间对象

/** 接口类
 * @param name 接口名
 * @param methods 方法列表
 */
CXLM.Interface = function (name, methods) {
	// 判断接口的参数个数
	if (arguments.length != 2) {
		throw new Error('this instance must have two arrguments');
	}
	this.name = name;
	this.methods = [];
	for (var i = 0, len = methods.length; i < len; i++) {
		if (typeof methods[i] === 'string') { // 检测函数名是否为字符串类型
			this.methods.push(methods[i]); // 通过检测：推入数组
		} else {
			throw new Error("method's name must be string"); // 未通过检测，抛出异常
		}
	}
}

/** 检验接口实例里的方法
 * @param instance 实例对象
 * @param 接口名
 */
CXLM.Interface.check = function (instance) {
	// 参数数目小于2，非法检测
	if (arguments.length < 2) {
		throw new Error("arguments does not exist!");
	}
	// 获得接口对象
	for (var i = 1, len = arguments.length; i < len; i++) {
		var interfaceTemp = arguments[i];
		// 判断参数是否是接口类的类型
		if (interfaceTemp.constructor !== CXLM.Interface) {
			throw new Error("The arguments must be Interface!");
		}
		// 循环接口实例对象中的每一个方法
		for (var j = 0, len2 = interfaceTemp.methods.length; j < len2; j++) {
			// 获取每一个方法名
			var methodName = interfaceTemp.methods[j];
			if (!instance[methodName] || typeof instance[methodName] !== 'function') {
				throw new Error("The Method [" + methodName + "] is Not Found!");
			}
		}
	}
}

/**
 * 递归实现对象深拷贝
 * @param source 要拷贝的原对象
 */
CXLM.deepClone = function (source) {
		if (!source || typeof source !== 'object') {
			throw new Error('error arguments', 'shallowClone');
		}
		var targetObj = source.constructor === Array ? [] : {};
		for (var keys in source) {
			if (source.hasOwnProperty(keys)) {
				if (source[keys] && typeof source[keys] === 'object') {
					targetObj[keys] = source[keys].constructor === Array ? [] : {};
					targetObj[keys] = CXLM.deepClone(source[keys]);
				} else {
					targetObj[keys] = source[keys];
				}
			}
		}
		return targetObj;
	},

	/** 实现继承
	 * @param sub 子类
	 * @param sup 父类
	 */
	CXLM.extend = function (sub, sup) {
		//只继承父类的原型对象

		//step1: 使用一个空函数进行中转
		var VoidFunc = new Function();
		//step2: 把父类的原型对象放到空函数的原型对象中
		VoidFunc.prototype = sup.prototype;
		//step3: 原型继承
		sub.prototype = new VoidFunc();
		//step4: 还原子类的原型构造器
		sub.prototype.constructor = sub;
		//step5: 保存父类的原型对象，降低耦合性、且便于获得父类的原型对象，保存为子类的一个静态属性
		sub.superClass = sup.prototype;
		//step6: 构造器保险
		if (sup.prototype.constructor == Object.prototype.constructor) {
			sup.prototype.constructor = sup;
		}
	}

/**
 * 单体模式，外观模式
 * 实现跨浏览器的事件处理程序
 * 注册事件、取消注册
 */
CXLM.EventUtil = {
	bindHandler: function (element, type, handler, param) {
		var fn = handler;
		if (param) { // 如果需要传参
			fn = function (e) { // 继承、参数传递
				handler.call(this, e, param); //继承监听函数,并传入参数以初始化;
			}
		}
		if (element.addEventListener) {
			element.addEventListener(type, fn, false); // false：冒泡事件
		} else if (element.attachEvent) { // IE
			element.attachEvent("on" + type, fn);
		}
	},
	removeHandler: function (element, type, handler) {
		if (element.removeEventListener) {
			element.removeEventListener(type, handler, false);
		} else if (element.detachEvent) { // IE
			element.detachEvent("on" + type, handler);
		}
	}
}

/**
 * 拓展的Array遍历方法，支持遍历多维数组
 * @param fn 遍历时执行的方法
 */
Array.prototype.each = function (fn) {
	try {
		//创建计数器，防止数据冲突
		(this.counter) || (this.counter = 0);
		//数组的长度大于0且传进的参数为函数时
		if (this.length > 0 && fn.constructor == Function) {
			while (this.counter < this.length) {
				var temp = this[this.counter];
				//获取到当前元素，且当前元素为数组
				if (temp && temp.constructor == Array) {
					temp.each(fn); //还是数组则递归
				} else {
					fn.call(temp, [temp]); //执行传递的函数，并传递参数
				}
				this.counter++;
			}
			this.counter = null; //释放内存
		}
	} catch (e) {
		console.log(e);
	}
	return this;
}