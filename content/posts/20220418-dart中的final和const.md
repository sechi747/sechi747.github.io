---
title: "Dart 中的 final 和 const 的不同点"
description: ""
uid: 511
createTime: 2022/04/18 23:01:40
updateTime: 2022/04/18 23:01:40
tag: ['Dart']
---
:ArticleToc
:ArticleHeader

学习 dart 的时候对两个关键字的使用比较迷惑，一个是 `final`，一个是 `const`。查阅了一些资料后决定做一些简单的总结。

## 共同点

 `final` 和 `const` 都是用来定义常量的关键字，它们有以下共同点：

- 可以省略声明的类型
- 初始化之后不可再次赋值
- 不能和 `var` 同时使用

```dart
final a = 1;
const b = 1;
// 会直接在 IDE 中就报红
a = 2; 
b = 2;
```



## 不同点

1. 虽然 `final` 和 `const` 定义的常量在初始化后就不可以再被修改，但还是有细微的不同。常量的实质是指针不可修改，但是 `final` 定义的常量的“值”可以被修改，因为它只限定了指针不可修改，但并没有限定指针所指向的值不能修改。但是 `const` 定义的常量是真的不能修改。

   ```dart
   final a = [1, 2, 3];
   a[0] = 4;
   print(a); // [4, 2, 3]
   
   const b = [1, 2, 3];
   b[0] = 4; // Unsupported operation: Cannot modify an unmodifiable list
   ```

2. 使用 `const` 多次定义一个常量，它们的值其实是一样的。这也算是 dart 做的一种优化。

   ```dart
   const a = [1, 2];
   const b = [1, 2];
   print(a == b); // true
   
   const c = [1, 2];
   const d = [1, 2];
   print(c == d); // false
   ```

3. `const` 不仅可以定义变量（variable），还可以定义值（value）。也就是可以写在等号右边。而 `final` 则不可以。

   ```dart
   var a = const [1, 2];
   a[0] = 3;  // Unsupported operation: Cannot modify an unmodifiable list
   
   // 虽然常量值不可以修改，但是被赋予常量值的变量的值是可以修改的。
   a = [3, 4];
   print(a);  // [3, 4]
   ```

4. `const` 是编译时常量，必须在编译时就有一个确定的值。而 `final` 是运行时常量，他会在第一次使用时被初始化赋值。

   ```dart
   const a = 1 + 2; // ok
   
   var b = 4;
   const c = b + 1; // IDE 会报红
   
   const d = DateTime.now(); // IDE 会报红
   
   var x = 4;
   final y = x + 1; // ok
   
   final z = DateTime.now(); // ok
   ```

5. 修饰常量构造函数时必须使用 `const`

   ```dart
   void main() {
     const a = ConstObject(2);
     a.log(); // 2
   }
   
   class ConstObject {
     // 使用常量构造函数时要用 final 修饰类的成员
     final value;
   
     const ConstObject(this.value);
   
     log() {
       print(value);
     }
   }
   ```



纸上得来终觉浅。还是需要多敲几遍才能记得深刻~
