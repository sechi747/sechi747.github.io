---
title: "《TypeScript进阶》笔记"
description: ""
uid: 517
createTime: 2022/10/23 21:43:15
updateTime: 2022/10/23 21:43:15
tag: ['Typescript']
---
:ArticleToc
:ArticleHeader

# 原始类型与对象类型

```typescript
const name: string = 'sechi';
const age: number = 24;
const male: boolean = false;
const undef: undefined = undefined;
const nul: null = null;
const obj: object = { name, age, male };
const bigintVar1: bigint = 9007199254740991n;
const bigintVar2: bigint = BigInt(9007199254740991);
const symbolVar: symbol = Symbol('unique');
```

在没有开启`strictNullChecks`的情况下，`null` 和 `undefined` 会被认为是其他类型的子类型。

### 数组

数组类型：

```typescript
const arr1: string[] = [];
const arr2: Array<string> = [];
// 元组
const arr4: [string, number, boolean] = ['sechi', 599, true];
```

元组会对数组的合法边界的索引进行校验。

```typescript
const arr6: [string, number?, boolean?] = ['sechi'];
// 下面这么写也可以
// const arr6: [string, number?, boolean?] = ['sechi', , ,];
type TupleLength = typeof arr6.length; // 1 | 2 | 3
```

对于标记为可选的成员，在 `--strictNullCheckes` 配置下会被视为一个 `string | undefined` 的类型。此时元组的长度属性也会发生变化，比如上面的元组 arr6 ，其长度的类型为 `1 | 2 | 3`

### interface

```typescript
interface IDescription {
  readonly name: string;
  age: number;
}

const obj3: IDescription = {
  name: 'sechi',
  age: 599,
};
// 无法分配到 "name" ，因为它是只读属性
obj3.name = "747";
```

其实在数组与元组层面也有着只读的修饰，但与对象类型有着两处不同。

- 你只能将整个数组/元组标记为只读，而不能像对象那样标记某个属性为只读。
- 一旦被标记为只读，那这个只读数组/元组的类型上，将不再具有 push、pop 等方法（即会修改原数组的方法），因此报错信息也将是**类型 xxx 上不存在属性“push”这种**。这一实现的本质是**只读数组与只读元组的类型实际上变成了 ReadonlyArray，而不再是 Array。**

interface 用来描述**对象、类的结构**，而类型别名(type)用来**将一个函数签名、一组联合类型、一个工具类型等等抽离成一个完整独立的类型**。

### object、Object 以及 { }

```typescript
// 对于 undefined、null、void 0 ，需要关闭 strictNullChecks
const tmp1: Object = undefined;
const tmp2: Object = null;
const tmp3: Object = void 0;

const tmp4: Object = 'sechi';
const tmp5: Object = 599;
const tmp6: Object = { name: 'sechi' };
const tmp7: Object = () => {};
const tmp8: Object = [];
```

和 Object 类似的还有 Boolean、Number、String、Symbol，这几个**装箱类型（Boxed Types）** 同样包含了一些超出预期的类型。以 String 为例，它同样包括 undefined、null、void，以及代表的 **拆箱类型（Unboxed Types）** string，但并不包括其他装箱类型对应的拆箱类型，如 boolean 与 基本对象类型,**在任何情况下都不应该使用这些装箱类型。**

```typescript
const tmp9: String = undefined;
const tmp10: String = null;
const tmp11: String = void 0;
const tmp12: String = 'sechi';

// 以下不成立，因为不是字符串类型的拆箱类型
const tmp13: String = 599; // X
const tmp14: String = { name: 'sechi' }; // X
const tmp15: String = () => {}; // X
const tmp16: String = []; // X
```

object 的引入就是为了解决对 Object 类型的错误使用，它代表**所有非原始类型的类型，即数组、对象与函数类型这些**：

```typescript
const tmp17: object = undefined;
const tmp18: object = null;
const tmp19: object = void 0;

const tmp20: object = 'sechi';  // X 不成立，值为原始类型
const tmp21: object = 599; // X 不成立，值为原始类型

const tmp599: object = { name: 'sechi' };
const tmp23: object = () => {};
const tmp24: object = [];
```

