const crypto = require('crypto')
const axios = require('axios')
const qs = require('qs')
const {head} = require("axios");

function decrypt(e) {
  const t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "aahc3TfyfCEmER33";
  const r = Buffer.from(t, 'utf8');
  const decipher = crypto.createDecipheriv('aes-128-ecb', r, null);
  let decrypted = decipher.update(e, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

var str = "X2NheRsV7GVaBbfK/jxZ6h6rWRz0J268vfthunwKmlJIHB687XwU1lxRMBgI+YF5AfxSMXkd13JXpUJn1r1gfx/b1AQ5cqcneEofe8orIS60uUs+QVc/TdPrmzRKSqufwGQfcsbHZ5E0C7r3gq1Yir+Tb/Juw0khvjTCPsfodvrCaF48NuEglUY7WG9r/Gas0MEuWCf7aj7Djy+90m6kFXpm1rhY96/4IBwcpvtQFVgVrvcAP+RyIHOwRAByBR30Pzh9NPptSnQZm/n0/GSpnPbmR1WWZ0v5WOlCsDSYjWgzXOg/54z83oI+Yj/bKoR66YbMab+mmtIXcnhp+Uwb2rCoWF0whrcrbM5CHyCEuZ52pHYJ3cRzPNgFvf6GqoEWgeF4SMo22JYGqDKK6VrhJyCvs1BFAUNdYrsGlLNmlrsQkuYxQlM40/3DTZX4cxav"
// console.log(JSON.parse(f(str)))

const headers = {
  "Host": "ifanyi.iciba.com",
  "Referer": "https://www.iciba.com",
  "Origin": "https://www.iciba.com",
  "Content-Type": "application/x-www-form-urlencoded",
  "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "sec-ch-ua-mobile": "?0",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  "Connection": "keep-alive"
}
let data = {
  from: 'en',
  to: 'zh',
  q: 'I just wanna run'
}
function getSign(q) {
  const s = "6key_web_new_fanyi6dVjYLFyzfkFkk".concat(q.replace(/(^\s*)|(\s*$)/g, ""))
  let sign = crypto.createHash("md5").update(s).digest('hex').substring(0, 16);
  return encrypt(sign)
}
function encrypt(sign) {
  let e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "%5C%C2%80%C2%9A%C2%A8%C2%B6%C2%B8y%C2%9B%C2%B2%C2%8F%7C%7F%C2%97%C3%88%C2%A9d"
  e = decodeURIComponent(e);
  let t, r
  for (t = String.fromCharCode(e.charCodeAt(0) - e.length), r = 1; r < e.length; r++)
    t += String.fromCharCode(e.charCodeAt(r) - t.charCodeAt(r - 1));
  let key = Buffer.from(t, 'utf8');
  const cipher = crypto.createCipheriv('aes-128-ecb', key, null)
  cipher.setAutoPadding(true)
  let encrypted = cipher.update(sign, 'utf8', 'base64')
  encrypted += cipher.final('base64');
  return encrypted
}
let sign = getSign(data.q)
let url = `https://ifanyi.iciba.com/index.php?c=trans&m=fy&client=6&auth_user=key_web_new_fanyi&sign=`
url += sign
console.log(url)
axios.post(url, data, {
  headers: headers,
}).then(res => {
  console.log(res.data)

  if (res.data.error_code) {
    console.log('错误')
    return
  }
  // console.log(res.data)
  console.log(JSON.parse(decrypt(res.data.content)))
}).catch(err => {
  console.error(err)
})
