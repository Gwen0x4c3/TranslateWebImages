<template>
  <div class="content_page">
    <div class="adjust-rectangle" id="adjust-rectangle" v-show="rectangleVisible">
      <div>拖动四边调整位置</div>
      <a href="javascript:;" @click="saveRectangle">保存</a>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import YoudaoTranslator from '@/utils/YoudaoTranslator'
import BaiduTranslator from "@/utils/BaiduTranslator";
import Rectangle from "@/utils/Rectangle";
import ICiBaTranslator from "@/utils/ICiBaTranslator";

export default {
  data() {
    return {
      lock: false,
      rectangleVisible: false,
      config: {
        enabled: false,
        from: null,
        to: null,
        provider: null,
        rectangle: null,
        method: null,
        keys: null
      },
      pos: {
        x: 0,
        y: 0
      },
      translator: null,
      timer: null,
      textWrapper: null,
      focused: true
    }
  },
  mounted() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(request)
      if (request.action === 'adjustRectangle') {
        // 调整矩形框
        this.adjustRectangle();
      } else if (request.action === 'updateConfig') {
        // 更新配置
        if (this.config.provider != request.data.provider) {
          this.initTranslator(request.data.provider)
        }
        this.config = request.data
        console.log('更新配置为', this.config)
      }
    });
    // 初始化矩形框
    Rectangle.register('#adjust-rectangle')
    chrome.storage.sync.get('config', items => {
      if (items.config == null) {
        console.log('使用默认值')
        this.config = {
          enabled: false,
          from: 'en',
          to: 'ch',
          provider: 'youdao',
          rectangle: {
            x: window.innerWidth * 0.2,
            y: 0,
            w: window.innerWidth * 0.6,
            h: window.innerHeight
          },
          method: 0,
          keys: {
            translateKey: 'Q',
            clearKey: 'X' // 清除屏幕上的文本
          }
        }
        chrome.storage.sync.set({
          "config": this.config
        })
      } else {
        this.config = items.config
        if (this.config.enabled) {
          this.init()
        } else {
          console.log('插件未开启')
        }
      }
      console.log('加载配置: ', this.config)
    });
  },
  methods: {
    init() {
      console.log('语言：' + this.config.from)
      this.initTranslator()
      this.textWrapper = document.createElement('div')
      this.textWrapper.className = 'text-wrapper'
      this.textWrapper.id = 'text-wrapper'
      document.body.appendChild(this.textWrapper)
      // 监听滚动事件
      window.addEventListener('scroll', () => {
        // 未开启插件 || 未聚焦 || 键盘触发
        if (!this.config.enabled || !this.focused || this.config.method==2) {
          return
        }
        // 是否正在识别
        if (this.lock)
          return;
        // 是否需要在识别框内
        if (this.config.method == 0
          && (this.pos.x < this.config.rectangle.x || this.pos.x > this.config.rectangle.x + this.config.rectangle.w
            || this.pos.y < this.config.rectangle.y || this.pos.y > this.config.rectangle.y + this.config.rectangle.h))
          return;
        console.log('---------加锁')
        this.lock = true
        // 清除之前的计时器
        clearTimeout(this.timer);
        // 设置新的计时器
        this.timer = setTimeout(() => {
          this.recognizeImageInVision()
        }, 300);
      });

      window.addEventListener('blur', () => {
        console.log('失去焦点')
        this.focused = false
      });

      window.addEventListener('focus', () => {
        console.log('获得焦点')
        this.focused = true
      });

      document.addEventListener('mousemove', event => {
        // 获取鼠标位置
        this.pos.x = event.clientX
        this.pos.y = event.clientY
      });

      document.addEventListener('keydown', e => {
        if (this.config.keys.clearKey && this.config.keys.clearKey.toLowerCase() == e.key.toLowerCase()) {
          this.clearOcr()
        } else if (this.config.method == 2 && this.config.keys.translateKey && this.config.keys.translateKey.toLowerCase() == e.key.toLowerCase()) {
          this.recognizeImageInVision()
        }
      })
    },
    adjustRectangle() {
      console.log(this.config.rectangle)
      let rectangle = document.getElementById('adjust-rectangle')
      rectangle.style.left = this.config.rectangle.x + 'px'
      rectangle.style.top = this.config.rectangle.y + 'px'
      rectangle.style.width = this.config.rectangle.w + 'px'
      rectangle.style.height = this.config.rectangle.h + 'px'
      this.rectangleVisible = true
    },
    saveRectangle() {
      let rectangle = document.getElementById('adjust-rectangle')
      this.config.rectangle.x = parseInt(rectangle.style.left)
      this.config.rectangle.y = parseInt(rectangle.style.top)
      this.config.rectangle.w = parseInt(rectangle.style.width)
      this.config.rectangle.h = parseInt(rectangle.style.height)
      this.saveSettings()
      this.rectangleVisible = false
    },
    saveSettings() {
      chrome.storage.sync.set({
        config: this.config
      })
      chrome.runtime.sendMessage({action: 'syncConfig', data: this.config})
    },
    initTranslator(provider) {
      console.log("初始化翻译器：" + provider || this.config.provider)
      switch (provider || this.config.provider) {
        case 'baidu':
          this.translator = new BaiduTranslator();
          break;
        case 'iciba':
          this.translator = new ICiBaTranslator();
          break;
        case 'youdao':
        default:
          this.translator = new YoudaoTranslator()
      }
      setTimeout(() => {console.log('开始翻译');this.translator.translate('I want to fart on your face', 'en', 'ch')}, 1000)
    },
    recognizeImageInVision() {
      console.log('开始识别')
      this.textWrapper.innerHTML = ''
      requestAnimationFrame(() => {
        chrome.runtime.sendMessage({action: 'captureScreenshot'}, response => {
          // 在这里处理截图数据
          var screenshotDataUrl = response.dataUrl;
          this.callOcrApi(screenshotDataUrl, window.scrollX + this.config.rectangle.x, window.scrollY + this.config.rectangle.y);
        });
      })
    },
    callOcrApi(base64, x, y) {
      base64 = base64.substring(22)
      axios.post('http://localhost:8001/ocr/base64', {
        base64,
        lang: this.config.from,
        rectangle: this.config.rectangle,
        displayWidth: window.innerWidth
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: false
      }).then(res => {
        console.log(res)
        res = res.data
        if (res.error) {
          console.error("出错了", res.message)
          this.lock = false
          return
        }
        if (!res.data || res.data.length == 0) {
          console.log('未识别到文本')
          this.lock = false
          return;
        }
        const { scale } = res  // scale = originalWidth / displayWidth
        this.clearOcr()
        let data = res.data
        for (let d of data) {
          const {box, text} = d
          for (let b of box) {
            b[0] /= scale
            b[1] /= scale
          }
          const {width, height, angleDeg} = this.calculateRectangleProperties(box)
          //检查是否生成过
          const div = document.createElement('div');
          this.textWrapper.appendChild(div)

          div.className = 'ocr-text'
          let lineHeight
          if (width * 1.5 < height) { // 竖着排的字
            div.className += ' verticle'
            div.style.minWidth = width + 'px'
            div.style.height = height + 'px'
            lineHeight = d.lineHeight ? d.lineHeight : width
          } else { // 横着的正常字
            div.style.minHeight = height + 'px';
            div.style.width = width + 'px'
            lineHeight = d.lineHeight ? d.lineHeight : height
          }
          div.innerText = text;
          div.style.left = x + box[0][0] + 'px';
          div.style.top = y + box[0][1] + 'px';
          div.style.transform = `rotate(${angleDeg}deg)`;
          // div.style.minHeight = height + 'px';
          div.style.lineHeight = lineHeight + 'px'
          // div.style.fontSize = lineHeight * 0.75 * 0.9 + 'pt';
          div.style.fontSize = lineHeight * 0.75 * 0.9 + 'pt';
          // div.style.width = width + 'px';
          this.translator.translate(text, this.config.from, this.config.to, res => {
            div.innerText = res
          })
        }
        this.lock = false
      }).catch(err => {
        this.lock = false
        alert('未启动OCR服务器！若不需要使用插件就关闭')
      })

    },
    clearOcr() {
      this.textWrapper.innerHTML = ''
    },
    calculateRectangleProperties(points) {
      // 获取四个角点的坐标
      const [p1, p2, p3, p4] = points;

      // 计算矩形的高度和宽度
      const height = Math.sqrt((p4[0] - p1[0]) ** 2 + (p4[1] - p1[1]) ** 2);
      const width = Math.sqrt((p4[0] - p3[0]) ** 2 + (p4[1] - p3[1]) ** 2);

      // 计算相对于 x 轴的倾斜角度
      const angleRad = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      const angleDeg = angleRad * (180 / Math.PI);

      return {
        width,
        height,
        angleDeg,
      };
    }
  }
}
</script>

