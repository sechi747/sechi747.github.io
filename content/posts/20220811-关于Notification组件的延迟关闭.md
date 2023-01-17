---
title: "给 Notification 组件添加 delay 属性"
description: ""
uid: 514
createTime: 2022/08/11 21:40:22
updateTime: 2022/08/11 21:40:22
tag: ['UI Components']
---
:ArticleToc
:ArticleHeader

前几天给 [Lew-UI](https://github.com/lewkamtao/Lew-UI) 提了一个给  `Notification` 组件添加 `delay` 属性的 PR，参考了 ELement-plus 的实现，也算是学习到了一些东西，所以想简单做一个总结。

`Notification` 组件目前只能通过调用函数来使用，所以首先要给原本的调用函数增加一个名为 `delay` 的参数，类型为 `Number`，默认值为 `3000`，当传入的值为 `0` 时则通知不会自动关闭。

先看一下原本的代码逻辑

```typescript
    // 在通知盒子里添加一个通知
    LewMessageDom?.appendChild(newMessage, LewMessageDom?.childNodes[0]);

    newMessage.setAttribute(
        'class',
        `lew-notification lew-notification-${type}`,
    );
    setTimeout(() => {
        newMessage.setAttribute(
            'class',
            `lew-notification lew-notification-${type} lew-notification-show`,
        );
        // 延时3000ms隐藏通知并延时移除dom
        setTimeout(() => {
            newMessage.setAttribute(
                'class',
                `lew-notification lew-notification-${type} lew-notification-hidden`,
            );
            setTimeout(() => {
                LewMessageDom?.removeChild(newMessage);
            }, 250);
        }, 3000);
    }, 10);
```

原先的关闭逻辑比较耦合，所以首先要把关闭相关的逻辑抽离出来：

```typescript
    function handleClose() {
        newMessage.setAttribute(
            'class',
            `lew-notification lew-notification-${type} lew-notification-hidden`,
        );
        setTimeout(() => {
            LewMessageDom?.removeChild(newMessage);
        }, 250);
    }
```

因为我们需要一个可以控制的关闭延时，所以应该把关闭的定时器抽离出来：

```typescript
 let timer: (() => void) | undefined = undefined;

    function startTimer() {
        if (delay > 0) {
            ({ stop: timer } = useTimeoutFn(() => {
                handleClose();
            }, delay));
        }
    }

    // 给关闭图标添加关闭事件
    newMessage.children[0].children[2].addEventListener('click', handleClose);

    setTimeout(() => {
        newMessage.setAttribute(
            'class',
            `lew-notification lew-notification-${type} lew-notification-show`,
        );
        delay > 0 && startTimer();
    }, 10);
```

然后加一点小细节，鼠标移入时清空计时器，移出时再重新添加计时器：

```js
function clearTimer() {
  timer?.()
}
newMessage.addEventListener('mouseenter', clearTimer)
newMessage.addEventListener('mouseleave', startTimer)
```

完整的代码如下

```typescript
import '../styles/index.scss';
import { useTimeoutFn } from '@vueuse/core';

export type NotificationParamsTyped = {
    title: string;
    content: string;
    delay?: number;
};

export type NotificationFn = (options: NotificationParamsTyped) => void;

export interface NotificationInstance {
    name: string;
    warning: NotificationFn;
    info: NotificationFn;
    normal: NotificationFn;
    success: NotificationFn;
    error: NotificationFn;
}

const warning = ({ title, content, delay = 3000 }: NotificationParamsTyped) => {
    notification('warning', title, content, delay);
};

const error = ({ title, content, delay = 3000 }: NotificationParamsTyped) => {
    notification('error', title, content, delay);
};

const info = ({ title, content, delay = 3000 }: NotificationParamsTyped) => {
    notification('info', title, content, delay);
};

const normal = ({ title, content, delay = 3000 }: NotificationParamsTyped) => {
    notification('normal', title, content, delay);
};

const success = ({ title, content, delay = 3000 }: NotificationParamsTyped) => {
    notification('success', title, content, delay);
};

const createMessageList = () => {
    const div: HTMLDivElement = document.createElement('div');
    div.setAttribute('id', 'lew-notification');
    document.body.appendChild(div);
};

const notification = (
    type: string,
    title: string,
    content: string,
    delay: number,
) => {
    if (!document.getElementById('lew-notification')) {
        createMessageList();
        notification(type, title, content, delay);
    } else {
        add(type, title, content, delay);
    }
};

const add = (type: string, title: string, content: string, delay: number) => {
    const LewMessageDom = document.getElementById('lew-notification');
    const newMessage = document.createElement('div');
    const svgArr: any = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2zm0 1.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 0 0 0-17zm-1.25 9.94l4.47-4.47a.75.75 0 0 1 1.133.976l-.073.084l-5 5a.75.75 0 0 1-.976.073l-.084-.073l-2.5-2.5a.75.75 0 0 1 .976-1.133l.084.073l1.97 1.97l4.47-4.47l-4.47 4.47z" fill="currentColor"></path></g></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M10.91 2.782a2.25 2.25 0 0 1 2.975.74l.083.138l7.759 14.009a2.25 2.25 0 0 1-1.814 3.334l-.154.006H4.243a2.25 2.25 0 0 1-2.041-3.197l.072-.143L10.031 3.66a2.25 2.25 0 0 1 .878-.878zm9.505 15.613l-7.76-14.008a.75.75 0 0 0-1.254-.088l-.057.088l-7.757 14.008a.75.75 0 0 0 .561 1.108l.095.006h15.516a.75.75 0 0 0 .696-1.028l-.04-.086l-7.76-14.008l7.76 14.008zM12 16.002a.999.999 0 1 1 0 1.997a.999.999 0 0 1 0-1.997zM11.995 8.5a.75.75 0 0 1 .744.647l.007.102l.004 4.502a.75.75 0 0 1-1.494.103l-.006-.102l-.004-4.502a.75.75 0 0 1 .75-.75z" fill="currentColor"></path></g></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M12 2c5.523 0 10 4.478 10 10s-4.477 10-10 10S2 17.522 2 12S6.477 2 12 2zm0 1.667c-4.595 0-8.333 3.738-8.333 8.333c0 4.595 3.738 8.333 8.333 8.333c4.595 0 8.333-3.738 8.333-8.333c0-4.595-3.738-8.333-8.333-8.333zm-.001 10.835a.999.999 0 1 1 0 1.998a.999.999 0 0 1 0-1.998zM11.994 7a.75.75 0 0 1 .744.648l.007.101l.004 4.502a.75.75 0 0 1-1.493.103l-.007-.102l-.004-4.501a.75.75 0 0 1 .75-.751z" fill="currentColor"></path></g></svg>`,
        normal: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002c0 5.523-4.478 10.001-10.002 10.001C6.476 22.002 2 17.524 2 12.001C1.999 6.477 6.476 1.999 12 1.999zm0 1.5a8.502 8.502 0 1 0 0 17.003A8.502 8.502 0 0 0 12 3.5zm-.004 7a.75.75 0 0 1 .744.648l.007.102l.004 5.502a.75.75 0 0 1-1.494.102l-.006-.101l-.004-5.502a.75.75 0 0 1 .75-.75zm.005-3.497a.999.999 0 1 1 0 1.997a.999.999 0 0 1 0-1.997z" fill="currentColor"></path></g></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none"><path d="M12 1.996a7.49 7.49 0 0 1 7.496 7.25l.004.25v4.097l1.38 3.156a1.249 1.249 0 0 1-1.145 1.75L15 18.502a3 3 0 0 1-5.995.177L9 18.499H4.275a1.251 1.251 0 0 1-1.147-1.747L4.5 13.594V9.496c0-4.155 3.352-7.5 7.5-7.5zM13.5 18.5l-3 .002a1.5 1.5 0 0 0 2.993.145l.007-.147zM12 3.496c-3.32 0-6 2.674-6 6v4.41L4.656 17h14.697L18 13.907V9.509l-.003-.225A5.988 5.988 0 0 0 12 3.496z" fill="currentColor"></path></g></svg>`,
        close: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144"></path><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 144L144 368"></path></svg>`,
    };
    newMessage.innerHTML = `
                <div class="lew-notification-box">
                    <div class="lew-notification-icon">
                      ${svgArr[type]}
                    </div>
                    <div class="lew-notification-body">
                      <div class="lew-notification-title">${title}</div>
                      ${
                          content
                              ? '<div class="lew-notification-content">' +
                                content +
                                '</div>'
                              : ''
                      }
                    </div> 
                    <div class="lew-notification-close-icon">
                      ${svgArr.close}
                    </div>
                </div>
    `;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    LewMessageDom?.appendChild(newMessage, LewMessageDom?.childNodes[0]);

    newMessage.setAttribute(
        'class',
        `lew-notification lew-notification-${type}`,
    );

    let timer: (() => void) | undefined = undefined;

    function startTimer() {
        if (delay > 0) {
            ({ stop: timer } = useTimeoutFn(() => {
                handleClose();
            }, delay));
        }
    }

    function clearTimer() {
        timer?.();
    }

    function handleClose() {
        newMessage.setAttribute(
            'class',
            `lew-notification lew-notification-${type} lew-notification-hidden`,
        );
        setTimeout(() => {
            LewMessageDom?.removeChild(newMessage);
        }, 250);
    }

    newMessage.children[0].children[2].addEventListener('click', handleClose);
    newMessage.addEventListener('mouseenter', clearTimer);
    newMessage.addEventListener('mouseleave', startTimer);

    setTimeout(() => {
        newMessage.setAttribute(
            'class',
            `lew-notification lew-notification-${type} lew-notification-show`,
        );
        delay > 0 && startTimer();
    }, 10);
};

export default {
    name: 'LewNotification',
    warning,
    info,
    normal,
    success,
    error,
} as NotificationInstance;

```

整体来看这个组件的功能还是太简单了，而且存在很多问题，比如内容的 dom 元素都是用 `innerHtml` 来添加的，所以想要给里面的元素绑定事件会有些不直观。后期这部分我认为还是应该重构为 Vue 组件，可以极大的提高可维护性。
