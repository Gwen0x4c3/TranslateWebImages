const crypto = require('crypto')
import axios from 'axios'
function log(text, ...obj) {
  console.log('%c' + text, 'color:rgb(240, 210, 0);font-weight:bold;font-size:15px;background:rgb(0, 0, 100)')
  if (obj && obj.length != 0) {
    console.log('%c↓↓↓↓ 输出对象 ↓↓↓↓', 'color:blue;font-weight:bold')
    for (let o of obj)
      console.log(o)
    console.log('%c↑↑↑↑ 输出结束 ↑↑↑↑', 'color:blue;font-weight:bold')
  }
}

class BaiduTranslator {
  constructor() {
    this.headers = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-CN,zh;q=0.9,ja;q=0.8",
      "Connection": "keep-alive",
      "Cache-Control": "max-age=0",
      "Host": "fanyi.baidu.com",
      "Origin": 'https://www.baidu.com/',
      "Referer": 'https://www.baidu.com/',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'X-Requested-With': '"XMLHttpRequest"'
    }
    this.langDict = {
      'ch': 'zh',
      'en': 'en',
      'japan': 'jp',
      'korean': 'kor',
      'auto': 'auto'
    }
    this.initTranslator()
  }

  initTranslator() {
    if (this.lock) {
      log('正在初始化中...')
    }
    this.lock = true
    log('初始化百度翻译器')
    // 先获取Cookie
    axios.get('https://fanyi.baidu.com/translate', {
      headers: {
        'Set-Headers': JSON.stringify(this.headers)
      }
    }).then(res => {
      if (res.headers['content-type'].startsWith('application')) { // 未附带Cookie信息
        $msg.error('百度翻译器初始化失败')
        return
      }
      this.headers.Cookie = res.headers['content-type']
      axios.get('https://fanyi.baidu.com/translate', {
        headers: {
          'Set-Headers': JSON.stringify(this.headers)
        }
      }).then(res => {
        let reg = /token: '(.*)'/g
        this.token = reg.exec(res.data)[1]
        log('成功初始化' + this.token)
        // delete this.headers.Cookie
        this.lock = false
      }).catch(err => {
        console.error(err)
        this.lock = false
      })
    }).catch(err => {
      console.error(err)
      this.lock = false
    })
  }

  translate(str, from, to, callback) {
    from = this.langDict[from]
    to = this.langDict[to]
    let url = `https://fanyi.baidu.com/v2transapi?from=${from}&to=${to}`
    let data = {
      "from": from,
      "to": to,
      "query": str,
      "simple_means_flag": "3",
      "transtype": "realtime",
      "sign": get_sign(str),
      "token": this.token,
      "domain": "common",
    }
    console.log('翻译')
    // var ae = new Date().getTime();
    // var a2 = `{"ua":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36","url":"https://fanyi.baidu.com/?aldtype=16047#${from}/${to}/${encodeURIComponent(str)}","platform":"Win32","clientTs":${ae},"version":"1.2.0.5"}`;
    // let baiduid = this.translateHeaders.Cookie
    // baiduid = baiduid.substring(baiduid.indexOf('=') + 1, baiduid.indexOf(';'))
    // console.log(baiduid)
    // var a2 = `{"d0":"07879200270542120289941","ua":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36","baiduid":"${baiduid}","platform":"Win32","d23":0,"hfe":"","d1":"","d420":0,"clientTs":${ae},"version":"1.2.0.5","extra":"","odkp":0,"h0":false,"hf":"","d2":0,"d78":215}`
    // console.log(a2)
    // // var a2 = `{"ua":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36","url":"https://fanyi.baidu.com/?aldtype=16047#${from}/${to}/${encodeURIComponent(str)}","platform":"Win32","clientTs":${ae},"version":"1.2.0.5"}`;
    // var a0 = "meewaagaaeoukwag";
    // var a1 = "1234567887654321";
    // // var acsToken = '1706353713970_' + ae + '\x5f' + eg(a2, a0, a1) // 1706440289956
    // var acsToken = '1706353713970_' + ae + '_' + eg(a2, a0, a1) // 1706440289956
    // console.log(acsToken)
    // this.translateHeaders['Acs-Token'] = acsToken
    axios.post(url, data, {
      headers: {
        'Set-Headers': JSON.stringify(this.headers)
      }
    }).then(res => {
      if (res.data.error) {
        $msg.error('百度翻译错误信息：' + res.data.errmsg)
        this.initTranslator()
        return
      }
      if (callback) {
        let txt = ''
        for (let t of res.data.trans_result.data) {
          txt += t.dst
        }
        console.log('/////翻译结果：' + txt)
        callback(txt)
      }
    })
  }
}

