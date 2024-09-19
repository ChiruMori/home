
// 简单单体
// 复用map页面的观察者、责任链
var cxlm = {}

cxlm.showAbout = function(){
  $("#aboutModal").modal();
}

/** 窗口大小重设监听 */
cxlm.hearResize = cxlm.hearLoad = function () {
  let titleDiv = $("#title");
  let offX = window.innerWidth * 0.36;
  let offY = window.innerHeight * 0.382;
  titleDiv.css({
    position: "absolute",
    top: offY,
    left: offX
  })
}

/** 初始化方法 */
cxlm.init = function () {
  listener.handleObserver(star)
    .handleObserver(title.getInstance(constValue.getInstance("title")))
    .handleObserver(this);
}

cxlm.init();