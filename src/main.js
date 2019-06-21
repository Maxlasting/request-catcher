function nextZIndex () {
  let max = 0

  const children = document.body.children

  for (let i=0; i<children.length; i++) {
    const child = children[i]
    const curtNodeZIndex = getComputedStyle(child).zIndex
    if (curtNodeZIndex !== 'auto' && curtNodeZIndex > max) {
      max = parseInt(curtNodeZIndex)
    }
  }

  return 2000 + (++max)
}

let pendings = [], loads = []

function cacheRequestError (config = {}) {
  const {
    useNotify = true,
    wrapperClassName,
    msgClassName,
    pendingMsg = 'connecting...',
    loadingMsg = 'downloading...',
    timeout = 1000,
    pendinghandler = function () {},
    loadinghandler = function () {},
    customHide = function () {},
  } = config

  const createNotify = function () {
    if (!useNotify) return
    const box = document.createElement('div')
    const msg = document.createElement('div')
    if (wrapperClassName) {
      box.className = wrapperClassName
    } else {
      box.style.cssText = `position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: ${nextZIndex()}; display: none;`
    }
    if (msgClassName) {
      box.className = msgClassName
    } else {
      msg.style.cssText = `position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);`
    }
    box.appendChild(msg)
    document.body.appendChild(box)
    return box
  }

  const notifyDom = createNotify()

  if (useNotify) {
    const notifyMsgDom = notifyDom.children[0]
    const showNotify = () => notifyDom.style.display = 'block'
    const hideNotify = () => notifyDom.style.display = 'none'
  }

  const $notify = function (msg) {
    if (!useNotify) return
    notifyMsgDom.innerText = msg
    showNotify()
  }

  const cacheOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function (...args) {
    cacheOpen.call(this, ...args)

    setTimeout(() => {
      if (this.readyState === 1) {
        this.pending = true
        pendings.push(this)
        $notify(pendingMsg)
      }
      if (this.readyState !== 4) {
        pendinghandler(this, args[1])
      }
    }, timeout)

    let first = true, start = 0

    setTimeout(() => {
      const cacheReadStateChange = this.onreadystatechange

      this.onreadystatechange = function (...args) {
        if (typeof cacheReadStateChange === 'function' && first) {
          cacheReadStateChange.call(this, ...args)
          const position = pendings.indexOf(this)
          if (position > -1) {
            for (let i=position; i<pendings.length-1; i++) {
              pendings[i] = pendings[i+1]
            }
            pendings.pop()
          }
          first = false
          start = Date.now()
        }
        if (this.readyState !== 4 && Date.now() - start > timeout) {
          if (loads.indexOf(this) < 0) {
            loads.push(this)
            loadinghandler(this)
          }
          if (!pendings.length) {
            $notify(loadingMsg)
          }
        }
        start = Date.now()
        if (this.readyState === 4) {
          let isLoaded = true
          for (let i=0; i<loads.length; i++) {
            if (loads[i].readyState !== 4) {
              isLoaded = false
              break;
            }
          }
          if (isLoaded && !pendings.length) {
            setTimeout(() => {
              useNotify ? hideNotify() : customHide
            }, 1000)
            loads = []
            pendings = []
          }
        }
      }
    }, 0)
  }
}

export default cacheRequestError