最后是`{}`，一个奇奇怪怪的空对象，可以认为`{}`就是一个对象字面量类型或者可以认为使用`{}`作为类型签名就是一个合法的，但**内部无属性定义的空对象**，这类似于 Object，它意味着任何非 null / undefined 的值：

```typescript
const tmp25: {} = undefined; // 仅在关闭 strictNullChecks 时成立，下同
const tmp26: {} = null;
const tmp27: {} = void 0; // void 0 等价于 undefined

const tmp28: {} = 'sechi';
const tmp29: {} = 599;
const tmp30: {} = { name: 'sechi' };
const tmp31: {} = () => {};
const tmp32: {} = [];
// 虽然能够将其作为变量的类型，但实际上无法对这个变量进行任何赋值操作
tmp30.age = 18; // X 类型“{}”上不存在属性“age”。
```

当某个变量的具体类型仅能确定它不是原始类型时，可以使用 object。但更推荐进一步区分，也就是使用 `Record<string, unknown>` 或 `Record<string, any>` 表示对象，`unknown[]` 或 `any[]` 表示数组，`(...args: any[]) => any`表示函数。

# 字面量类型与枚举

### 字面量类型

**字面量类型（Literal Types）**，它代表着比原始类型更精确的类型，同时也是原始类型的子类型。字面量类型主要包括**字符串字面量类型**、**数字字面量类型**、**布尔字面量类型**和**对象字面量类型**，它们可以直接作为类型标注：

```typescript
interface Tmp {
  bool: true | false;
  num: 1 | 2 | 3;
  str: "a" | "b" | "c"
}

const tmp: Tmp = {
    bool: true,
    num: 2,
    str: "c"
}
```

### 联合类型

**联合类型（Union Types）**，它代表了**一组类型的可用集合**，只要最终赋值的类型属于联合类型的成员之一，就可以认为符合这个联合类型：

```typescript
interface Tmp {
  mixed: true | string | 599 | {} | (() => {}) | (1 | 2)
}
```

- 对于联合类型中的函数类型，需要使用括号`()`包裹起来
- 函数类型并不存在字面量类型，因此这里的 `(() => {})` 就是一个合法的函数类型
- 可以在联合类型中进一步嵌套联合类型，但这些嵌套的联合类型最终都会被展平到第一级中

联合类型的常用场景之一是通过多个对象类型的联合，来实现手动的互斥属性，即这一属性如果有字段1，那就没有字段2：

```typescript
interface Tmp {
  user:
    | {
        vip: true;
        expires: string;
      }
    | {
        vip: false;
        promotion: string;
      };
}

declare var tmp: Tmp;

if (tmp.user.vip) {
  console.log(tmp.user.expires);
}
```

### 对象字面量类型

类似的，对象字面量类型就是一个对象类型的值。当然，这也就意味着这个对象的值全都为字面量值：

```typescript
interface Tmp {
  obj: {
    name: "linbudu",
    age: 18
  }
}

const tmp: Tmp = {
  obj: {
    name: "linbudu",
    age: 18
  }
}
```

如果要实现一个对象字面量类型，意味着完全的实现这个类型每一个属性的每一个值。对象字面量类型在实际开发中的使用较少，只需要了解。

需要注意的是，**无论是原始类型还是对象类型的字面量类型，它们的本质都是类型而不是值**。它们在编译时同样会被擦除，同时也是被存储在内存中的类型空间而非值空间。

### 枚举

```typescript
enum PageUrl {
  Home_Page_Url = "url1",
  Setting_Page_Url = "url2",
  Share_Page_Url = "url3",
}

const home = PageUrl.Home_Page_Url;
```

如果没有声明枚举的值，它会默认使用数字枚举，并且从 0 开始，以 1 递增：

```typescript
enum Items {
  Foo,
  Bar,
  Baz
}
console.log(Items.Foo) // 0
console.log(Items.Bar) // 1
```

如果只为某一个成员指定了枚举值，那么之前未赋值成员仍然会使用从 0 递增的方式，之后的成员则会开始从枚举值递增：

```typescript
enum Items {
  // 0 
  Foo,
  Bar = 599,
  // 600
  Baz
}
```

在数字型枚举中，可以使用延迟求值的枚举值，比如函数：

