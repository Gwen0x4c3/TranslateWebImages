const BASE_CSS_FORMAT = 'SEL .t,SEL .b,SEL .l,SEL .r{display:block;position:absolute;z-index:1;background:#666}SEL .l,SEL .r{top:0;width:5px;height:100%;cursor:col-resize}SEL .t,SEL .b{width:100%;height:5px;cursor:row-resize}SEL .t{top:0}SEL .b{bottom:0}SEL .l{left:0}SEL .r{right:0}SEL .tl,SEL .bl,SEL .br,SEL .tr{display:block;width:20px;height:20px;position:absolute;background:#fff;border:1px solid #666;z-index:2;cursor:nwse-resize}SEL .tl,SEL .bl{left:-5px}SEL .tr,SEL .br{right:-5px}SEL .br,SEL .bl{bottom:-5px}SEL .tl,SEL .tr{top:-5px}SEL .tr,SEL .bl{cursor:nesw-resize}SEL .inner{width:100%;height:100%}'
const SPAN_CLASSES = ['r', 'l', 't', 'b', 'br', 'bl', 'tr', 'tl']
const DIV_CLASSES = ['inner']

class Rectangle {
  static register(selector) {
    this.injectCSS(selector)
    this.initElems(selector)
  }

  static injectCSS(selector) {
    const styleElem = document.createElement('style')
    const css = BASE_CSS_FORMAT.replace(/SEL/gi, selector)
    styleElem.type = 'text/css'
    styleElem.textContent = css
    document.head.appendChild(styleElem)
  }

  static initElems(selector) {
    let rectangle = document.querySelector(selector)
    let spans = [], divs = []
    for (let clazz of SPAN_CLASSES) {
      let span = document.createElement('span')
      span.className = clazz
      rectangle.appendChild(span)
      this.makeBorderDraggable(span, rectangle)
    }
    this.makeMovable(rectangle)
  }

  static makeBorderDraggable(obj, rectangle) {
    obj.onmousedown = function (ev) {
      ev = ev || event;
      ev.stopPropagation();
      let oldWidth = rectangle.offsetWidth;
      let oldHeight = rectangle.offsetHeight;
      let oldX = ev.clientX;
      let oldY = ev.clientY;
      let oldLeft = rectangle.offsetLeft;
      let oldTop = rectangle.offsetTop;

      document.onmousemove = function (ev) {
        ev = ev || event;
        let {x, y} = ev
        // 避免选框移出浏览器可视部分
        if (x <= 0 || x >= window.innerWidth || y <= 0 || y >= window.innerHeight) {
          return
        }
        let disY = (oldTop + (ev.clientY - oldY)),
          disX = (oldLeft + (ev.clientX - oldLeft));
        if (disX > oldLeft + oldWidth) {
          disX = oldLeft + oldWidth
        }
        if (disY > oldTop + oldHeight) {
          disY = oldTop + oldHeight
        }
        if (obj.className == 'tl') {
          rectangle.style.width = oldWidth - (ev.clientX - oldX) + 'px';
          rectangle.style.height = oldHeight - (ev.clientY - oldY) + 'px';
          rectangle.style.left = disX + 'px';
          rectangle.style.top = disY + 'px';
        } else if (obj.className == 'bl') {
          rectangle.style.width = oldWidth - (ev.clientX - oldX) + 'px';
          rectangle.style.height = oldHeight + (ev.clientY - oldY) + 'px';
          rectangle.style.left = disX + 'px';
          rectangle.style.bottom = oldTop + (ev.clientY + oldY) + 'px';
        } else if (obj.className == 'tr') {
          rectangle.style.width = oldWidth + (ev.clientX - oldX) + 'px';
          rectangle.style.height = oldHeight - (ev.clientY - oldY) + 'px';
          rectangle.style.right = oldLeft - (ev.clientX - oldX) + 'px';
          rectangle.style.top = disY + 'px';
        } else if (obj.className == 'br') {
          rectangle.style.width = oldWidth + (ev.clientX - oldX) + 'px';
          rectangle.style.height = oldHeight + (ev.clientY - oldY) + 'px';
          rectangle.style.right = oldLeft - (ev.clientX - oldX) + 'px';
          rectangle.style.bottom = oldTop + (ev.clientY + oldY) + 'px';
        } else if (obj.className == 't') {
          rectangle.style.height = oldHeight - (ev.clientY - oldY) + 'px';
          rectangle.style.top = disY + 'px';
        } else if (obj.className == 'b') {
          rectangle.style.height = oldHeight + (ev.clientY - oldY) + 'px';
          rectangle.style.bottom = disY + 'px';
        } else if (obj.className == 'l') {
          rectangle.style.height = oldHeight + 'px';
          rectangle.style.width = oldWidth - (ev.clientX - oldX) + 'px';
          rectangle.style.left = disX + 'px';
        } else if (obj.className == 'r') {
          rectangle.style.height = oldHeight + 'px';
          rectangle.style.width = oldWidth + (ev.clientX - oldX) + 'px';
          rectangle.style.right = disX + 'px';
        }
      };
      document.onmouseup = function () {
        document.onmousemove = null;
      };
      return false;
    };
  }

  static makeMovable(rectangle) {
    rectangle.onmousedown = function(ev) {
      ev = ev || event;
      ev.preventDefault();

      let distanceX = ev.clientX - rectangle.offsetLeft;
      let distanceY = ev.clientY - rectangle.offsetTop;

      document.onmousemove = function (ev) {
        ev = ev || event;
        rectangle.style.left = ev.clientX - distanceX + 'px';
        rectangle.style.top = ev.clientY - distanceY + 'px';
      };
      document.onmouseup = function (ev) {
        ev = ev || event
        const left = ev.clientX - distanceX,
          top = ev.clientY - distanceY
        // 避免矩形移出浏览器可视部分
        if (left <= 0) {
          rectangle.style.left = 0 + 'px'
        } else if (left + rectangle.offsetWidth >= window.innerWidth) {
          rectangle.style.left = window.innerWidth - rectangle.offsetWidth + 'px'
        }
        if (top <= 0) {
          rectangle.style.top = 0 + 'px'
        } else if (top + rectangle.offsetHeight >= window.innerHeight) {
          rectangle.style.top = window.innerHeight - rectangle.offsetHeight + 'px'
        }
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }
  }
}

export default Rectangle
