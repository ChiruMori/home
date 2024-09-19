/** 
 * 维护所有静态属性
 * 分支闭包单体：根据参数返回闭包中需要的单体
 */

constValue = (function () {

  let init = function (type) {

    /** 左侧链接组依赖数据 */
    const linkArray = [
      {
          "text": "Bilibili",
          "link": "https://www.bilibili.com"
      }, {
        "text": "Pixiv",
        "link": "https://www.pixiv.net"
      }, {
        "text": "CSDN",
        "link": "https://www.csdn.net/"
      }, {
        "text": "BootCDN",
        "link": "https://www.bootcdn.cn/"
      }, {
        "text": "GitHub",
        "link": "https://github.com/"
      }, {
        "text": "imooc",
        "link": "https://www.imooc.com/"
      }, {
	    "text": "ECMA6 书签",
		"link": "http://es6.ruanyifeng.com/#docs/string#%E6%A0%87%E7%AD%BE%E6%A8%A1%E6%9D%BF"
	  }, {
        "text": "free-ss",
        "link": "https://free-ss.site"
      }, {
        "text": "虫钢",
        "link": "http://www.gangqinpu.com"
      }, {
        "text": "度盘",
        "link": "https://pan.baidu.com"
      }, {
        "text": "翻译",
        "link": "https://fanyi.baidu.com"
      }, {
        "text": "网易企业邮",
        "link": "https://qiye.163.com/login/"
      }, {
        "text": "校园网",
        "link": "http://portal.dlmu.edu.cn/eportal/index.jsp?wlanuserip=1db427551d9861d39c7ade5dbd9c057a&wlanacname=c20f646d18ec8420743bb59779d3aa5d&ssid=&nasip=321b8c06ed4b01461a74c22a11633718&snmpagentip=&mac=a4849b241c68536cf00f15f08e973569&t=wireless-v2&url=137959cd1821ef10e47e2c5c8323194fdc56da23e9448d87&apmac=&nasid=c20f646d18ec8420743bb59779d3aa5d&vid=b5e77bd69faaeabc&port=468de04ff0e989c1&nasportid=c6abed3ee205e3f81369f2aee75d965854e99880de6bf6fb1be7865de8c8816862e4d7c8c243fb5bd24958d39ce84bc5"
      }, {
        "text": "教务系统",
        // "link": "http://202.118.88.156:8085/loginAction.do"
        "link": "http://202.118.88.140:8085/loginAction.do"
      }, {
        "text": "图书馆",
        "link": "http://202.118.84.130:1701/primo_library/libweb/action/myAccountMenu.do?vid=dlmh"
      }, {
        "text": "NHKラジオニュース",
        "link": "http://www.nhk.or.jp/radionews/"
      }, {
        "text": "Ｒｅ：ゼロから始める異世界生活",
        "link": "http://ncode.syosetu.com/n2267be/"
      }, {
        "text": "不存在的页面",
        "link": "./error.html"
      }
      /*, {
          "text": "Vjudge",
          "link": "https://vjudge.net"
      }, {
        "text": "FreeSS",
        "link": "https://ssx.re/"
      }, {
        "text": "免费账号",
        "link": "https://plus.google.com/communities/103542666306656189846/stream/dd570c04-df51-4394-8c83-eabb12cc0d0c"
      }*/
    ]

    /** 左侧下拉链接组依赖数据 */
    const apiArray = [{
		"text": "python3",
		"link": "https://python3-cookbook.readthedocs.io/zh_CN/latest/preface.html"
    }, {
      "text": "Django 2.0",
      "link": "https://docs.djangoproject.com/zh-hans/2.0/"
    }, {
      "text": "Bootstrap 4",
      "link": "https://v4.bootcss.com/docs/4.0/getting-started/introduction/"
    }, {
      "text": "JQuery",
      "link": "https://www.jquery123.com/"
    }, {
      "text": "Layui",
      "link": "https://www.layui.com/doc/"
    }, {
      "text": "SweetAlert 2",
      "link": "http://www.mishengqiang.com/sweetalert2/"
    }, {
      "text": "VUE 2.x",
      "link": "https://vuejs.bootcss.com/v2/api/"
    }, {
      "text": "DRF",
      "link": "https://www.django-rest-framework.org/"
    }, {
	  "text": "ECMA6",
	  "link": "http://es6.ruanyifeng.com/"
	}]

    /** 标题动画插件依赖数据 */
    const titleArray = [{
      "text": "梦中花开 雪落掌心",
      "in": ["fadeInUp", "fast"],
      "out": ["flipOutY", "slow"]
    }, {
      "text": "几时宇内 曷不委心",
      "in": ["fadeInUp", "fast"],
      "out": ["bounceOut", "slow"]
    }, {
      "text": "祭祀风的人",
      "in": ["fadeInUp", "fast"],
      "out": ["flipOutX", "slow"]
    }, {
      "text": "梦里到过的地方",
      "in": ["fadeInUp", "fast"],
      "out": ["lightSpeedOut", "slow"]
    }, {
      "text": "极光与星夜",
      "in": ["fadeInUp", "fast"],
      "out": ["flipOutY", "slow"]
    }]

    // 返回闭包内指定对象
    switch (type) {
      case "link":
        return linkArray;
      case "api":
        return apiArray;
      case "title":
        return titleArray;
      default: // 未定义的参数
        return undefined;
    }
  }

  return {
    getInstance: function (type) {
      return init(type);
    }
  }

})()