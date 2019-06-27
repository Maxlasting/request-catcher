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
  timeout: 1000,
  handleNotify ({ xhr, url, status }) {
    if (status === 'pending') {

    } else if (status === 'loading') {

    } else if (status === 'loaded') {

    }
  },
  handleTimeout ({ xhr, url }) {
    // do something
  },
})

```

## configure

- timeout: default is 1000ms.
- hook: handleNotify({ xhr, url, status }) -> if time greater than timeout callback will be do something on pending/loading/loaded.
- hook: handleTimeout({ xhr, url }) -> callback do some thing on timeout.