```typescript
const returnNum = () => 100 + 499;

enum Items {
  Foo = returnNum(),
  Bar = 599,
  Baz
}
```

但要注意，延迟求值的枚举值是有条件的。**如果你使用了延迟求值，那么没有使用延迟求值的枚举成员必须放在使用常量枚举值声明的成员之后（如上例），或者放在第一位**：

```typescript
enum Items {
  Baz,
  Foo = returnNum(),
  Bar = 599,
}
```

枚举和对象的重要差异在于，**对象是单向映射的**，我们只能从键映射到键值。而**枚举是双向映射的**，即你可以从枚举成员映射到枚举值，也可以从枚举值映射到枚举成员：

```typescript
enum Items {
  Foo,
  Bar,
  Baz
}

const fooValue = Items.Foo; // 0
const fooKey = Items[0]; // "Foo"

// 编译后
"use strict";
var Items;
(function (Items) {
    Items[Items["Foo"] = 0] = "Foo";
    Items[Items["Bar"] = 1] = "Bar";
    Items[Items["Baz"] = 2] = "Baz";
})(Items || (Items = {}));
```

但需要注意的是，仅有值为数字的枚举成员才能够进行这样的双向枚举，**字符串枚举成员仍然只会进行单次映射**

常量枚举和枚举相似，只是其声明多了一个 `const`：

```typescript
const enum Items {
  Foo,
  Bar,
  Baz
}

const fooValue = Items.Foo; // 0

// 编译后
const fooValue = 0 /* Foo */; // 0
```

它和普通枚举的差异主要在访问性与编译产物。对于常量枚举，你**只能通过枚举成员访问枚举值**（而不能通过值访问成员）。同时，在编译产物中并不会存在一个额外的辅助对象（如上面的 Items 对象），对枚举成员的访问会被**直接内联替换为枚举的值**。

# 函数与Class

## 函数

### 函数的类型签名

```typescript
type FuncFoo = (name: string) => number

function foo(name: string): number {
  return name.length;
}

const foo: FuncFoo = (name) => {
  return name.length
}
```

如果只是为了描述函数的类型结构时，可以使用 `interface` 来进行函数声明，此时的 `interface` 被称为 `Callable Interface` 

```typescript
interface FuncFooStruct {
  (name: string): number
}
```

### void返回值

```typescript
// 没有调用 return 语句
function foo(): void { }

// 调用了 return 语句，但没有返回值
function bar(): undefined {
  return;
}
```

**在 TypeScript 中，undefined 类型是一个实际的、有意义的类型值，而 void 才代表着空的、没有意义的类型值。即void代表函数没有进行返回操作，undefined代表函数进行了返回操作但并没有返回实际的值**

### 可选参数与rest参数

 ```typescript
 // 在函数逻辑中注入可选参数默认值
 function foo1(name: string, age?: number): number {
   const inputAge = age || 18; // 或使用 age ?? 18
   return name.length + inputAge
 }
 
 // 直接为可选参数声明默认值
 function foo2(name: string, age: number = 18): number {
   const inputAge = age;
   return name.length + inputAge
 }
 
 function foo3(arg1: string, ...rest: [number, boolean]) { }
 foo3("sechi", 18, true)
 ```

**可选参数必须位于必选参数之后**

### 函数重载

```typescript
function func(foo: number, bar?: boolean): string | number {
  if (bar) {
    return String(foo);
  } else {
    return foo * 599;
  }
}
// Overload Signature
function func(foo: number, bar: true): string;
function func(foo: number, bar?: false): number;
function func(foo: number, bar?: boolean): string | number {
  if (bar) {
    return String(foo);
  } else {
    return foo * 599;
  }
}
```

- `function func(foo: number, bar: true): string`，重载签名一，传入 bar 的值为 true 时，函数返回值为 string 类型。
- `function func(foo: number, bar?: false): number`，重载签名二，不传入 bar，或传入 bar 的值为 false 时，函数返回值为 number 类型。
- `function func(foo: number, bar?: boolean): string | number`，函数的实现签名，会包含重载签名的所有可能情况。

作用： 提供更准确的类型标注能力

