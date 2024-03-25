<template>
  <div class="container">
    <h1 class="title">自动翻译插件</h1>
    <div class="body">
      <div class="toggle-container">
        <span class="form-label inline">状态</span>
        <label class="toggle-switch">
          <input type="checkbox" id="toggleSwitch" v-model="config.enabled" @change="toggleChange">
          <span class="slider"></span>
        </label>
      </div>
      <hr>
      <div class="language-container">
        <div class="form-label">翻译语言</div>
        <select id="fromLanguage" class="my-select" v-model="config.from" @change="saveConfig('from')">
          <option v-for="lang in languages" :value="lang.value" v-text="lang.name" :disabled="config.to==lang.value"></option>
        </select>
        ->
        <select id="toLanguage" class="my-select" v-model="config.to" @change="saveConfig">
          <option v-for="lang in languages" :value="lang.value" v-text="lang.name"
                  :disabled="config.from==lang.value"></option>
        </select>
      </div>
      <hr>
      <div class="translate-container">
        <div class="form-label">翻译源</div>
        <select id="provider" class="my-select" v-model="config.provider" @change="saveConfig" title="鼠标悬停每个选项查看详细内容">
          <option v-for="p in providers" :value="p.value" v-text="p.name" :title="p.title"></option>
        </select>
      </div>
      <hr>
      <div class="method-container">
        <div class="form-label">触发方式</div>
        <li>
          <label for="method-scroll-on-image" title="设置识别框后并保存后，鼠标放在识别区域内滚动鼠标滚轮触发翻译">识别框滚动</label>
          <input type="radio" name="method" :checked="config.method==0" @click="changeMethod(0)" id="method-scroll-on-image"/>
        </li>
        <li>
          <label for="method-scroll" title="只要页面滚动就会翻译识别框区域内的文字">滚动</label>
          <input type="radio" name="method" :checked="config.method==1" @click="changeMethod(1)" id="method-scroll"/>
        </li>
        <li>
          <label for="method-keyboard" title="按下按键，对识别框区域内文字进行翻译">键盘</label>
          <input type="radio" name="method" :checked="config.method==2" @click="changeMethod(2)" id="method-keyboard"/>
          <span v-if="config.method==2&&config.keys.translateKey" v-text="config.keys.translateKey"></span>
        </li>
      </div>
      <hr>
      <button class="rec-button" @click="adjustRectangle">调整识别框</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      config: {
        enabled: false,
        from: 'en',
        to: 'ch',
        provider: 'youdao',
        rectangle: null,
        method: 0, // 0-鼠标置于识别框内滚动； 1-滚动； 2-按键
        keys: {
          translateKey: null, // 按下按键执行图片识别与翻译
          clearKey: null // 清除屏幕上的文本
        }
      },
      languages: [
        {name: '英语', value: 'en'},
        {name: '中文', value: 'ch'},
        {name: '日语', value: 'japan'},
        {name: '韩语', value: 'korean'},
      ],
      providers: [
        {name: '有道翻译', value: 'youdao', title: "比较稳定，多个页面可以同时使用，一般用有道就OK"},
        {name: '百度翻译', value: 'baidu', title: "不大稳定，多个页面不可同时使用，A页面翻译一次再回B页面翻译，会自动刷新身份"},
        {name: '金山爱词霸', value: 'iciba', title:"随便破着玩的"},
      ]
    }
  },
  mounted() {
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

    this.$msg = useMessage();
    document.addEventListener('DOMContentLoaded', () => {
      // 从存储中获取配置信息并更新界面
      chrome.storage.sync.get('config', items => {
        this.config = items.config
      });
    });
  },
  methods: {
    toggleChange() {
      this.saveConfig('enabled')
      this.$msg.success("刷新目标页面后生效")
    },
    saveConfig(key) {
      if (key == 'from') {
        this.updateOcrLanguage()
      }
      console.log('更新设置：', this.config)
      chrome.storage.sync.set({
        config: this.config
      });
      chrome.tabs.query({}, tabs => {
        console.log('tabs: ', tabs)
        for (let tab of tabs) {
          chrome.tabs.sendMessage(tab.id, {action: 'updateConfig', data: this.config});
        }
      });
    },
    updateOcrLanguage() {
      console.log('开始设置OCR语言为' + this.config.from)
      axios.get('http://localhost:8001/ocr/lang?lang=' + this.config.from).then(res => {
        console.log('设置成功')
      }).catch(err => {
        alert('OCR服务器未开启')
      })
    },
    changeMethod(v) {
      if (v == 2) {
        let key = prompt('输入触发翻译的按键（一个英文字母）')
        if (key == null || key.length != 1) {
          this.config.method = 0
          this.$msg.error('无效配置')
          return
        }
        this.config.keys.translateKey = key
      }
      this.config.method = v
      this.saveConfig()
    },
    adjustRectangle() {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'adjustRectangle'});
      });
    }
  }
}
</script>

<style lang="less" scoped>
/* popup.css */

//body {
//  font-family: "Helvetica", Arial, sans-serif;
//  background-color: #333;
//  color: #fff;
//  padding: 20px;
//}

.container {
  width: 240px;
  margin: 0 auto;
  padding-bottom: 40px;

  .body {
    width: fit-content;
    margin: 0 auto;
  }
}

.title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
}

.toggle-container {
  display: flex;
  align-items: center;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 39px;
  height: 26px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(15px);
}

.form-label {
  width: 80px;
  font-size: 16px;
  margin: 6px 0 2px 0;
}

.form-label.inline {
  display: inline-block;
}

.language-container {

}

.translate-container {
  select {
    cursor: help;
  }
  option {
    cursor: help;
  }
}

.method-container {
  label {
    font-size: 15px;
    vertical-align: bottom;
    cursor: help;
  }
  .detail {
    display: inline-block;
    width: 14px;
    height: 14px;
    line-height: 14px;
    text-align: center;
    border-radius: 50%;
    cursor: help;
    color: white;
    background: rgb(120, 120, 120);
  }
}

.my-select {
  padding: 3px;
  border-radius: 6px;
  border: none;
  background-color: #555;
  color: #fff;
}

.my-select option {
  background-color: #555;
  color: #fff;
}

.rec-button {
  margin-top: 8px;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 20px;
  background: #2689B7;
  color: rgb(248,248, 248);
}
</style>
