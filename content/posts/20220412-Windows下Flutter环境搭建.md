---
title: "Windows 系统下搭建 Flutter 环境并运行 Flutter 项目"
description: ""
uid: 509
createTime: 2022/04/12 14:12:40
updateTime: 2022/04/12 14:12:40
tag: ['Flutter']
---
:ArticleToc
:ArticleHeader

组长昨天说今年可能会尝试使用 Flutter 开发一个项目，听到这个消息后我急急忙忙地开卷，毕竟技多不压身。下面简单介绍一下 Windows 系统如何搭建 Flutter 运行环境。
## 获取 Flutter SDK

这里有两种方式获取 SDK，一种是直接下载安装压缩包，另一种是通过 git 来获取源码。我选择了前者，因为会省事不少。

下载地址在[官网](https://docs.flutter.dev/get-started/install/windows)可以找到。

下载好安装包之后，找一个自己喜欢的目录解压，官方建议最好找一个不需要特殊权限的文件夹进行解压，同时路径里不要包含特殊符号或者空格。这里我选择解压到 `D:\flutter`，后续的所有操作也以这个路径为准。

## 配置环境变量

首先打开环境变量配置，找到系统变量里的 `Path` 并进行编辑操作

![image-20220412110205943](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412110205943.png)

然后点击新建，把自己 `flutter\bin` 所在的完整路径填进去，最后点击确定。

![image-20220412110337670](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412110337670.png)

完成环境变量的配置，可以打开命令行工具，输入 `flutter --version` 来检查是否配置成功。由于我们下载的 SDK 里面已经包含了 Dart，所以输入 `dart --version` 也会出现 dart 的版本信息。

## 依赖检查

在命令行中运行 `flutter doctor` 可以自动检查我们的依赖是否有缺失。第一次运行时 flutter 会下载一些东西，所以运行时间可能比较长，耐心等待就可以。运行结果大概长这样：

![image-20220412111026121](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412111026121.png)

每个人的检查结果可能都不相同，根据检查的提示自行安装即可。

**注意**：如果你不需要开发桌面端应用的话，Visual Studio 是不需要安装的。

## Android Studio 配置

如果你之前没有安装过 Android Studio，那么上面的检查可能会有很多不通过的地方。下面简单介绍 Android Studio 的配置流程。

### 安装

首先去[官网](https://developer.android.com/studio)下载安装包并安装，具体安装过程可以自行搜索，需要额外配置 JAVA 环境之类的。

安装完之后，第一次打开时会有一个引导流程，由于我已经安装过了，所以没有办法截图。只需要记得安装这几样东西：`Android SDK`，`Android SDK Command-line Tools`，`Android SDK Build-Tools`。

将 Android Studio 初始化完之后，打开命令行工具，输入 `flutter config --android-studio-dir D:\software\AndroidStudio` 来配置 Android Studio 的安装路径。你需要把路径替换为自己的实际安装路径，并且路径里**不要有空格**。

这时候再次运行 `flutter doctor` 应该就可以发现很多依赖项不再爆红了。

### 安装 Android 虚拟机

> 这里我略过了真机调试，选择了虚拟机调试，如果有真机调试的需求可以去官方文档自行配置。

首先打开 Android Studio 中的 AVD Manager

![image-20220412115153991](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412115153991.png)

创建一个新的虚拟机

![image-20220412115219412](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412115219412.png)

选择一个喜欢的机型，然后点击 Next

![image-20220412115249842](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412115249842.png)

选择一个系统镜像，这里我选择的是最新的 Android 12，选择自己需要的版本即可。如果选择了没有安装过的镜像则需要下载，下载速度可能比较慢，耐心等待即可。安装完成后点击 Next

![image-20220412115458335](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412115458335.png)

这里配置页面需要选择硬件加速，选择 `Hardware - GLES 2.0` ，然后点击 Finish 即可。**注意：**如果这一选项不可选择，那么可以尝试换一个机型或系统镜像。

![image-20220412133437865](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412133437865.png)

最后，打开命令行输入 `flutter doctor --android-licenses`，一路同意就完事了。

这时候我们再次输入 `flutter doctor` 应该就可以发现除了 Visual Studio 外其他的依赖都已经安装完成了。

### 新建一个 Flutter 项目并运行

为了能运行 Flutter 项目，我们需要在 Android Studio 的 Plugins 界面中安装两个插件：Flutter 和 Dart，安装完成后重启 IDE 即可。

重启后我们可以看到一个新的按钮： `New Flutter Project`

![image-20220412134128350](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412134128350.png)

点进去之后会让我们先配置 flutter 目录，选择完目录后点击 Next

![image-20220412134214170](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412134214170.png)

接着就是项目的一些信息填写。需要注意的是，项目的存放位置不要使用 `-` 或者空格，因为 dart 不支持。所以我们需要使用下划线来分隔单词。下面的 `Organization` 是填写公司的域名，在应用发布时，它会和项目名称一起作为 Android 的包名。应用发布后包名将无法修改，不过如果不发布的话这一项随便填一下就可以。填完这些信息之后点击 Finish 就可以完成项目创建。

![image-20220412134450089](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412134450089.png)

打开刚刚创建好的项目，首先选择我们之前在 AVD Manager 配置的虚拟机，然后选择好运行的 main 文件，点击运行就可以跑起来项目啦

![image-20220412135646713](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412135646713.png)

但是众所周知，有些网站在国内的访问速度是很慢的，所以很有可能你会卡在这一步：

![image-20220412135821050](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412135821050.png)

原因是项目默认的 Gradle 的 Maven 仓库我们访问不到，所以我们需要把仓库地址配置为国内镜像源。步骤如下：

1. 修改项目目录下的 `android/build.gradle` 文件内的仓库地址为

   ```js
   maven { url 'https://maven.aliyun.com/repository/google' }
   maven { url 'https://maven.aliyun.com/repository/jcenter' }
   maven { url 'http://maven.aliyun.com/nexus/content/groups/public' }
   ```

   ![image-20220412140306626](https://pic-go-20220331-1301395896.cos.ap-beijing.myqcloud.com/img/image-20220412140306626.png)

2. 修改 flutter SDK目录下的 `flutter\packages\flutter_tools\gradle\flutter.gradle` 和 `flutter\packages\flutter_tools\gradle\resolve_dependencies.gradle`，同样也是修改仓库地址。

修改完成后，我们重启 IDE 就可以发现项目可以正常运行啦



> 至此，我们已经可以正常地进行 Flutter 项目跨 Android 平台的开发了。最近开始慢慢学习 Flutter 和 Dart了，身上的担子越来越多，但我还是一如既往的懒。希望自己能坚持下去吧。

