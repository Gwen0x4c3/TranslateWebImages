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

class ICiBaTranslator {
  constructor() { // 构造函数
    this.headers = {
      "Host": "ifanyi.iciba.com",
      "Referer": "https://www.iciba.com",
      "Origin": "https://www.iciba.com",
      "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "sec-ch-ua-mobile": "?0",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-site",
      "Connection": "keep-alive"
    }
    this.langDict = {
      'ch': 'zh',
      'en': 'en',
      'japan': 'ja',
      'korean': 'ko',
      'auto': 'auto'
    }
    this.initTranslator()
  }

  initTranslator() {
    log('初始化爱词霸翻译')
  }

  translate(str, from, to, callback) {
    console.log('翻译', arguments)
    from = this.langDict[from]
    to = this.langDict[to]
    let data = {
      from, to,
      q: str
    }
    const sign = this.getSign(data.q)
    const url = `https://ifanyi.iciba.com/index.php?c=trans&m=fy&client=6&auth_user=key_web_new_fanyi&sign=${sign}`
    axios.post(url, data, {
      headers: {
        'Set-Headers': JSON.stringify(this.headers),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).then(res => {
      console.log(res)
      if (res.data.error_code) {
        $msg.error('爱词霸错误：' + res.data.message)
        return
      }
      if (callback) {
        res = JSON.parse(this.decrypt(res.data.content))
        console.log(res)
        console.log('/////翻译结果：' + res.out)
        callback(res.out)
      }
    })
  }

  getSign(q) {
    const s = "6key_web_new_fanyi6dVjYLFyzfkFkk".concat(q.replace(/(^\s*)|(\s*$)/g, ""))
    let sign = crypto.createHash("md5").update(s).digest('hex').substring(0, 16);
    return this.encrypt(sign)
  }

  encrypt(sign) {
    let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "%5C%C2%80%C2%9A%C2%A8%C2%B6%C2%B8y%C2%9B%C2%B2%C2%8F%7C%7F%C2%97%C3%88%C2%A9d"
    e = decodeURIComponent(e);
    let t, r
    for (t = String.fromCharCode(e.charCodeAt(0) - e.length), r = 1; r < e.length; r++)
      t += String.fromCharCode(e.charCodeAt(r) - t.charCodeAt(r - 1));
    let key = Buffer.from(t, 'utf8');
    const cipher = crypto.createCipheriv('aes-128-ecb', key, '')
    cipher.setAutoPadding(true)
    let encrypted = cipher.update(sign, 'utf8', 'base64')
    encrypted += cipher.final('base64');
    return encrypted
  }

  decrypt(e) {
    const t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "aahc3TfyfCEmER33";
    const r = Buffer.from(t, 'utf8');
    const decipher = crypto.createDecipheriv('aes-128-ecb', r, '');
    let decrypted = decipher.update(e, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
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

export default ICiBaTranslator