这里有一个需要注意的地方，拥有多个重载声明的函数在被调用时，是按照重载的声明顺序往下查找的。因此在第一个重载声明中，为了与逻辑中保持一致，即在 bar 为 true 时返回 string 类型，这里我们需要将第一个重载声明的 bar 声明为必选的字面量类型，如果将第一个重载声明的 bar 参数也加上可选符号，然后就会发现第一个函数调用错误地匹配到了第一个重载声明。

### 异步函数、Generator函数等类型签名

```typescript
async function asyncFunc(): Promise<void> {}

function* genFunc(): Iterable<void> {}

async function* asyncGenFunc(): AsyncIterable<void> {}
```

## class

### 类与类成员的类型签名

```typescript
class Foo {
  prop: string;

  constructor(inputProp: string) {
    this.prop = inputProp;
  }

  print(addon: string): void {
    console.log(`${this.prop} and ${addon}`)
  }

  get propA(): string {
    return `${this.prop}+A`;
  }

  // setter方法不允许进行返回值的类型标注，因为它是一个只关注过程的函数 
  set propA(value: string) {
    this.prop = `${value}+A`
  }
}
```

### 修饰符

`public / private / protected / readonly` 前三种属于访问性修饰符， readonly属于操作性修饰符

- public：此类成员在**类、类的实例、子类**中都能被访问。
- private：此类成员仅能在**类的内部**被访问。
- protected：此类成员仅能在**类与子类中**被访问。

```typescript
class Foo {
  public arg1: string;
  private arg2: boolean;
    
  constructor(arg1: string, arg2: boolean) {
    this.arg1 = arg1;
    this.arg2 = arg2;
  }
}

// 可以在构造函数中对参数应用访问性修饰符
class Foo {
  constructor(public arg1: string, private arg2: boolean) { }
}
```

### 静态成员

```typescript
class Foo {
  static staticHandler() { }

  public instanceHandler() { }
}

// babel编译后
var Foo = /** @class */ (function () {
    function Foo() {
    }
    Foo.staticHandler = function () { };
    Foo.prototype.instanceHandler = function () { };
    return Foo;
}());
```

不用于实例成员，在类的内部静态成员无法通过 `this` 访问，需要通过 `Foo.staticHandler` 进行访问。

从编译后的代码中可以看到，**静态成员直接被挂载在函数体上**，而**实例成员挂载在原型上**，这就是二者的最重要差异：**静态成员不会被实例继承，它始终只属于当前定义的这个类（以及其子类）**。而原型对象上的实例成员则会**沿着原型链进行传递**，也就是能够被继承。

### 继承、实现、抽象类

```typescript
// 基类
class Base { }
// 派生类
class Derived extends Base { }
```

派生类中可以访问到使用 `public` 或 `protected` 修饰符的基类成员。除了访问以外，基类中的方法也可以在派生类中被覆盖，但仍然可以通过 super 访问到基类中的方法：

```typescript
class Base {
  print() { }
}

class Derived extends Base {
  print() {
    super.print()
    // ...
  }
}
```

但在派生类中覆盖基类方法时，并不能确保派生类的这一方法能覆盖基类方法，因为基类中可能不存在这个方法，这时需要使用 `override` 关键字：

```typescript
class Base {
  printWithLove() { }
}

class Derived extends Base {
  // ts报错，因为尝试覆盖的方法并未在基类中声明
  override print() {
    // ...
  }
}
```

抽象类是对类结构与方法的抽象，简单来说，**一个抽象类描述了一个类中应当有哪些成员（属性、方法等）**，**一个抽象方法描述了这一方法在实际实现中的结构**。

```typescript
// 抽象类中的成员必须使用 abstract 关键字且无法使用static修饰符
abstract class AbsFoo {
  abstract absProp: string;
  abstract get absGetter(): string;
  abstract absMethod(name: string): string
}

class Foo implements AbsFoo {
  absProp: string = "linbudu"

  get absGetter() {
    return "linbudu"
  }

  absMethod(name: string) {
    return name
  }
}
```

抽象类本质上是在描述类的结构，所以也可以使用 `interface` 实现类似的效果：

```typescript
interface FooStruct {
  absProp: string;
  get absGetter(): string;
  absMethod(input: string): string
}

class Foo implements FooStruct {
  absProp: string = "linbudu"

  get absGetter() {
    return "linbudu"
  }

  absMethod(name: string) {
    return name
  }
}
```

