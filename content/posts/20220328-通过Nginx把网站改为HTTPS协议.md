---
title: "通过 Nginx 把网站改为 HTTPS 协议"
description: ""
uid: 503
createTime: 2022/03/28 10:58:00
updateTime: 2022/03/28 10:58:00
tag: ['网站部署']
---
:ArticleToc
:ArticleHeader

填一下上次部署网站遗留的坑：如何使用 Nginx 安装 SSL 证书，从而使网站的协议由 http 变为 https

### 前期准备

1. 首先，我们需要给我们的域名申请 SSL 证书，既有免费证书，也有付费证书，一般来讲免费证书就已经够用了，所以在这里只介绍免费证书的申请方法。
   这里建议去[阿里云](https://homenew.console.aliyun.com/home/dashboard/ProductAndService)或[腾讯云](https://console.cloud.tencent.com/certoverview)申请证书（我选择的是腾讯云，所以下述步骤以腾讯云为准），申请步骤非常简单，只需要填上一些必要的信息（域名、邮箱等）就可以申请，大概 1-10 分钟就可以拿到证书啦。
2. 申请完成后我们可以在证书管理界面下载证书，下载的格式选择 Nginx，解压后可以得到四个文件:
   - `plantsechi.top_bundle.crt` 证书文件
   - `plantsechi.top_bundle.pem` 证书文件（安装时可忽略该文件）
   - `plantsechi.top.key` 私钥文件
   - `plantsechi.top.csr` CSR 文件（安装时可忽略该文件）
     其实安装证书的过程中真正用到的只有 `crt` 文件和 `key` 文件
3. 有了证书之后我们需要把它们上传到服务器上，这里我使用的是 XFTP 进行文件上传。首先我们需要在 Nginx 的根目录新建一个文件夹存放证书，然后把两个文件放到该文件夹内。最终达到的效果：`/etc/nginx/cert` 中存放了 `plantsechi.top_bundle.crt` 和 `plantsechi.top.key` 两个文件。

### Nginx 配置

进行完以上操作后，我们需要修改一下 Nginx 的配置，下面放出我的部分配置供参考：

```shell
upstream webserver {
		server 127.0.0.1:7070;
	}

	server {
   			listen 443 ssl;
    		server_name plantsechi.top; #域名
    		ssl_certificate  /etc/nginx/cert/plantsechi.top_bundle.crt; #证书文件的路径
    		ssl_certificate_key /etc/nginx/cert/plantsechi.top.key; #私钥文件的路径
    		ssl_session_timeout 5m;
   			ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    		ssl_protocols TLSv1.2 TLSv1.3;
    		ssl_prefer_server_ciphers on;

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
        			proxy_pass         http://webserver; 
    		}
	}

```

完成以上配置就可以通过 https 协议访问网站啦~但是还是有一些地方不太完美，如果在浏览器依旧输入 http 协议的 URL，依旧会使用 http 协议，所以我们需要让网站的 http 请求自动重定向到 https，该功能同样可以通过 Nginx 实现，只需要再额外监听 80 端口就可以实现：

```shell
	server {
    		listen 80;
    		server_name plantsechi.top; 
    		return 301 https://$host$request_uri; #将默认 80 端口的请求重定向为 https
	}
```

至此，我们已经成功将网站的协议改为 https，还是挺简单的~
