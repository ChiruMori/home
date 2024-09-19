/**
 * 命名空间，map
 * 简单单体模式
 * 最后修改于：2019.4.23，适配改过后的缓存操作
 */
var map = {
    cityCode: null,
    trAppId: null,
    trKey: null
};

/* 初始化 */
map.init = function () {
    map.codeCheck();
    var leftListGroup = $("#mlinkgroup, #linkgroup");
    var ddDiv = $("#dropMenu");
    /*var weatherDiv = $("div[name='p_weather']");
    var dWeatherDiv = $("div[name='d_weather']");*/
    /** 填充左侧连接组 */
    constValue.getInstance("link").forEach(element => {
        leftListGroup.append("<a class='list-group-item list-group-item-action text-light bg-link' target='_blank' href='" + element.link + "'>" + element.text + "</a>");
    });
    /** 填充API链接组 */
    constValue.getInstance("api").forEach(ele => {
        ddDiv.append("<a href='" + ele.link + "' class='dropdown-item text-secondary' target='_blank'>" + ele.text + "</a>");
    })
    /** 初始化天气组件，js直接调用接口已停用 */
    /*map.weather(weatherDiv, dWeatherDiv, map.cityCode);*/
    /** 初始化TODO组件 */
    // map.initTodo();
    /** 初始化标题组件、背景动画组件、星火动画组件、光斑动画组件，同时处理对应的监听 */
    listener.handleObserver(title.getInstance(constValue.getInstance("title")))
        .handleObserver(mLight)
        .handleObserver(fire)
        .handleObserver(light);
}

/** 初始化必要参数与设置 */
map.codeCheck = function () {
    map.cityCode = dataManager.getData("cityCode");
    map.trAppId = dataManager.getData("trAppId");
    map.trKey = dataManager.getData("trKey");
    if (!map.cityCode) {
        dataManager.setData("cityCode", map.cityCode = prompt("输入城市代码：", ""));
    }
    if (!map.trAppId) {
        dataManager.setData("trAppId", map.trAppId = prompt("输入百度翻译APPId：", ""));
    }
    if (!map.trKey) {
        dataManager.setData("trKey", map.trKey = prompt("输入百度翻译key：", ""));
    }
}

map.backup = function () {
    $("#storageTitle").html("备份缓存，请拷贝以备份");
    $("#storageModal").modal();
    dataManager.backup(function (text) {
        $("#storageArea").val(text);
    })
    $("#storageBtn").hide();
}

map.recovery = function () {
    $("#storageArea").val("");
    $("#storageTitle").html("输入备份的数据，提交后进行恢复");
    $("#storageModal").modal();
    $("#storageBtn").show();
}

map.recoveryData = function () {
    let text = $("#storageArea").val();
    dataManager.recover(text);
    swal("完成操作", "可以在控制台查看详细状态", "success");
    $("#storageModal").modal('hide');
}

/** 修改动画文本内容，重设监听、单体 */
map.changeTitle = function () {
    let text = $("input[name='mid_input']").val();
    let tempArr = constValue.getInstance("title");
    tempArr.unshift({
        "text": text,
        "in": ["fadeInUp", "fast"],
        "out": ["flipOutY", "slow"]
    });
    title.resetInstance(tempArr);
}

/** 新增TODO方法 */
map.newTodo = function () {
    let obj = {
        name: $("#todoNameInput").val(),
        time: $("#todoTimeInput").val(),
        info: $("#todoInfoInput").val(),
        type: $("#todoTypeSelect").val(),
        state: $("#todoStateSelect").val()
    }
    if (obj.name && obj.type && obj.state) {
        todo.newTodo(obj);
        $("#newTodoModal").modal('hide');
    } else {
        swal("Error", "数据填写不全", "error");
    }
}

map.showTodoModal = function () {
    $("#todoNewForm")[0].reset();
    $("#newTodoModal").modal();
}