function n(t, e) {
  for (var n = 0; n < e.length - 2; n += 3) {
    var r = e.charAt(n + 2)
    ;(r = 'a' <= r ? r.charCodeAt(0) - 87 : Number(r)),
      (r = '+' === e.charAt(n + 1) ? t >>> r : t << r),
      (t = '+' === e.charAt(n) ? (t + r) & 4294967295 : t ^ r)
  }
  return t
}

var get_sign = function (t) {
  var o,
    i = t.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g)
  if (null === i) {
    var a = t.length
    a > 30 &&
    (t = ''
      .concat(t.substr(0, 10))
      .concat(t.substr(Math.floor(a / 2) - 5, 10))
      .concat(t.substr(-10, 10)))
  } else {
    for (
      var s = t.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/),
        c = 0,
        u = s.length,
        l = [];
      c < u;
      c++
    )
      '' !== s[c] &&
      l.push.apply(
        l,
        (function (t) {
          if (Array.isArray(t)) return e(t)
        })((o = s[c].split(''))) ||
        (function (t) {
          if (
            ('undefined' != typeof Symbol && null != t[Symbol.iterator]) ||
            null != t['@@iterator']
          )
            return Array.from(t)
        })(o) ||
        (function (t, n) {
          if (t) {
            if ('string' == typeof t) return e(t, n)
            var r = Object.prototype.toString.call(t).slice(8, -1)
            return (
              'Object' === r && t.constructor && (r = t.constructor.name),
                'Map' === r || 'Set' === r
                  ? Array.from(t)
                  : 'Arguments' === r ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)
                    ? e(t, n)
                    : void 0
            )
          }
        })(o) ||
        (function () {
          throw new TypeError(
            'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
          )
        })()
      ),
      c !== u - 1 && l.push(i[c])
    var d = l.length
    d > 30 &&
    (t =
      l.slice(0, 10).join('') +
      l.slice(Math.floor(d / 2) - 5, Math.floor(d / 2) + 5).join('') +
      l.slice(-10).join(''))
  }
  for (
    var p = ''
        .concat(String.fromCharCode(103))
        .concat(String.fromCharCode(116))
        .concat(String.fromCharCode(107)),
      f = ['320305', '131321201'],
      h = Number(f[0]) || 0,
      m = Number(f[1]) || 0,
      g = [],
      v = 0,
      y = 0;
    y < t.length;
    y++
  ) {
    var w = t.charCodeAt(y)
    w < 128
      ? (g[v++] = w)
      : (w < 2048
        ? (g[v++] = (w >> 6) | 192)
        : (55296 == (64512 & w) &&
        y + 1 < t.length &&
        56320 == (64512 & t.charCodeAt(y + 1))
          ? ((w = 65536 + ((1023 & w) << 10) + (1023 & t.charCodeAt(++y))),
            (g[v++] = (w >> 18) | 240),
            (g[v++] = ((w >> 12) & 63) | 128))
          : (g[v++] = (w >> 12) | 224),
          (g[v++] = ((w >> 6) & 63) | 128)),
        (g[v++] = (63 & w) | 128))
  }
  for (
    var b = h,
      x =
        ''
          .concat(String.fromCharCode(43))
          .concat(String.fromCharCode(45))
          .concat(String.fromCharCode(97)) +
        ''
          .concat(String.fromCharCode(94))
          .concat(String.fromCharCode(43))
          .concat(String.fromCharCode(54)),
      k =
        ''
          .concat(String.fromCharCode(43))
          .concat(String.fromCharCode(45))
          .concat(String.fromCharCode(51)) +
        ''
          .concat(String.fromCharCode(94))
          .concat(String.fromCharCode(43))
          .concat(String.fromCharCode(98)) +
        ''
          .concat(String.fromCharCode(43))
          .concat(String.fromCharCode(45))
          .concat(String.fromCharCode(102)),
      _ = 0;
    _ < g.length;
    _++
  )
    b = n((b += g[_]), x)
  return (
    (b = n(b, k)),
    (b ^= m) < 0 && (b = 2147483648 + (2147483647 & b)),
      ''.concat((b %= 1e6).toString(), '.').concat(b ^ h)
  )
}

