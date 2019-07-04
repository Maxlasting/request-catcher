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

    var xhr = this

    var url = arguments[1]

    setTimeout(function () {
      if (xhr.readyState === 1) {
        pendings.push(xhr)
        onRequestWorking({
          xhr: xhr,
          url: url,
          status: 'pending',
        })
      }
      if (xhr.readyState !== 4) {
        onRequestTimeout({
          xhr: xhr,
          url: url,
        })
      }
    }, pendingTimeout)

    var first = true, start = 0

    setTimeout(function () {
      var cacheReadyStateChange = xhr.onreadystatechange

      xhr.onreadystatechange = function () {
        if (typeof cacheReadyStateChange === 'function' && first) {
          cacheReadyStateChange.apply(xhr, arguments)
          var position = pendings.indexOf(xhr)
          if (position > -1) {
            for (var i=position; i<pendings.length-1; i++) {
              pendings[i] = pendings[i+1]
            }
            pendings.pop()
          }
          first = false
          start = Date.now()
        }
        if (xhr.readyState !== 4 && Date.now() - start > loadingTimeout) {
          if (loads.indexOf(xhr) < 0) {
            loads.push(xhr)
          }
          if (!pendings.length && !loading) {
            loading = true
            onRequestWorking({
              xhr: xhr,
              url: url,
              status: 'loading',
            })
          }
        }
        start = Date.now()
        if (xhr.readyState === 4) {
          var isLoaded = true
          for (var i=0; i<loads.length; i++) {
            if (loads[i].readyState !== 4) {
              isLoaded = false
              break;
            }
          }
          if (isLoaded && !pendings.length) {
            onRequestWorking({
              xhr: xhr,
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
