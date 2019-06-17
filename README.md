# request catcher

![npm](https://img.shields.io/npm/v/request-catcher.svg) ![NPM](https://img.shields.io/npm/l/request-catcher.svg)

> This is the ajax request catcher, and confirm some info or do some thing.

## Install

```
npm i -S request-catcher
```

## Simple to use

```
import rc from 'request-catcher'

rc({
  pendinghandler () {
    // do something
  },
  loadinghandler () {
    // do something
  },
})

```

## configure

- useNotify: If use default notify.
- timeout: default is 1000ms.
- wrapperClassName: Outer container's classname, if use it the style attribute will be invalid.
- msgClassName: Message container's classname, the same as wrapperClassName.
- pendingMsg: default is 'connecting...'.
- loadingMsg: default is 'downloading...'.
- hook: pendinghandler(readyState) -> if time greater than timeout callback will be do something on pending.
- hook: loadinghandler -> callback do some thing on loading.
