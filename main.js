var pendings = [], loads = [], loading = false

function cacheRequestError (config) {
  config = config || {}

  var timeout = config.timeout || 1000
  var pendingTimeout = config.pendingTimeout || timeout
  var loadingTimeout = config.loadingTimeout || timeout
  var onRequestTimeout = config.onRequestTimeout || function () {}
  var onRequestWorking = config.onRequestWorking || function () {}

  var cacheOpen = XMLHttpRequest.prototype.open

  XMLHttpRequest.prototype.open = function () {
    cacheOpen.apply(this, arguments)

    var url = arguments[1]

    setTimeout(() => {
      if (this.readyState === 1) {
        this.pending = true
        pendings.push(this)
        onRequestWorking({
          xhr: this,
          url: url,
          status: 'pending',
        })
      }
      if (this.readyState !== 4) {
        onRequestTimeout({
          xhr: this,
          url: url,
        })
      }
    }, pendingTimeout)

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
        if (this.readyState !== 4 && Date.now() - start > loadingTimeout) {
          if (loads.indexOf(this) < 0) {
            loads.push(this)
          }
          if (!pendings.length && !loading) {
            loading = true
            onRequestWorking({
              xhr: this,
              url: url,
              status: 'loading',
            })
          }
        }
        start = Date.now()
        if (this.readyState === 4 && loads.length) {
          var isLoaded = true
          for (var i=0; i<loads.length; i++) {
            if (loads[i].readyState !== 4) {
              isLoaded = false
              break;
            }
          }
          if (isLoaded && !pendings.length) {
            onRequestWorking({
              xhr: this,
              url: url,
              status: 'loaded',
            })
            loads = []
            pendings = []
            loading = false
          }
        }
      }
    }, 0)
  }
}

export default cacheRequestError
