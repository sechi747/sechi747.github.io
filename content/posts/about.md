---
title: "test post"
description: "This is a description of the post."
uid: 501
createTime: 2022-10-17T07:02:48.054Z
updateTime: 2022-10-17T07:02:48.054Z
---
:ArticleToc
:ArticleHeader
# 前置工作

部署使用的 Ubuntu 版本：Ubuntu 20.04.4 LTS (GNU/Linux 5.4.0-96-generic x86_64)

整个部署过程我都是使用 root 用户进行操作，所以不会有权限问题，但如果你是使用其他用户进行操作，则需要注意权限问题，适时给命令加上 `sudo` 前缀

## 安装 npm

`apt install npm`

`npm config set registry https://registry.npmmirror.com` 配置国内 npm 镜像

### 安装 n

`npm i -g n`

### 使用 n 安装 node

`n lts`  安装 node 的长期支持版

`n 14.17.6` 安装特定版本的 node（此处仅做演示，请根据实际需求安装特定的 node 版本）

`n` 切换当前 node 版本，切换的同时 npm 版本也会改变。可以通过 `node -v` 查看当前 node 版本

### 安装 pm2

`npm i -g pm2`

### 安装并配置 git

1. `apt install git`

2. ```bash
   git config --global user.name '用户名'
   git config --global user.email '邮箱'
   ```

3. `ssh-keygen -C '邮箱' -t rsa`  默认生成目录为 `~/.ssh`

4. `cat ~/.ssh/id_rsa.pub` 复制 ssh key 并将其加入 github 的设置中

单独说一下我遇到的问题：在进行完以上步骤后，我尝试使用 `git clone git@github.com:sechi747/nuxt-blog.git ` 命令拉取我的个人仓库，结果失败了。错误信息如下：

```bash
kex_exchange_identification: read: Connection reset by peer
fatal: Could not read from remote repository

Please make sure you have the correct access rights
and the repository exists
```

尝试了许多种方法进行解决，包括但不限于：重装系统，重新生成 ssh key，根据 github 官方的指南一步一步进行操作等都没有起作用。下面是我最终的解决方法。

进入到 `.ssh` 文件夹下，新建 `config` 文件（如果有就不用建了，直接修改就可以），添加以下配置：

```shell
Host github.com
Hostname ssh.github.com
Port 443
User git
```

然后再进行 `git` 操作就不会有问题了。造成这个现象的原因暂时不清楚，等有空再细查吧。

### 安装 Nginx

此处安装的 Nginx 版本为：nginx/1.18.0 (Ubuntu)

1. `apt install nginx` 安装 Nginx
2. `service nginx start` 启动 Nginx

### 安装 MySQL

其实我的博客项目并不涉及数据库，但是为了熟悉 Linux 操作还是装上吧~

此处安装的 MySQL 版本为：8.0.28-0ubuntu0.20.04.3 for Linux on x86_64 ((Ubuntu))

1. `apt install mysql-server` 安装 MySQL
2. `systemctl status mysql.service` 看一下有没有安装成功
3. `mysql -u root -p` 因为安装时并没有要求设置密码，所以密码默认为空，直接敲回车就能进入控制台了
4. `use mysql;` 切换到 mysql 数据库
5. `alter user 'root'@'localhost' identified with mysql_native_password by '密码';`  修改 root 账号的密码加密方式和密码，这样就可以在客户端使用密码连接数据库了
6. `grant all on *.* to 'root'@'localhost';` 使外网可以访问到数据库
7. `vim /etc/mysql/mysql.conf.d/mysqld.cnf` 将里面的`bind-address` 和 `mysqlx-bind-address` 修改为 `0.0.0.0`
8. `systemctl restart mysql` 重启 MySQL 服务

### 安装 Docker

docker 肯定是会用到的，虽然我现在没用到~ 这里直接把官网的安装教程搬过来

此处安装的 Docker 版本为：20.10.14, build a224086

1. 安装一些必要的包

   ```bash
   apt update
   apt install ca-certificates curl gnupg lsb-release
   ```

2. 添加 docker 官方的 GPG 密钥
   `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg`

