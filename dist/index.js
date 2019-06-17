function nextZIndex() {
  var max = 0;
  var children = document.body.children;

  for (var i = 0; i < children.length; i++) {
    var child = children[i];
    var curtNodeZIndex = getComputedStyle(child).zIndex;

    if (curtNodeZIndex !== 'auto' && curtNodeZIndex > max) {
      max = parseInt(curtNodeZIndex);
    }
  }

  return 2000 + ++max;
}

var pendings = [],
    loads = [];

function cacheRequestError(config) {
  if ( config === void 0 ) config = {};

  var useNotify = config.useNotify; if ( useNotify === void 0 ) useNotify = true;
  var wrapperClassName = config.wrapperClassName;
  var msgClassName = config.msgClassName;
  var pendingMsg = config.pendingMsg; if ( pendingMsg === void 0 ) pendingMsg = 'connecting...';
  var loadingMsg = config.loadingMsg; if ( loadingMsg === void 0 ) loadingMsg = 'downloading...';
  var timeout = config.timeout; if ( timeout === void 0 ) timeout = 1000;
  var pendinghandler = config.pendinghandler; if ( pendinghandler === void 0 ) pendinghandler = function () {};
  var loadinghandler = config.loadinghandler; if ( loadinghandler === void 0 ) loadinghandler = function () {};

  var createNotify = function () {
    if (!useNotify) { return; }
    var box = document.createElement('div');
    var msg = document.createElement('div');

    if (wrapperClassName) {
      box.className = wrapperClassName;
    } else {
      box.style.cssText = "position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: " + (nextZIndex()) + "; display: none;";
    }

    if (msgClassName) {
      box.className = msgClassName;
    } else {
      msg.style.cssText = "position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);";
    }

    box.appendChild(msg);
    document.body.appendChild(box);
    return box;
  };

  var notifyDom = createNotify();
  var notifyMsgDom = notifyDom.children[0];

  var showNotify = function () { return notifyDom.style.display = 'block'; };

  var hideNotify = function () { return notifyDom.style.display = 'none'; };

  var $notify = function (msg) {
    if (!useNotify) { return; }
    notifyMsgDom.innerText = msg;
    showNotify();
  };

  var cacheOpen = XMLHttpRequest.prototype.open;

  XMLHttpRequest.prototype.open = function () {
    var this$1 = this;
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    cacheOpen.call.apply(cacheOpen, [ this ].concat( args ));
    setTimeout(function () {
      if (this$1.readyState === 1) {
        this$1.pending = true;
        pendings.push(this$1);
        $notify(pendingMsg);
      }

      if (this$1.readyState !== 4) {
        pendinghandler(this$1.readyState);
      }
    }, timeout);
    var first = true,
        start = 0;
    setTimeout(function () {
      var cacheReadStateChange = this$1.onreadystatechange;

      this$1.onreadystatechange = function () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        if (typeof cacheReadStateChange === 'function' && first) {
          cacheReadStateChange.call.apply(cacheReadStateChange, [ this ].concat( args ));
          var position = pendings.indexOf(this);

          if (position > -1) {
            for (var i = position; i < pendings.length - 1; i++) {
              pendings[i] = pendings[i + 1];
            }

            pendings.pop();
          }

          first = false;
          start = Date.now();
        }

        if (this.readyState !== 4 && Date.now() - start > timeout) {
          if (loads.indexOf(this) < 0) {
            loads.push(this);
            loadinghandler(this);
          }

          if (!pendings.length) {
            $notify(loadingMsg);
          }
        }

        start = Date.now();

        if (this.readyState === 4) {
          var isLoaded = true;

          for (var i$1 = 0; i$1 < loads.length; i$1++) {
            if (loads[i$1].readyState !== 4) {
              isLoaded = false;
              break;
            }
          }

          if (isLoaded && !pendings.length) {
            setTimeout(function () { return hideNotify(); }, 1000);
            loads = [];
            pendings = [];
          }
        }
      };
    }, 0);
  };
}

export default cacheRequestError;
