---
title: "Typescript装饰器的分类及使用"
description: ""
uid: 525
createTime: 2023/03/08 06:50:48
updateTime: 2023/03/08 06:50:48
tag: ['Typescript']
---
:ArticleToc
:ArticleHeader

本文包含的内容：装饰器的分类、装饰器与装饰器工厂、装饰器的执行顺序以及两个装饰器的应用

## 装饰器的分类

### 类装饰器

类型声明：

```typescript
type ClassDecorator = <TFunction extends Function>
  (target: TFunction) => TFunction | void;
```

类装饰器只有一个参数：`target`，也就是类的构造器。

如果类装饰器有返回值，那么它将被用来替代原有的类构造器的声明，因此类装饰器适用于继承一个现有类并添加一些属性和方法。

```typescript
type Consturctor = { new (...args: any[]): any };

function toString<T extends Consturctor>(BaseClass: T) {
  console.log(BaseClass === C) // true
  return class extends BaseClass {
    public num = 77
    
    toString() {
      return JSON.stringify(this);
    }
  };
}

@toString
class C {
  public foo = "foo";
  public num = 24;
}

console.log(new C().toString()) // {"foo":"foo","num":77}
```

但装饰器存在一个缺陷：没有类型保护，也就是说：

```typescript
declare function Blah<T>(target: T): T & {foo: number}

@Blah
class Foo {
  bar() {
    return this.foo; // Property 'foo' does not exist on type 'Foo'
  }
}

new Foo().foo; // Property 'foo' does not exist on type 'Foo'
```