3. 设置稳定版的 docker 仓库

   ```shell
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

4. 安装 docker 引擎

   ```shell
   apt update
   apt install docker-ce docker-ce-cli containerd.io
   ```

5. 验证安装是否成功
   `docker run hello-world`
   由于我们本地是没有 hello-world 这个镜像的，所以会去服务器 pull，如果发现成功运行了 hello-world 镜像，出现了 Hello from Docker 的，那么就算是安装成功啦！

6. 配置 docker 镜像加速源

   ```shell
   vim /etc/docker/daemon.json
   
   #在文件中添加以下内容
   {
      "registry-mirrors": [
          "https://mirror.ccs.tencentyun.com"
     ]
   }
   
   #添加完成后执行下面的命令重启 docker 服务器
   systemctl restart docker
   ```

   由于 DockerHub 部署在国外，如果直接使用 `docker pull` 拉取镜像速度会比较慢，所以推荐配置一下 Docker镜像加速源，这里我选择的是腾讯云提供的加速源。

## 项目部署

经过了上面的一系列准备，终于可以开始正式部署啦！

nuxt 官网提供了两种部署方式，一种是使用 `npm run build & npm run start` 进行 ssr 部署，另一种是使用 `npm run generate ` 进行静态应用部署，这里我选择的是 ssr 部署。

在部署之前，我们需要在项目中增加一些配置。

1. 在 `nuxt.config.js` 中增加以下配置：

   ```js
     server: {
       host: '0.0.0.0',
       port: '7070' // 项目运行的端口号。注意：请写一个不容易被占用的端口号
     },
   ```

2. 在项目的根目录新建一个文件用于 pm2 配置： `ecosystem.config.js` 并在里面添加以下内容：

   ```js
   module.exports = {
     apps: [
       {
         name: 'nuxt-blog', // pm2 应用进程的名称
         exec_mode: 'cluster', // 应用启动模式，这里选择集群
         instances: 'max', // 应用启动实例个数，这里选择最大，也可以填具体的数量
         script: './node_modules/nuxt/bin/nuxt.js', // 启动脚本路径
         args: 'start' // 传递给脚本的参数
         watch: [".nuxt"], // 监听 .nuxt 文件夹，当里面内容更新时会自动重启应用
     	  watch_delay: 1500, // 监听延迟
       }
     ]
   }
   ```

接下来你需要把自己的项目上传到 github 上，这一步就不再赘述。

项目上传成功后，我们切回到服务器的终端并进行以下操作：

1. 首先我们要通过 `git clone` 命令把项目放到服务器端

   ```shell
   #这里我选择在用户目录下新建一个 www 文件夹，并把项目放到里面，文件位置可以自行更改
   cd ~
   mkdir www
   cd www
   git clone git@github.com:sechi747/nuxt-blog.git
   ```

2. 项目拉下来之后，需要使用 npm 安装依赖并打包

   ```shell
   cd nuxt-blog
   npm i
   npm run build
   ```

3. 打包完成后，我们就可以使用 pm2 启动项目了

   ```shell
   pm2 start
   ```

我们可以通过 `pm2 ls` 查看当前正在运行的应用状态， `pm2 logs` 查看日志

最后，我们只需要配置一下 Nginx 就可以完成部署啦！

1. `vim /etc/nginx/nginx.conf` 编辑 Nginx 配置
2. `nginx -s reload ` 在 Nginx 目录下运行此命令，重新启动 Nginx 服务

贴出我自己的配置供参考：

```shell
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
        worker_connections 768;
        # multi_accept on;
}

http {

        ##
        # Basic Settings
        ##

        sendfile on;
        tcp_nopush on;
        tcp_nodelay on;
        keepalive_timeout 65;
        types_hash_max_size 2048;
        # server_tokens off;

        # server_names_hash_bucket_size 64;
        # server_name_in_redirect off;

        include /etc/nginx/mime.types;
        default_type application/octet-stream;

        ##
        # SSL Settings
        ##

        ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3; # Dropping SSLv3, ref: POODLE
        ssl_prefer_server_ciphers on;

        ##
        # Logging Settings
        ##

        access_log /var/log/nginx/access.log;
        error_log /var/log/nginx/error.log;

        ##
        # Gzip Settings
        ##

        gzip on;

        # gzip_vary on;
        # gzip_proxied any;
        # gzip_comp_level 6;
        # gzip_buffers 16 8k;
        # gzip_http_version 1.1;
        # gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        ##
        # Virtual Host Configs
        ##
		
		#注意！下面这两行要注释掉，否则80端口会一直被Nginx占用，导致下面自定义的sever配置不生效。
        #include /etc/nginx/conf.d/*.conf;
        #include /etc/nginx/sites-enabled/*;

        map $sent_http_content_type $expires {
                "text/html"                 epoch;
                "text/html; charset=utf-8"  epoch;
                default                     off;
        }

        upstream webserver {
                server 127.0.0.1:7070; #项目的启动地址及端口号
        }

        server {
                listen          80;             # 监听的端口
                server_name     http://plantsechi.top;    # 域名

                gzip            on;
                gzip_types      text/plain application/xml text/css application/javascript;
                gzip_min_length 1000;

                location / {
                        expires $expires;

                        proxy_redirect                      off;
                        proxy_set_header Host               $host;
                        proxy_set_header X-Real-IP          $remote_addr;
                        proxy_set_header X-Forwarded-For    $proxy_add_x_forwarded_for;
                        proxy_set_header X-Forwarded-Proto  $scheme;
                        proxy_read_timeout          1m;
                        proxy_connect_timeout       1m;
                        proxy_pass         http://webserver; # 这里要填入上面的upstream
                }
        }
}
```

完成以上所有步骤后，打开浏览器，输入域名，你就可以看到自己的网站啦~

虽然已经可以成功访问到网站了，但还是存在以下两个问题：

- 网站使用的是 http 协议而不是 https 协议
- 更新代码后每次都要手动在服务器端拉取代码并打包

后续有时间的话会把这两个坑给填上。