除此以外，我们还可以使用 **Newable Interface** 来描述一个类的结构（类似于描述函数结构的 **Callable Interface**）：

```typescript
class Foo { }

interface FooStruct {
  new(): Foo
}

declare const NewableFoo: FooStruct;

const foo = new NewableFoo();
```

# any & unknown & never & 类型断言

### any

```typescript
// 被标记为 any 类型的变量可以拥有任意类型的值
let anyVar: any = "linbudu";

anyVar = false;
anyVar = "linbudu";
anyVar = {
  site: "juejin"
};

anyVar = () => { }

// 标记为具体类型的变量也可以接受任何 any 类型的值
const val1: string = anyVar;
const val2: number = anyVar;
const val3: () => {} = anyVar;
const val4: {} = anyVar;
```

`any` 类型可以兼容所有类型，也能够被所有类型兼容。

> any 的本质是类型系统中的顶级类型，即 Top Type

- 如果是类型不兼容报错导致你使用 any，考虑用类型断言替代。
- 如果是类型太复杂导致你不想全部声明而使用 any，考虑将这一处的类型去断言为你需要的最简类型。如你需要调用 `foo.bar.baz()`，就可以先将 foo 断言为一个具有 bar 方法的类型。
- 如果你是想表达一个未知类型，更合理的方式是使用 unknown。

### unknown

```typescript
let unknownVar: unknown = "linbudu";

unknownVar = false;
unknownVar = "linbudu";
unknownVar = {
  site: "juejin"
};

unknownVar = () => { }

const val1: string = unknownVar; // Error
const val2: number = unknownVar; // Error
const val3: () => {} = unknownVar; // Error
const val4: {} = unknownVar; // Error

const val5: any = unknownVar;
const val6: unknown = unknownVar;

let unknownVar: unknown;
unknownVar.foo(); // 报错：对象类型为 unknown
```

`unknown` 类型的变量可以再次赋值为任意其它类型，但只能赋值给 `any` 与 `unknown` 类型的变量

> unknown 的本质也是顶级类型
>

### never

与 `void` 的区别：`void` 作为类型表示一个空类型，就像没有返回值的函数使用 `void` 来作为返回值类型标注一样，它就像 JavaScript 中的 `null` 一样代表“这里有类型，但是个空类型”。而 `never` 才是一个“什么都没有”的类型，它甚至不包括空的类型，严格来说，**never 类型不携带任何的类型信息**，因此会在联合类型中被直接移除。

```typescript
declare let v1: never;
declare let v2: void;

v1 = v2; // X 类型 void 不能赋值给类型 never

v2 = v1;
```

在编程语言的类型系统中，`never` 类型被称为 **Bottom Type**，是**整个类型系统层级中最底层的类型**。和 `null`、`undefined` 一样，它是所有类型的子类型，**但只有 never 类型的变量能够赋值给另一个 never 类型变量**。

使用场景：

```typescript
function justThrow(): never {
  throw new Error()
}

function foo (input:number){
  if(input > 1){
    justThrow();
    // 在类型流的分析中，一旦一个返回值类型为 never 的函数被调用，那么下方的代码都会被视为无效的代码
    const name = "linbudu";
  }
}
```

### 类型断言

```typescript
let unknownVar: unknown;
(unknownVar as { foo: () => {} }).foo();

interface IFoo {
  name: string;
}

declare const obj: {
  foo: IFoo
}

const {
  foo = {} as IFoo
} = obj
```

### 双重断言

```typescript
const str: string = "linbudu";
// error
(str as { handler: () => {} }).handler()
// 双重断言，先断言到unknown再断言到预期类型
(str as unknown as { handler: () => {} }).handler();
// 使用尖括号断言
(<{ handler: () => {} }>(<unknown>str)).handler();
```

### 非空断言

```typescript
declare const foo: {
  func?: () => ({
    prop?: number | null;
  })
};
// 使用起来类似于?.可选链
foo.func!().prop!.toFixed();
// 上面的非空断言等价于
((foo.func as () => ({
  prop?: number;
}))().prop as number).toFixed();

// 非空断言的常见场景
const element = document.querySelector("#id")!;
const target = [1, 2, 3, 599].find(item => item === 599)!;
```











