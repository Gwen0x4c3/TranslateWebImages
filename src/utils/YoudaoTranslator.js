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

/**
 * 通用的Translator结构包括constructor、initTranslator、translate三个基本方法
 * langDict为系统整体通用的表示语言的符号与该翻译器语言符号转换的Map
 * 其余细节内部实现
 */
class YoudaoTranslator {
    constructor() { // 构造函数
        this.headers = {
            "Host": "dict.youdao.com",
            "Referer": "https://fanyi.youdao.com",
            "Origin": "https://fanyi.youdao.com",
            "X-Requested-With": "XMLHttpRequest",
            "sec-ch-ua": '"Not?A_Brand";v="8", "Chromium";v="108", "Microsoft Edge";v="108"',
            "sec-ch-ua-mobile": "?0",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
            "Connection": "keep-alive",
            "Cookie": `OUTFOX_SEARCH_USER_ID_NCOO=1427503526.${randomInt(100000, 888888)}; OUTFOX_SEARCH_USER_ID=-815683116@${randomInt(20, 100)}.${randomInt(20, 100)}.123.112`
        }
        this.langDict = {
            'ch': 'zh-CHS',
            'en': 'en',
            'japan': 'ja',
            'korean': 'ko',
            'auto': 'auto'
        }
        this.key = null
        this.aesKey = null
        this.aesIv = null
        this.initTranslator()
    }

    md5(e) {
        return crypto.createHash("md5").update(e).digest();
    }

    md5Hex(e) {
        return crypto.createHash("md5").update(e.toString()).digest("hex");
    }

    getYoudaoSign(t, k) {
        return this.md5Hex(`client=fanyideskweb&mysticTime=${t}&product=webfanyi&key=${k}`)
    }

    initTranslator() {
        log('初始化有道翻译器')
        let params = this.getEncodedParams("asdjnjfenknafdfsdfsd")
        axios.get('https://dict.youdao.com/webtranslate/key', {
            params: params,
            headers: {
                "Set-Headers": JSON.stringify(this.headers)
            }
        }).then(res => {
            res = res.data
            this.key = res.data.secretKey
            this.aesKey = res.data.aesKey
            this.aesIv = res.data.aesIv
            log('成功初始化', res)
        })
    }

    getEncodedParams(k) {
        let t = new Date().getTime()
        let params = {
            'keyid': 'webfanyi-key-getter',
            'sign': this.getYoudaoSign(t, k),
            'client': 'fanyideskweb',
            'product': 'webfanyi',
            'appVersion': '1.0.0',
            'vendor': 'web',
            'pointParam': 'client,mysticTime,product',
            'mysticTime': t + '',
            'keyfrom': 'fanyi.web'
        }
        return params
    }

    translate(str, from, to, callback) {
        let params = this.getEncodedParams(this.key)
        params.i = str
        params.from = this.langDict[from]
        params.to = this.langDict[to]
        params.dictResult = true
        params.keyid = "webfanyi"
        axios.post('https://dict.youdao.com/webtranslate', params, {
            headers: {
                'Set-Headers': JSON.stringify(this.headers),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then(res => {
            if (callback) {
                res = this.decrypt(res.data)
                res = JSON.parse(res)
                let txt = ''
                for (let p of res.translateResult) {
                  for (let phrase of p) {
                    txt += phrase.tgt
                  }
                }
                console.log('/////翻译结果：' + txt)
                callback(txt)
            }
        })
    }

    decrypt(t) {
        const a = Buffer.alloc(16, this.md5(this.aesKey))
            , r = Buffer.alloc(16, this.md5(this.aesIv))
            , i = crypto.createDecipheriv("aes-128-cbc", a, r);
        let s = i.update(t, "base64", "utf-8");
        return s += i.final("utf-8"), s
    }
}

function randomInt(low, high) {
  const range = high - low + 1;
  const random = Math.floor(Math.random() * range);
  return low + random;
}

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

export default YoudaoTranslator