map.showCountDownModal = function () {
    $("#countDownContent").val('');
    $("#countDownDate").val('');
    $("#countDownDate").datetimepicker({
        format: 'YYYY/MM/DD HH:mm:ss',
        icons: {
            time: 'fas fa-clock',
            date: 'fas fa-calendar-alt',
            up: 'fas fa-angle-double-up',
            down: 'fas fa-angle-double-down',
            previous: 'fas fa-angle-double-left',
            next: 'fas fa-angle-double-right',
            today: 'fas fa-calendar-day',
            clear: 'fas fa-reply-all',
            close: 'fas fa-times-circle'
        },
        showClear: true,
        minDate: new Date(),
        showClose: true
    });
    $("#countDownModal").modal();
}

map.newCountDown = function () {
    $("#countDownModal").modal('hide');
    todo.newCountDown($("#countDownContent").val(), $("#countDownDate").val());
}

/** TODO组件初始化 */
map.initTodo = function () {
    $("#modalDiv").css({
        height: document.documentElement.clientHeight * 0.6 + 'px'
    })
    $("#modalDiv").css({
        height: document.documentElement.clientHeight * 0.6 + 'px'
    })
    let scroll = $("#scroll-mar");
    scroll.html(""); // 清空
    let todoData = constValue.getInstance("todo");
    for (attr in todoData.todo) {
        todoData.todo[attr].forEach(ele => {
            scroll.append(`<p class="` + (ele.info ? (' cur-pointer" onclick="swal(\'INFO\', \'' + ele.info + '\', \'info\')"') : '"') + `>to ` + attr + `: ` + ele.name + `</p>`)
        })
    }
    if (scroll.html() === '') {
        scroll.append(`<p>暂无内容</p>`);
    }
}

/** TODO组件点击弹窗 *
map.todo = function (mode) {
    let titleObj = $("#todoModalLabel");
    let title, showObj;
    switch (mode) {
        case 'todo':
            {
                title = 'What To Do?';
                showObj = constValue.getInstance("todo").todo;
                break;
            }
        case 'done':
            {
                title = 'What Have Done?';
                showObj = constValue.getInstance("todo").done;
                break;
            }
        case 'giveup':
            {
                title = 'What Have Given Up?';
                showObj = constValue.getInstance("todo").giveUp;
                break;
            }
    }
    titleObj.html(title);
    $("#todoModal").modal()
    let modalDiv = $("#modalDiv");
    let modalBtn = $("#modalBtn");
    modalDiv.html(''); // 清空原有内容
    modalBtn.html(''); // 清空按钮组
    for (attr in showObj) {
        let ul = $(`<ul class="list-group list-group-flush">`);
        showObj[attr].forEach(ele => {
            ul.append(`<li class="list-group-item bg-dark-trans` + (ele.info ? (' cur-pointer" onclick="swal(\'INFO\', \'' + ele.info + '\', \'info\')"') : '"') + `>` + ele.name + `<span class="float-right text-muted">` + ele.time + `</span></li>`)
        })
        if (!showObj[attr].length) {
            ul.append(`<li class="list-group-item bg-dark-trans">Empty</li>`);
        }
        modalDiv.append(`<h5 id="` + attr + `">` + attr + `</h5>`);
        modalDiv.append(ul);
        modalBtn.append(`<a class="btn btn-outline-light" href="#` + attr + `">` + attr + `</a>`);
    }
}
*/
map.search = function (mode) {
    var word = $("#toSearch").val();
    if (mode == 1) {
        //  百度搜索
        window.open("http://www.baidu.com/s?word=" + word);
    } else if (mode == 2) {
        //  谷歌搜索
        window.open("https://www.google.com/search?q=" + word);
    }
    return false;
}

/*查询IP*/
map.queryIp = function (pc) {
    var ip;
    if (pc) {
        ip = $("input[name='mid_input']").val();
    } else {
        ip = $("input[name='m_input']").val();
    }
    $.ajax({
        async: false,
        type: "GET",
        url: "http://ip-api.com/json/" + ip,
        dataType: "json",
        success: function (res) {
            console.log(res);
            swal("country:[" + res.country + "]\ncity:[" + res.city + "]\nlocation:[" + res.lat + "," + res.lon + "]");
        },
        error: function (res) {
            console.log(res);
            swal("Error", "当前IP获取失败", "error");
        }
    });
}

/*查询MD5*/
map.getMD5 = function (pc) {
    var ori;
    if (pc) {
        ori = $("input[name='mid_input']").val();
    } else {
        ori = $("input[name='m_input']").val();
    }
    var orimd5 = md5(ori);
    console.info("原文：[" + ori + "]\n密文：[" + orimd5 + "]")
    swal(ori + "的MD5密文为：", orimd5, "success");
}

