import hotReload from '@/utils/hotReload'

hotReload()
console.log('this is background main.js')

chrome.storage.sync.get('config', items => {
  if (items.config == null) {
    console.log('使用默认值')
    const config = {
      enabled: false,
      from: 'en',
      to: 'ch',
      provider: 'youdao',
      rectangle: {
        x: 100,
        y: 0,
        w: 200,
        h: 200
      },
      method: 0,
      keys: {
        translateKey: 'Q',
        clearKey: 'X' // 清除屏幕上的文本
      }
    }
    chrome.storage.sync.set({
      "config": config
    })
  }
});

const DEBUG = true

if (!DEBUG) {
  console.log = function () {
  }
}

function headers2Map(headers) {
  let headerMap = {}
  for (let i = 0; i < headers.length; i++) {
    let header = headers[i]
    headerMap[header.name] = {index: i, value: header.value}
  }
  return headerMap
}

function addOrReplace(headerMap, headers, k, v) {
  const lk = k.toLowerCase()
  if (headerMap[k]) {
    headers[headerMap[k].index] = {name: k, value: v}
  } else if (headerMap[lk]) {
    headers[headerMap[lk].index] = {name: lk, value: v}
  } else {
    headers.push({name: k, value: v})
  }
}

function getHeaderValue(headerMap, k) {
  return headerMap[k] || headerMap[k.toLowerCase()]
}

function removeHeaderValue(headerMap, headers, k) {
  const lk = k.toLowerCase()
  if (headerMap[k]) {
    headers.splice(headerMap[k].index, 1)
  } else if (headerMap[lk]) {
    headers.splice(headerMap[lk].index, 1)
  }
}

const local = {
  data: {},
  get(key) {
    return this.data[key];
  },
  set(key, value) {
    this.data[key] = value;
  },
  remove(key) {
    delete this.data[key];
  },
};

const localPrefix = 'webrequest:'

function setLocal(requestId, value) {
  local.set(localPrefix + requestId, value)
}

function getAndRemoveLocal(requestId) {
  let value = local.get(localPrefix + requestId)
  local.remove(localPrefix + requestId)
  return value
}

const blockUrls = ["dict.youdao.com", "fanyi.baidu.com", "ifanyi.iciba.com"]

chrome.webRequest.onBeforeSendHeaders.addListener(
  function (details) {
    // 检查是否需要拦截
    let block = false
    for (let url of blockUrls) {
      if (details.url.indexOf(url) != -1) {
        block = true
        break
      }
    }
    if (!block) { // 无需拦截
      return
    }
    console.log('---request', details.url, details)
    let headers = details.requestHeaders
    let headerMap = headers2Map(headers)
    if (details.method == 'OPTIONS') { // 发出OPTIONS检查跨域
      // 将附带的标头记录
      let requestHeaders = getHeaderValue(headerMap, 'Access-Control-Request-Headers')
      addOrReplace(headerMap, headers, 'Origin', details.url)
      addOrReplace(headerMap, headers, 'Referer', details.url)
      if (requestHeaders) {
        console.log('options附带', requestHeaders.value)
        setLocal(details.requestId, requestHeaders.value)
      }
    }
    // 没有SetHeaders，放行
    if (!headerMap['Set-Headers']) {
      return {requestHeaders: details.requestHeaders};
    }
    let setHeaders = JSON.parse(headerMap['Set-Headers'].value)
    Object.keys(setHeaders).forEach(k => {
      addOrReplace(headerMap, headers, k, setHeaders[k])
    })
    removeHeaderValue(headerMap, headers, 'Set-Headers')
    console.log('修改后：', headers)
    return {requestHeaders: details.requestHeaders};
  },
  {urls: ['<all_urls>']},
  ['blocking', 'requestHeaders', 'extraHeaders']
);

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    // 检查是否需要拦截
    let block = false
    for (let url of blockUrls) {
      if (details.url.indexOf(url) != -1) {
        block = true
        break
      }
    }
    if (!block) { // 无需拦截
      return
    }
    console.log('+++response+++', details.type, details)
    let headers = details.responseHeaders
    let initiator = details.initiator
    let headerMap = headers2Map(headers)
    let exOrigin = getHeaderValue(headerMap, 'Access-Control-Allow-Origin')
    let allowHeaders = null
    if (details.method == 'OPTIONS') {
      allowHeaders = getAndRemoveLocal(details.requestId)
    }
    if (initiator && !initiator.startsWith(exOrigin) && exOrigin != '*') {
      let setHeaders = {
        // 'Access-Control-Allow-Origin': (initiator && initiator.indexOf('http://localhost') == -1) ? initiator : '*',
        'Access-Control-Allow-Origin': initiator ? initiator : '*',
        'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS, DELETE, PUT, PATCH',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': allowHeaders ? allowHeaders : '*'
      }
      Object.keys(setHeaders).forEach(k => {
        addOrReplace(headerMap, headers, k, setHeaders[k])
      })
    }
    // 百度翻译 检查是否有Set-Cookie
    if (details.url == 'https://fanyi.baidu.com/translate') {
      if (getHeaderValue(headerMap, 'Set-Cookie') != null) {
        let cookie = ''
        for (let header of headers) {
          if (header.name == 'Set-Cookie') {
            cookie += header.value.substring(0, header.value.indexOf(';') + 1)
          }
        }
        console.log('发现Set-Cookie，得到Cookie：' + cookie)
        addOrReplace(headerMap, headers, 'Content-Type', cookie)
      }
    }


    console.log('+++after response ', headers)
    return {responseHeaders: details.responseHeaders};
  },
  {urls: ['<all_urls>']},
  ['blocking', 'responseHeaders', 'extraHeaders']
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('onMessage', request, sender)
  if (request.action === 'captureScreenshot') {
    // 截图
    chrome.tabs.captureVisibleTab(window.id, {format: 'png'}, function (dataUrl) {
      sendResponse({dataUrl: dataUrl});
    });
    // 返回true 异步发送响应
    return true;
  } else if (request.action === 'syncConfig') {
    // 给所有页面发送配置进行同步
    chrome.tabs.query({}, tabs => {
      for (let tab of tabs) {
        if (sender.tab.id != tab.id) {
          // console.log('发送消息给', tab)
          chrome.tabs.sendMessage(tab.id, {action: 'updateConfig', data: request.data});
        }
      }
    });
  }
});