var a = function (c, d) {
  var e = '\x31\x2e\x32\x2e\x30';

  function f(g, h) {
    var j = g['\x6c\x65\x6e\x67\x74\x68'];
    var l = [];
    for (var m = 0x0; m < j; m++) {
      var n = h(g[m]);
      l['\x70\x75\x73\x68'](n);
    }
    return l;
  }

  var p, q, r, s, t, u = decodeURIComponent, v = '\x43\x68\x61\x72', w = '';
  var x = [a];
  p = '\x64\x65';
  q = '\x66\x72';
  r = '\x6f';
  t = q + r + '\x6d';
  s = '\x43\x6f' + p;
  var y = function (z) {
    return (z + w)['\x63\x6f\x6e\x73\x74\x72\x75\x63\x74\x6f\x72'][t + v + s](z);
  };
  var A = function (B) {
    return f(B, function (C) {
      return y(C);
    });
  };
  var D = A['\x63\x61\x6c\x6c'](y, [0x27, 0x22, 0x25, 0x60, 0x3c, 0x78, 0x61, 0x41, 0x62, 0x42, 0x63, 0x43, 0x64, 0x44, 0x65, 0x45, 0x66, 0x46, 0x67, 0x6e, 0x6d, 0x6f, 0x70, 0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39]);
  var E = f([0x706e, 0x6c36, 0x6730, 0x624f, 0x5e77], function (p) {
    return u(p);
  });
  var G = A['\x63\x61\x6c\x6c'](E, [0x5752, 0x58dd, 0x5f5f, 0x5b32, 0x56f1, 0x58a0, 0x5ef2, 0x6256, 0x5c2b, 0x63cb, 0x59c8, 0x645a, 0x56c4, 0x6b9b, 0x545a, 0x6a4a, 0x5a32, 0x7209, 0x577a, 0x72b8, 0x735c, 0x7313, 0x735a, 0x5e52, 0x5fb4, 0x66f0, 0x6b31, 0x7074, 0x72ba, 0x6c19, 0x692d, 0x62a1, 0x5f6e])
    , H = {};
  E = A(E);
  var I = new RegExp(E['\x6a\x6f\x69\x6e']('\x7c'));
  for (var p = 0x0; p < D['\x6c\x65\x6e\x67\x74\x68']; p++) {
    H[G[p]] = D[p];
  }
  d = f(d['\x73\x70\x6c\x69\x74'](w), function (K) {
    return H[K] || K;
  })['\x6a\x6f\x69\x6e'](w);
  return f(d['\x73\x70\x6c\x69\x74'](I), function (p) {
    return u(p);
  });
}(this, '\x6a\u7313\x69\u72b8\u624f\u59c8\x68\u5ef2\x72\u645a\u7313\u56c4\u545a\u6256\x74\u6730\x4d\u5ef2\x6c\u5a32\u7313\x72\u735c\u545a\u56c4\u5f5f\u66f0\u5e52\x55\x54\u7209\x2d\u62a1\u5f5f\u66f0\u5e52\u56c4\u5ef2\x74\u5ef2\u6730\x5f\u56c4\u5ef2\x74\u5ef2\u624f\x5f\u72b8\u6b9b\u5ef2\x74\u5ef2\u63cb\x79\x74\u545a\x73\u706e\x73\x74\x72\x69\u72b8\u577a\u624f\u735a\u5ef2\x72\x73\u545a\u624f\u59c8\u7313\u72b8\u59c8\u5ef2\x74\u6730\u5c2b\x6c\u7313\u59c8\x6b\x53\x69\x7a\u545a\u6730\u59c8\u545a\x69\x6c\u6c36\u735c\x69\u72b8\u6c36\x5f\u56c4\u7313\x50\x72\u7313\u59c8\u545a\x73\x73\u63cb\x6c\u7313\u59c8\x6b\u6c36\u5a32\u7313\x72\u735c\u5ef2\x74\x74\u545a\x72\u6730\u59c8\x68\u5ef2\x72\u6256\x74\u5e77\x5f\u735c\u5ef2\u735a\u5e77\x5f\x72\u545a\x76\u545a\x72\x73\u545a\x4d\u5ef2\u735a\u706e\x69\u72b8\u56c4\u545a\u58a0\x4f\u5a32\u624f\u6256\u63cb\u645a\u6b9b\u6a4a\u7209\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\u5ef2\u5c2b\u59c8\u56c4\u545a\u5a32\u577a\x68\x69\x6a\x6b\x6c\u735c\u72b8\u7313\u735a\x71\x72\x73\x74\x75\x76\x77\u58a0\x79\x7a\u5e52\u5fb4\u66f0\u6b31\u7074\u72ba\u6c19\u692d\u62a1\u5f6e\u5f5f\u66f0\u63cb\u5f5f\u66f0\u7209\u5f5f\u6b31\u6b9b\u624f\u59c8\x69\u735a\x68\u545a\x72\x74\u545a\u58a0\x74\u624f\x73\u735a\x6c\x69\u59c8\u545a\u6c36\u59c8\u5a32\u577a\u624f\u59c8\x72\u545a\u5ef2\x74\u545a\u6a4a\u72b8\u59c8\x72\x79\u735a\x74\u7313\x72\u6730\u5a32\x69\u72b8\u5ef2\x6c\x69\x7a\u545a\u6730\u735a\u5ef2\u56c4\u56c4\x69\u72b8\u577a\u624f\x5f\u735a\u5ef2\x72\x73\u545a\u6c36\u5a32\u7313\x72\u735c\u5ef2\x74\u6c36\u59c8\x72\u545a\u5ef2\x74\u545a\u6b9b\u545a\u59c8\x72\x79\u735a\x74\u7313\x72\u6730\x5f\u6a4a\x4e\u645a\x5f\x58\u7209\x4f\x52\x4d\x5f\x4d\x4f\u6b9b\u6a4a\u5e77\x5f\u58a0\u5a32\u7313\x72\u735c\x4d\u7313\u56c4\u545a\u706e\x5f\x6b\u545a\x79\u706e\x72\u545a\x73\u545a\x74\u5e77\x5f\u56c4\u7313\x52\u545a\x73\u545a\x74\u6730\x5f\u56c4\u7313\u7209\x69\u72b8\u5ef2\x6c\x69\x7a\u545a\u5e77\u545a\u72b8\u59c8\x72\x79\u735a\x74\u706e\u56c4\u545a\u59c8\x72\x79\u735a\x74\u6730\u6a4a\u72b8\u59c8\x72\x79\u735a\x74\u7313\x72\u6730\x5f\u59c8\x69\u735a\x68\u545a\x72\u706e\x5f\x69\x76\u624f\u545a\u72b8\u59c8\x72\x79\u735a\x74\u63cb\x6c\u7313\u59c8\x6b\u5e77\u6b9b\u545a\u59c8\x72\x79\u735a\x74\u7313\x72\u706e\u56c4\u545a\u59c8\x72\x79\u735a\x74\u63cb\x6c\u7313\u59c8\x6b\u5e77\x5f\u735a\x72\u545a\x76\u63cb\x6c\u7313\u59c8\x6b\u624f\x5f\u735c\x69\u72b8\u63cb\x75\u5a32\u5a32\u545a\x72\x53\x69\x7a\u545a\u6730\x5f\u735c\u7313\u56c4\u545a\u5e77\x5f\x5f\u59c8\x72\u545a\u5ef2\x74\u7313\x72\u5e77\u735a\x72\u7313\u59c8\u545a\x73\x73\u63cb\x6c\u7313\u59c8\x6b\u624f\u735a\u5ef2\u56c4\u6730\x5f\u735a\x72\u7313\u59c8\u545a\x73\x73\u6c36\x75\u72b8\u735a\u5ef2\u56c4\u6730\x5f\u7313\x4b\u545a\x79\u6c36\x5f\x69\x4b\u545a\x79\u706e\x5f\x68\u5ef2\x73\x68\u545a\x72\u6c36\x75\u735a\u56c4\u5ef2\x74\u545a\u6c36\x5f\u5ef2\u735a\u735a\u545a\u72b8\u56c4\u6c36\x5f\x6b\u545a\x79\x50\x72\x69\u7313\x72\x52\u545a\x73\u545a\x74\u706e\x5f\u72b8\x52\u7313\x75\u72b8\u56c4\x73\u6730\x5f\x69\u72b8\x76\x4b\u545a\x79\x53\u59c8\x68\u545a\u56c4\x75\x6c\u545a\u624f\x5f\u56c4\u7313\u645a\x72\x79\u735a\x74\u63cb\x6c\u7313\u59c8\x6b\u706e\x5f\u59c8\x72\u545a\u5ef2\x74\u545a\x48\u545a\x6c\u735a\u545a\x72\u624f\u7313\u5c2b\x6a\u545a\u59c8\x74\u6c36\u545a\x76\u545a\u72b8\x74\x4d\u5ef2\u735a\u706e\u5ef2\u545a\x73\x5f\u545a\u72b8\u59c8\x72\x79\u735a\x74\u706e\u5ef2\u545a\x73\x5f\u56c4\u545a\u59c8\x72\x79\u735a\x74\u706e\u545a\u735c\x69\x74\u706e\u5a32\x69\u56c4\u6730\u577a\u545a\x74\u624f\x71\x75\u545a\x75\u545a\u6c36\x76\u5ef2\x6c\x75\u545a\u6c36\u5c2b\u545a\u5a32\u7313\x72\u545a\x53\u545a\x74\u6730\u5a32\x75\u72b8\u59c8\x74\x69\u7313\u72b8\u624f\x73\x74\u5ef2\x74\x75\x73\u706e\u5ef2\u5a32\x74\u545a\x72\x53\u545a\x74\u5e77\x73\u545a\x74\x4d\x75\x6c\x74\u6c36\x73\u545a\x74\x4d\x75\x6c\x74\u5f5f\u66f0\u5e52\u59c8\u5ef2\x6c\x6c\u5c2b\u5ef2\u59c8\x6b\u5f5f\u66f0\u5e52\u5ef2\x72\u577a\x75\u735c\u545a\u72b8\x74\x73\u5f5f\u66f0\u5e52\u59c8\u7313\x75\u72b8\x74\u5f5f\u66f0\u5e52\u735c\x75\x73\x74\u5f5f\u66f0\u5e52\u545a\x71\u5f5f\u66f0\u5e52\x73\u545a\x74\u5f5f\u66f0\u5e52\u5a32\x69\u545a\x6c\u56c4\u5f5f\u66f0\u5e52\u59c8\u7313\x75\u72b8\x74\x2e\u6730\x73\u545a\x74\u624f\x73\u545a\x74\u5f5f\u66f0\u5e52\u735c\x75\x6c\x74\u5f5f\u66f0\u5e52\u5a32\x69\u545a\x6c\u56c4\u5f5f\u66f0\u5e52\u5ef2\u5c2b\u72b8\u7313\x72\u735c\u5ef2\x6c\u624f\x4e\u5ef2\x4e\u6730\u5a32\x69\u545a\x6c\u56c4\u5f5f\u66f0\u5e52\u5e77\u5f5f\u66f0\u5e52\x73\x74\u5ef2\x74\x75\x73\u5f5f\u66f0\u5e52\u5ef2\u5c2b\u72b8\u7313\x72\u735c\u5ef2\x6c\u6730\u577a\u545a\x74\u5f5f\u66f0\u5e52\u735c\x75\x6c\x74\x69\u735a\x6c\u545a\u5f5f\u66f0\u5e52\u5a32\x69\u545a\x6c\u56c4\u5f5f\u66f0\u5e52\u5a32\x75\u72b8\u59c8\x74\x69\u7313\u72b8\u5f5f\u66f0\u5e52\u5ef2\x72\u577a\x75\u735c\u545a\u72b8\x74\x73\u5f5f\u66f0\u5e52\x6c\u545a\u72b8\u577a\x74\x68\u5f5f\u66f0\u5e52\u735c\x75\x73\x74\u5f5f\u66f0\u5e52\u577a\x74\u5f5f\u66f0\u5e52\u5fb4\u6c36\u577a\u545a\x74\x4d\x75\x6c\x74\u624f\u577a\u545a\x74\x4f\u5c2b\x6a\u545a\u59c8\x74\u706e\u5c2b\u545a\u5a32\u7313\x72\u545a\u645a\u7313\u735c\u735a\u545a\x6c\u545a\u6730\u5a32\x69\u545a\x6c\u56c4\x48\u7313\u7313\x6b\u624f\x68\u5a32\u545a\u624f\u59c8\x6c\x69\u545a\u72b8\x74\x54\x73\u624f\u735a\x6c\u5ef2\x74\u5a32\u7313\x72\u735c\u706e\x76\u545a\x72\x73\x69\u7313\u72b8\u706e\u545a\u58a0\x74\x72\u5ef2\x54\u7313\u7313\x4c\u7313\u72b8\u577a\u624f\u545a\u58a0\x74\x72\u5ef2\u5e77\u63cb\u6256\x49\u6b9b\x55\x49\u6b9b\u706e\x28\u5f5f\u72ba\u6a4a\u5f5f\u692d\u645a\u5f5f\u66f0\u5e52\x29\u624f\u5f5f\u6b31\u6b9b\x28\u5f5f\u72ba\u63cb\u5f5f\u72ba\u6a4a\u5f5f\u6b31\u63cb\u5f5f\u72ba\u6b9b\x2a\x29\x28\u5f5f\u6b31\u63cb\u5f5f\u692d\u645a\u5f5f\u66f0\u7074\x29\u5e77\u59c8\u7313\u7313\x6b\x69\u545a\u6730\x55\x52\x4c\u706e\x68\x72\u545a\u5a32\u5e77\x75\x72\x6c\u706e\x49\u72b8\x69\x74\u545a\u56c4\u5e77\u63cb\u545a\u5a32\u7313\x72\u545a\u645a\u7313\u735c\u735a\x6c\u545a\x74\u545a\u6730\u645a\u7313\u735c\u735a\x6c\u545a\x74\u545a\u56c4\u6c36\u5fb4\x2e\u5e52\x2e\u5e52\x2e\u72ba\u5e77\u5f5f\u66f0\u7074\u63cb\x53\u63cb\x5f\u66f0\u5e52\u6c19\u5e52\u6730\u5fb4\u66f0\u6b31\u7074\u72ba\u6c19\u692d\u62a1\u62a1\u692d\u6c19\u72ba\u7074\u6b31\u66f0\u5fb4\u6730\u56c4\u7313\u59c8\x75\u735c\u545a\u72b8\x74\u624f\x6c\u7313\u59c8\u5ef2\x74\x69\u7313\u72b8\u5e77\u72b8\u5ef2\x76\x69\u577a\u5ef2\x74\u7313\x72\u706e\u59c8\x72\u545a\u5ef2\x74\u545a\u6c36\u735a\x72\u7313\x74\u7313\x74\x79\u735a\u545a\u624f\x68\u5ef2\x73\x4f\x77\u72b8\x50\x72\u7313\u735a\u545a\x72\x74\x79\u6730\x69\u72b8\x69\x74\u624f\u5f5f\u66f0\u7074\x73\x75\u735a\u545a\x72\u624f\u5ef2\u735a\u735a\x6c\x79\u706e\x74\u7313\x53\x74\x72\x69\u72b8\u577a\u706e\u545a\u58a0\x74\u545a\u72b8\u56c4\u6c36\x77\u7313\x72\u56c4\x73\u5e77\x73\x69\u577a\u63cb\x79\x74\u545a\x73\u706e\x6c\u545a\u72b8\u577a\x74\x68\u706e\x73\x74\x72\x69\u72b8\u577a\x69\u5a32\x79\u6c36\x74\u7313\x53\x74\x72\x69\u72b8\u577a\x28\x29\u5f5f\u66f0\u5e52\u735c\x75\x73\x74\u5f5f\u66f0\u5e52\u735a\x72\u7313\x76\x69\u56c4\u545a\x72\u5f5f\u66f0\u5e52\u5f5f\u6c19\u5e52\u545a\u72b8\u59c8\u7313\u56c4\u545a\x72\u5f5f\u6c19\u5e52\u706e\u59c8\x6c\u5ef2\u735c\u735a\u624f\u59c8\x6c\u7313\u72b8\u545a\u706e\u59c8\u5ef2\x6c\x6c\u6c36\x73\x6c\x69\u59c8\u545a\u6c36\x72\u5ef2\u72b8\u56c4\u7313\u735c\u6c36\u735a\x75\x73\x68\u5e77\u5a32\x72\u7313\u735c\u645a\x68\u5ef2\x72\u645a\u7313\u56c4\u545a');
(function (e, f) {
  var g = function (h) {
    while (--h) {
      e['push'](e['shift']());
    }
  };
  g(++f);
}(a, 0x162));

