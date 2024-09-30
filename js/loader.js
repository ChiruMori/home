; // 方案不可行：因为无法控制在一个标签资源完全下载结束后才加载另一个标签（同步问题）
(() => {
  // If we can't ensure jquery, we can check url with xmlHttp
  const checkURL = function (url) {
    if (url === true) return url;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('GET', url, false);
    xmlhttp.send();
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status != 200) return false;
      return true;
    }

    // When we use jQuery, then we can check url by this way
    // return new Promise((res)={
    // $.ajax({
    //   url: 'http://cxlm.work/css/cxlm.css',
    //   type: 'GET',
    //   complete: (response) => res(response.status == 200);
    //  });
    //
    // })
  }

  const resourceObj = [{ // 前两项为 CDN 加速镜像，最后一项为保险，如果本脚本可以正常运行，则最后一项一定可以使用
    probe: 'https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js',
    js: [
      // 'https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js',
      'https://cdn.bootcss.com/font-awesome/5.11.2/js/fontawesome.min.js',
      'https://cdn.bootcss.com/font-awesome/5.11.2/js/all.min.js',
      'https://cdn.bootcss.com/jquery-contextmenu/2.7.1/jquery.contextMenu.min.js',
      'https://cdn.bootcss.com/jquery-contextmenu/2.7.1/jquery.ui.position.min.js',
      'https://cdn.bootcss.com/twitter-bootstrap/4.3.1/js/bootstrap.min.js'
    ],
    css: [
      'https://cdn.bootcss.com/font-awesome/5.11.2/css/all.min.css',
      'https://cdn.bootcss.com/jquery-contextmenu/2.7.1/jquery.contextMenu.min.css',
      'https://cdn.bootcss.com/twitter-bootstrap/4.3.1/css/bootstrap.min.css'
    ]
  }, {
    probe: 'https://cdn.bootcdn.net/ajax/libs/jquery/3.3.1/jquery.min.js',
    js: [
      // 'https://cdn.bootcdn.net/ajax/libs/jquery/3.3.1/jquery.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/js/fontawesome.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/js/all.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.ui.position.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/js/bootstrap.min.js'
    ],
    css: [
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.7.1/jquery.contextMenu.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.3.1/css/bootstrap.min.css'
    ]
  }, {
    probe: 'true',
    js: [
      // './lib/jquery.min.js',
      './lib/fontawesome.min.js',
      './lib/all.min.js',
      './lib/jquery.contextMenu.min.js',
      './lib/jquery.ui.position.min.js',
      './lib/bootstrap.min.js'
    ],
    css: [
      './lib/all.min.css',
      './lib/jquery.contextMenu.min.css',
      './lib/bootstrap.min.css',
    ]
  }];

  const addJs = ['./js/utils.js', './js/storage.js', './js/bookmarks.js', './js/option.js', './js/base.js', './js/backimg.js'];
  const addCss = ['./css/cxlm.css']

  for (let cdn of resourceObj) {
    if (checkURL(cdn.probe)) {
      cdn.css.push(...addCss);
      for (let cssLink of cdn.css) {
        let cssNode = document.createElement('link');
        cssNode.href = cssLink;
        document.head.append(cssNode);
      }
      cdn.js.push(...addJs);
      for (let jsLink of cdn.js) {
        let jsNode = document.createElement('script');
        jsNode.src = jsLink;
        document.head.append(jsNode);
      }
      return;
    }
  }
  alert('网络连接故障');

})();