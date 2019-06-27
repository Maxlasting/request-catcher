var pendings = [], loads = []

function cacheRequestError (config) {
  config = config || {}

  var timeout = config.timeout || 1000
  var handleTimeout = config.handleTimeout || function () {}
  var handleNotify = config.handleTimeout || function () {}

  var cacheOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function () {
    cacheOpen.apply(this, arguments)

    setTimeout(() => {
      if (this.readyState === 1) {
        this.pending = true
        pendings.push(this)
        handleNotify({
          xhr: this,
          url: arguments[1],
          status: 'pending',
        })
      }
      if (this.readyState !== 4) {
        handleTimeout({
          xhr: this,
          url: arguments[1],
        })
      }
    }, timeout)

    var first = true, start = 0

    setTimeout(() => {
      var cacheReadyStateChange = this.onreadystatechange

      this.onreadystatechange = function () {
        if (typeof cacheReadyStateChange === 'function' && first) {
          cacheReadyStateChange.apply(this, arguments)
          var position = pendings.indexOf(this)
          if (position > -1) {
            for (var i=position; i<pendings.length-1; i++) {
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
          }
          if (!pendings.length) {
            handleNotify({
              xhr: this,
              url: arguments[1],
              status: 'loading',
            })
          }
        }
        start = Date.now()
        if (this.readyState === 4) {
          var isLoaded = true
          for (var i=0; i<loads.length; i++) {
            if (loads[i].readyState !== 4) {
              isLoaded = false
              break;
            }
          }
          if (isLoaded && !pendings.length) {
            handleNotify({
              xhr: this,
              url: arguments[1],
              status: 'loaded',
            })
            loads = []
            pendings = []
          }
        }
      }
    }, 0)
  }
}

export default cacheRequestError