map.newTab = function () {
    var href = $("input[name='mid_input']").val();
    window.open(href, "_blank");
}

/* 查询自己的IP，接口被调整，放弃 */
/*
map.queryMyIp = function () {
    var ipUrl = "http://pv.sohu.com/cityjson?ie=utf-8";
    $.ajax({
        async: false,
        type: "GET",
        url: ipUrl,
        dataType: "jsonp",
        success: function (res) {
            console.log(res);
            console.log(res.cip); // 这个是查到的ip
        },
        error: function (res) {
            console.log(res);
            swal("Error", "当前IP获取失败", "error");
        }
    });
}*/

/* 将二维码插入右侧 */
map.getQrCode = function (pc) {
    var imgDiv, dat;
    if (pc) {
        imgDiv = $("div[name='imgDiv']");
        dat = $("input[name='mid_input']").val();
    } else {
        imgDiv = $("div[name='mImgDiv']");
        dat = $("input[name='m_input']").val();
    }
    this.qr(imgDiv, 150, dat);
}

/* 二维码模块 */
map.qr = function (div, size, dat) {
    var url = "http://api.qrserver.com/v1/create-qr-code/?size=" + size + "×" + size + "&data=" + dat;
    div.html("<img width='" + div.width() + "' src = '" + url + "'/>");
}

/* 获取天气预报数据，请求或者读缓存 *//*
map.weather = function (div, dDiv, cityCode) {
    if (!cityCode) {
        swal("城市代码未定义", "无法获取天气信息", "error");
        return;
    }
    var weatherData = dataManager.getData("weather");
    if (weatherData) { // 已失效或不存在
        map.initWeather(div, dDiv, weatherData);
    } else {
        console.debug("Now sending ajax request ...");
        $.ajax({
            async: true, // 异步请求
            type: "GET",
            url: "http://t.weather.sojson.com/api/weather/city/" + cityCode,
            dataType: "json",
            success: function (res) {
                console.log(res);
                dataManager.setData("weather", res, new Date(new Date(res.time).getTime() + 3600 * 12000)); // 缓存天气数据而且设置最大时长12小时
                map.initWeather(div, dDiv, res)
            },
            error: function (res) {
                console.log(res);
                swal("Error", "天气数据获取失败", "error");
            }
        });
        console.debug("Now completed the request.");
    }
}

/* 渲染天气预报模块 *//*
map.initWeather = function (div, dDiv, obj) {
    var data = obj.data.forecast;
    data.forEach((element, i) => {
        if (i < 5) {
            div.append(
                "<div class='card bg-dark-trans'>" +
                " <img class='card-img-top con-trans' src='./pic/" + element.type + ".jpg' alt='Card image cap'>" +
                " <div class='card-body'>" +
                "  <h5 class='card-title text-white'>" + element.week + "</h5>" +
                "  <p class='card-text text-white'>气温：" + element.low.slice(3) + " ~ " + element.high.slice(3) + "</p>" +
                "  <p class='card-text text-white'>风况：" + element.fx + " " + element.fl + "</p>" +
                "  <p class='card-text'><small class='text-secondary'>" + element.ymd + "</small></p>" +
                " </div>" +
                "</div>");
            var active = (i) ? "" : " active";
            dDiv.append(
                "<div class='carousel-item" + active + "'>" +
                " <img class='w-100' src='./pic/" + element.type + ".jpg' alt='" + element.type + "'>" +
                " <div class='carousel-caption'>" +
                "  <h5 class='card-title text-white'>" + element.week + "</h5>" +
                "  <p class='card-text text-white'>气温：" + element.low.slice(3) + " ~ " + element.high.slice(3) + "</p>" +
                "  <p class='card-text text-white'>风况：" + element.fx + " " + element.fl + "</p>" +
                " </div>" +
                "</div>");
        }
        console.info(element.ymd.slice(5) + ": " + element.type + "。气温：[" + element.low.slice(3) + " ~ " + element.high.slice(3) +
            "]，风况：[" + element.fx + " " + element.fl + "]");
    });
    dDiv.parent().after(
        "<div class='alert bg-dark-trans mt-3 text-muted' role='alert'>" +
        obj.cityInfo.city + " : " + data[0].type +
        "</div>");
    div.after(
        "<div class='alert bg-dark-trans mt-3 text-muted' role='alert'>" +
        obj.cityInfo.city + " : " + data[0].type + "。 " + data[0].notice +
        "。</div>");
}*/