<style lang="less">
.content_page {
  color: red;
  position: fixed;
  z-index: 100001;
  right: 10px;
  bottom: 10px;
  background: white;


  .content_page_main {
    color: green;
  }

  .adjust-rectangle {
    position: fixed;
    left: 0;
    top: 0;
    width: 60vw;
    height: 100vh;
    z-index: 99999999;
    box-sizing: border-box;
    justify-content: center;
    text-align: center;
    display: flex;
    align-items: center;
    color: white;
    background: rgba(0, 0, 0, 0.5);

    div {
      margin-right: 10px;
    }

    a {
      font-size: 22px;
      color: aquamarine
    }
  }
}

* {
  margin: 0;
  padding: 0;
}

#text-wrapper {
  visibility: visible;
  //width: 100%;
  //height: 100%;
  //position: absolute;
  //left: 0;
  //top: 0;
  //pointer-events: none;
}

.ocr-text {
  position: absolute;
  transform-origin: top left;
  font-family: "微软雅黑";
  background: #fff;
  color: #000;
  word-break: break-word;
  text-align: left;
  z-index: 10000;
  transition: .1s;
}

.ocr-text:hover {
  opacity: 0;
}

.ocr-text.verticle {
  writing-mode: vertical-rl;
  text-orientation: upright;
}

</style>