function useMessage() {
  function n(n) {
    for (var o = 10, e = 0; e < f.length; e++) {
      var t = f[e];
      if (n && n === t) break;
      o += t.clientHeight + 20
    }
    return o
  }

  function o(o) {
    for (var e = 0; e < f.length; e++) {
      if (f[e] === o) {
        f.splice(e, 1);
        break
      }
    }
    o.classList.add(a.hide), f.forEach(function (o) {
      o.style.top = n(o) + "px"
    })
  }

  function e(e) {
    function i() {
      p.removeEventListener("animationend", i), setTimeout(o, x || t.duration || 3e3, p)
    }

    function s() {
      "0" === getComputedStyle(p).opacity && (p.removeEventListener("transitionend", s), p.remove())
    }

    var d = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "info", x = arguments[2],
      p = r.createElement("div");
    p.className = a.box + " " + d, p.style.top = n() + "px", p.style.zIndex = c, p.innerHTML = '\n    <span class="' + a.icon + '"></span>\n    <span class="' + a.text + '">' + e + "</span>\n    ", c++, f.push(p), r.body.appendChild(p), p.addEventListener("animationend", i), p.addEventListener("transitionend", s)
  }

  var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}, r = document,
    i = "__" + Math.random().toString(36).slice(2, 7),
    a = {box: "msg-box" + i, hide: "hide" + i, text: "msg-text" + i, icon: "msg-icon" + i},
    s = r.createElement("style");
  s.textContent = ("\n  ." + a.box + ", ." + a.icon + ", ." + a.text + " {\n    padding: 0;\n    margin: 0;\n    box-sizing: border-box;\n  }\n  ." + a.box + " {\n    position: fixed;\n    top: 0;\n    left: 50%;\n    display: flex;\n    padding: 12px 16px;\n    border-radius: 2px;\n    background-color: #fff;\n    box-shadow: 0 3px 3px -2px rgba(0,0,0,.2),0 3px 4px 0 rgba(0,0,0,.14),0 1px 8px 0 rgba(0,0,0,.12);\n    white-space: nowrap;\n    animation: " + a.box + "-move .4s;\n    transition: .4s all;\n    transform: translate3d(-50%, 0%, 0);\n    opacity: 1;\n    overflow: hidden;\n  }\n  ." + a.box + '::after {\n    content: "";\n    position: absolute;\n    left: 0;\n    top: 0;\n    height: 100%;\n    width: 4px;\n  }\n  @keyframes ' + a.box + "-move {\n    0% {\n      opacity: 0;\n      transform: translate3d(-50%, -100%, 0);\n    }\n    100% {\n      opacity: 1;\n      transform: translate3d(-50%, 0%, 0);\n    }\n  }\n  ." + a.box + "." + a.hide + " {\n    opacity: 0;\n    /* transform: translate3d(-50%, -100%, 0); */\n    transform: translate3d(-50%, -100%, 0) scale(0);\n  }\n  ." + a.icon + " {\n    display: inline-block;\n    width: 18px;\n    height: 18px;\n    border-radius: 50%;\n    overflow: hidden;\n    margin-right: 6px;\n    position: relative;\n  }\n  ." + a.text + " {\n    font-size: 14px;\n    line-height: 18px;\n    color: #555;\n  }\n  ." + a.icon + "::after,\n  ." + a.icon + '::before {\n    position: absolute;\n    content: "";\n    background-color: #fff;\n  }\n  .' + a.box + ".info ." + a.icon + ", ." + a.box + ".info::after {\n    background-color: #1890ff;\n  }\n  ." + a.box + ".success ." + a.icon + ", ." + a.box + ".success::after {\n    background-color: #52c41a;\n  }\n  ." + a.box + ".warning ." + a.icon + ", ." + a.box + ".warning::after {\n    background-color: #faad14;\n  }\n  ." + a.box + ".error ." + a.icon + ", ." + a.box + ".error::after {\n    background-color: #ff4d4f;\n  }\n  ." + a.box + ".info ." + a.icon + "::after,\n  ." + a.box + ".warning ." + a.icon + "::after {\n    top: 15%;\n    left: 50%;\n    margin-left: -1px;\n    width: 2px;\n    height: 2px;\n    border-radius: 50%;\n  }\n  ." + a.box + ".info ." + a.icon + "::before,\n  ." + a.box + ".warning ." + a.icon + "::before {\n    top: calc(15% + 4px);\n    left: 50%;\n    margin-left: -1px;\n    width: 2px;\n    height: 40%;\n  }\n  ." + a.box + ".error ." + a.icon + "::after, \n  ." + a.box + ".error ." + a.icon + "::before {\n    top: 20%;\n    left: 50%;\n    width: 2px;\n    height: 60%;\n    margin-left: -1px;\n    border-radius: 1px;\n  }\n  ." + a.box + ".error ." + a.icon + "::after {\n    transform: rotate(-45deg);\n  }\n  ." + a.box + ".error ." + a.icon + "::before {\n    transform: rotate(45deg);\n  }\n  ." + a.box + ".success ." + a.icon + "::after {\n    box-sizing: content-box;\n    background-color: transparent;\n    border: 2px solid #fff;\n    border-left: 0;\n    border-top: 0;\n    height: 50%;\n    left: 35%;\n    top: 13%;\n    transform: rotate(45deg);\n    width: 20%;\n    transform-origin: center;\n  }\n  ").replace(/(\n|\t|\s)*/gi, "$1").replace(/\n|\t|\s(\{|\}|\,|\:|\;)/gi, "$1").replace(/(\{|\}|\,|\:|\;)\s/gi, "$1"), r.head.appendChild(s);
  var c = t.zIndex || 1e4, f = [];
  return {
    show: e, info: function (n) {
      e(n, "info")
    }, success: function (n) {
      e(n, "success")
    }, warning: function (n) {
      e(n, "warning")
    }, error: function (n) {
      e(n, "error")
    }
  }
}

const $msg = useMessage();

export default BaiduTranslator