map.slider = null;
map.initSlider = function () {
    let range = $('#fireRange');
    map.slider = range.ionRangeSlider({
        skin: "round",
        type: "single",
        postfix: "个",
        grid: true
    }).data("ionRangeSlider");
    $("#fireNumberPickerBtn1").click(function () {
        fire.changeParticleCount(range.val(), function (ret) {
            swal("Error", ret, "error");
        });
        $("#fireNumberModal").modal('hide');
    });
    $("#fireNumberPickerBtn2").click(function () {
        fire.changePillarCount(range.val(), function (ret) {
            swal("Error", ret, "error");
        });
        $("#fireNumberModal").modal('hide');
    });
}
/* 控制动画 */
map.btn1 = function () {
    $("#fireNumberPickerBtn1").show();
    $("#fireNumberPickerBtn2").hide();
    $("#fireNumerTitle").html("需要多少粒子？")
    if (!map.slider) {
        map.initSlider();
    }
    map.slider.update({
        min: 1,
        max: 1000,
        from: 150,
    });
    $("#fireNumberModal").modal();
}
map.btn2 = function () {
    $("#fireNumberPickerBtn2").show();
    $("#fireNumberPickerBtn1").hide();
    let range = $('#fireRange');
    $("#fireNumerTitle").html("需要多少圆？")
    if (!map.slider) {
        map.initSlider();
    }
    map.slider.update({
        min: 1,
        max: 100,
        from: 15,
    })
    $("#fireNumberModal").modal();
}
map.btn3 = function () {
    $("#fireColorModal").modal();

    // Basic instantiation:
    $('#color').colorpicker();

    // Example using an event, to change the color of the .jumbotron background:
    $('#color').on('colorpickerChange', function (event) {
        $('.colorpicker-input-addon').css('background-color', event.color.toString());
    });

    $("#fireColorPickerBtn").click(function () {
        let colorful = $("#fireColorCheck")[0].checked;
        let color = $('#color').val();
        fire.changeColor(colorful, color);
        $("#fireColorModal").modal('hide');
    });
}
map.btn5 = function () {
    light.randomAdd(function (msg) {
        swal("Error", msg, "error");
    });
}

/* 调用百度翻译接口 */
map.translate = function (from, to) {
    let trAppId = map.trAppId;
    let trKey = map.trKey;
    if (!trAppId || !trKey) {
        swal("数据不全", "没有设定appId和key，翻译功能不可用", 'error');
        return;
    }
    if (!trAppId || !trKey) {
        swal("抱歉，不对外提供在线翻译服务T_T", "因为那玩意要钱的，需要更多帮助请查看控制台", "error");
        console.info("如需使用翻译功能，请到百度翻译开放平台申请，并将APPId、key替换为你自己的即可使用");
        return;
    }
    var fromArea = $("#trans-from");
    var toArea = $("#trans-to");
    var q = fromArea.val();
    var salt = 999999999;
    if (q.length == 0) { // 未输入
        toArea.text(""); // 清空结果区域
        swal("Error", "请输入一些内容", "error");
        return;
    }
    sign = md5(trAppId + q + salt + trKey); // MD5签名
    var url = "http://api.fanyi.baidu.com/api/trans/vip/translate" +
        "?q=" + q + // 原文
        "&from=" + from + // 源语言
        "&to=" + to + // 目标语言
        "&appid=" + trAppId + // APPId
        "&salt=" + salt + // 随机数
        "&sign=" + sign; // 签名
    $.ajax({
        async: false,
        type: "GET",
        url: url,
        dataType: "jsonp",
        crossDomain: true,
        success: function (res) {
            console.log(res);
            toArea.text(res.trans_result[0].dst);
        },
        error: function (res) {
            console.log(res);
            swal("Error", "调用翻译接口失败", "error");
        }
    });
}