这是[一个TypeScript的已知的缺陷](https://github.com/microsoft/TypeScript/issues/4881)。 临时解决方案是额外提供一个类用于提供类型信息：

```typescript
declare function Blah<T>(target: T): T & {foo: number}

class Base {
  foo: number;
}

@Blah
class Foo extends Base {
  bar() {
    return this.foo;
  }
}

new Foo().foo;
```

### 属性装饰器

类型声明：

```typescript
type PropertyDecorator =
  (target: Object, key: string | symbol) => void;
```

属性装饰器有两个参数：

1. `target` 当装饰静态成员时，它是类的构造器；当装饰实例成员时，它是类的原型对象
2. `key` 被装饰的属性名

属性装饰器没有返回值，即使有也会被忽略。

```typescript
function decorateAttr(target: any, key: string) {
  console.log(target === A)
  console.log(target === A.prototype)
  console.log(key)
}
class A {
  @decorateAttr // 输出 true false staticAttr
  static staticAttr: any
  @decorateAttr // 输出 false true instanceAttr
  instanceAttr: any
}
```

除了收集信息外，还可以用属性装饰器来给类添加额外的方法和属性：

```typescript
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function observable(target: any, key: string): any {
  // prop -> onPropChange
  const targetKey = "on" + capitalizeFirstLetter(key) + "Change";

  target[targetKey] =
    function (fn: (prev: any, next: any) => void) {
      let prev = this[key];
      Reflect.defineProperty(this, key, {
        set(next) {
          fn(prev, next);
          prev = next;
        }
      })
    };
}

class C {
  @observable
  foo = -1;

  @observable
  bar = "bar";
}

const c = new C();

c.onFooChange((prev, next) => console.log(`prev: ${prev}, next: ${next}`))
c.onBarChange((prev, next) => console.log(`prev: ${prev}, next: ${next}`))

c.foo = 100; // prev: -1, next: 100
c.foo = -3.14; // prev: 100, next: -3.14
c.bar = "baz"; // prev: bar, next: baz
c.bar = "sing"; // prev: baz, next: sing
```

### 方法装饰器

类型声明：

```typescript
type MethodDecorator = <T>(
  target: Object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => TypedPropertyDescriptor<T> | void;

// tips
interface TypedPropertyDescriptor<T> {
    enumerable?: boolean;
    configurable?: boolean;
    writable?: boolean;
    value?: T;
    get?: () => T;
    set?: (value: T) => void;
}
```

方法装饰器有三个参数：

1. `target` 当装饰静态成员时，它是类的构造器；当装饰实例成员时，它是类的原型对象
2. `key` 被装饰的属性名
3. `descriptor` 属性的描述器，即`Object.getOwnPropertyDescriptor(target,key)`

如果方式装饰器有返回值，那么它将被用来替代属性的描述器(descriptor)。

我们可以通过 `descriptor` 参数改变原本方法的实现，添加一些共用逻辑：

```typescript
function logger(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;

  descriptor.value = function (...args) {
    console.log('params: ', ...args);
    const result = original.call(this, ...args);
    console.log('result: ', result);
    return result;
  }
}

class C {
  @logger
  add(x: number, y:number ) {
    return x + y;
  }
}

const c = new C();
c.add(1, 2); // params: 1, 2 // result: 3

function decorateMethod(target: any, key: string, descriptor: PropertyDescriptor){
  return{
    value: function(...args: any[]){
        const result = descriptor.value.apply(this, args) * 2;
        return result;
    }
  }
}
class A {
  @decorateMethod
  sum(x: number,y: number){
    return x + y
  }
}
console.log(new A().sum(1,2))  // 6
```

### 访问器装饰器

访问器装饰器和方法装饰器很接近，唯一的区别在于描述器(descriptor)中的某些 key 不同：

方法装饰器的描述器的key为：

- `value`
- `writable`
- `enumerable`
- `configurable`

访问器装饰器的描述器的key为：

- `get`
- `set`
- `enumerable`
- `configurable`

通过访问器装饰器我们可以将某个属性设为不可变值：

```typescript
function immutable(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.set;

  descriptor.set = function (value: any) {
    return original.call(this, { ...value })
  }
}

class C {
  private _point = { x: 0, y: 0 }

  @immutable
  set point(value: { x: number, y: number }) {
    this._point = value;
  }

  get point() {
    return this._point;
  }
}

const c = new C();
const point = { x: 1, y: 1 }
c.point = point;

console.log(c.point) // { "x": 1, "y": 1 }
console.log(c.point === point) // false
```

或者让某个属性不可更改：

```typescript
function configurable (target: any, key: string, descriptor: PropertyDescriptor) {
  return {
    writable: false
  }
};
class A {
  _age = 18
  @configurable
  get age(){
     return this._age
  }
  set age(num: number){
     this._age = num
  }
}
const a = new A()
a.age = 20   // TypeError: Cannot assign to read only property 'age'
```

### 参数装饰器

类型声明：

```typescript
type ParameterDecorator = (
  target: Object,
  key: string | symbol,
  parameterIndex: number
) => void;
```

参数装饰器有三个参数：

1. `target` 当装饰静态成员时，它是类的构造器；当装饰实例成员时，它是类的原型对象
2. `key` 被装饰的属性名**（是方法名而不是参数名）**
3. `parameterIndex` 参数在方法中所处位置的下标

参数装饰器没有返回值，即使有也会被忽略。

单独的参数装饰器能做的事情很有限，它一般都被用于记录可被其它装饰器使用的信息。

## 装饰器与装饰器工厂

### 普通装饰器

```typescript
interface Person {
  name: string
  age: string
}

function classDecorator(target: any) {
  target.prototype.name = 'sechi'
  target.prototype.age = '23'
}

@classDecorator
class Person {
  constructor() { }
}

const p = new Person()
console.log(p.name) // sechi
console.log(p.age) // 23
```

### 装饰器工厂

不同类型的装饰器本身的参数是固定的，当我们需要自定义装饰器参数时（也就是说需要给装饰器传参），便可以构造一个装饰器工厂函数：

```typescript
interface Person {
  name: string
  age: string
}

function classDecorator(name: string, age: number) {
  return function(target: any) {
      target.prototype.name = name
      target.prototype.age = age
  }
}

@classDecorator('genji', 30)
class Person {
  constructor() { }
}

const p = new Person()
console.log(p.name) // genji
console.log(p.age) // 30
```

## 装饰器的执行顺序

### 执行时机

装饰器只在**解释执行时**应用一次：

```typescript
function f(C) {
  console.log('apply decorator')
  return C
}

@f
class A {}
// 输出 apply decorator
```

上面代码中我们并没有去构造 `A` 的实例，但装饰器函数依旧运行了一次。

### 执行顺序

**装饰器工厂函数从上至下**开始执行，**装饰器函数从下至上**开始执行。可以把这个执行顺序简单理解为一个**洋葱模型**。

```typescript
function first() {
  console.log("first(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called");
  };
}

class ExampleClass {
  @first()
  @second()
  method() {}
}
// first(): factory evaluated
// second(): factory evaluated
// second(): called
// first(): called
```

上面只是一个粗略的执行顺序，实际上不同类型的装饰器执行次序也不同。

1. 实例成员：参数/方法/属性装饰器（三种装饰器没有先后顺序，谁先声明就先执行谁）
2. 静态成员：参数/方法/属性装饰器（三种装饰器没有先后顺序，谁先声明就先执行谁）
3. 构造器：参数装饰器
4. 类装饰器

```typescript
function f(key: string): any {
  console.log("evaluate: ", key);
  return function () {
    console.log("call: ", key);
  };
}

@f("Class Decorator")
class C {
  @f("Static Property")
  static prop?: number;

  @f("Static Method")
  static method(@f("Static Method Parameter") foo) {}

  constructor(@f("Constructor Parameter") foo) {}

  @f("Instance Method")
  method(@f("Instance Method Parameter") foo) {}

  @f("Instance Property")
  prop?: number;
}
```

打印信息：

```bash
evaluate:  Instance Method
evaluate:  Instance Method Parameter
call:  Instance Method Parameter
call:  Instance Method
evaluate:  Instance Property
call:  Instance Property
evaluate:  Static Property
call:  Static Property
evaluate:  Static Method
evaluate:  Static Method Parameter
call:  Static Method Parameter
call:  Static Method
evaluate:  Class Decorator
evaluate:  Constructor Parameter
call:  Constructor Parameter
call:  Class Decorator
```

## 例子

### 一、运行时检查参数类型

如果我们想给接口添加运行时检查类型的能力，可以通过结合使用不同的装饰器来达成这一目的，总的来说分为两个步骤：

1. 使用参数装饰器来标记需要检查的参数
2. 使用方法装饰器来改变方法的 `descriptor` 的值，使得方法执行前先运行参数检查器，如果检查不通过就抛出异常，如果通过了就正常执行方法。

```typescript
type Validator = (x: any) => boolean;

// 存储每个方法的参数检查器
const validateMap: Record<string, Validator[]> = {};

// 1. 标记需要检查的参数
function typedDecoratorFactory(validator: Validator): ParameterDecorator {
  return (_, key, index) => {
    const target = validateMap[key as string] ?? [];
    target[index] = validator;
    validateMap[key as string] = target;
  }
}

function validate(_: Object, key: string, descriptor: PropertyDescriptor) {
  const originalFn = descriptor.value;
  descriptor.value = function(...args: any[]) {

    // 2. 运行检查器
    const validatorList = validateMap[key];
    if (validatorList) {
      args.forEach((arg, index) => {
        const validator = validatorList[index];

        if (!validator) return;

        const result = validator(arg);

        if (!result) {
          throw new Error(
            `Failed for parameter: ${arg} of the index: ${index}`
          );
        }
      });
    }

    // 3. 运行原有的方法
    return originalFn.call(this, ...args);
  }
}

const isInt = typedDecoratorFactory((x) => Number.isInteger(x));
const isString = typedDecoratorFactory((x) => typeof x === 'string');

class C {
  @validate
  sayRepeat(@isString word: string, @isInt x: number) {
    return Array(x).fill(word).join('');
  }
}

const c = new C();
c.sayRepeat('hello', 2); // pass
c.sayRepeat('', 'lol' as any); // throw an error
```

### 二、统一的try/catch

一般来讲，我们都需要写一个 `try/catch` 来包裹 `async/await` 函数以便抛出错误，但通过方法装饰器我们可以消除繁琐的 `try/catch` 来统一抛错。

```typescript
function log (target: any, key: string, descriptor: PropertyDescriptor){
    return {
        value: async function (...args) {
          try{
            await descriptor.value.apply(this, args)
          }catch(e){
            console.log(e)
          }
        }
    };
};

class A {
  @log
  asyncHandle(){
    return Promise.reject('Async Error')
  }
}

new A().asyncHandle() // Async Error
```



> 参考文章：
>
> 1. https://mirone.me/zh-hans/a-complete-guide-to-typescript-decorator/
> 2. https://jelly.jd.com/article/6163d8bac3f2f4019154ee94
> 3. https://juejin.cn/post/7006483808832716813#comment



















