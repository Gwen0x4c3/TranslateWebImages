# TranslateWebImages

本repo为插件的源代码，只是使用的话下载下方百度网盘中的内容按步骤来就行了

**注意！！日语竖版文字的识别基本上一拖四，实际上日语韩语正常排版识别效果好像都很垃圾，我不知道是不是这个paddleocr的模型的问题，或者哪里调用的参数搞错了。我平时也用不着，写了就不想用了，不好用不要骂我**



## 使用

[百度网盘](https://pan.baidu.com/s/1GEYenyqJ6R4ShENHNjNvxQ?pwd=6666)下载文件，包含**OCRServer**和**TranslateWebImages-ext**的压缩包，各自解压。

### OCRServer

这是OCR的服务器，想要使用插件首先电脑上得运行这个，使用cpu对图片进行识别。运行解压后文件夹中的main.exe启动OCR服务器。

如果你有自己的文字识别API可以自己修改前端源代码Content中的相关代码来适配你的API。

我用什么打包的exe忘记了，如果不能运行我到时候再把ocr的代码放上来

### TranslateWebImages-ext

这是编译后的扩展程序，先解压，然后在chrome的地址栏输入chrome://extensions/，打开开发者模式，加载已解压的扩展程序

![image-20240326001106522](README.assets\image-20240326001106522.png)

选择TranslateWebImages-ext文件夹，加载后扩展程序列表会显示这个

![image-20240326001226668](README.assets\image-20240326001226668.png)

开启后按图依次点击可以将其固定在上面

![image-20240326001327981](README.assets\image-20240326001327981.png)



如果你想对扩展程序代码进行修改，参考以下搭建环境。



## 修改源代码

> 使用 vue3 版本进行 chrome 浏览器插件开发

项目在https://github.com/18055975947/my-vue3-plugin的基础上开发

### 此项目版本

```
@vue/cli 4.5.7
yarn 1.22.10
```

### node_modules 安装

```
yarn install
```

> 如果遇到问题报错，可以查看[使用 vue-cli 创建 vue3.x 版本项目报错](https://guoqiankun.blog.csdn.net/article/details/111993759) 这篇文章

### 插件开发

```
yarn run watch
```

### 插件打包

```
yarn run build
```

### 文章地址

[CSDN 15000字大章带你一步一步使用Vue3开发chrome浏览器插件](https://guoqiankun.blog.csdn.net/article/details/112007833)

[掘金 15000字大章带你一步一步使用Vue3开发chrome浏览器插件](https://juejin.cn/post/6912295521172324360/)

