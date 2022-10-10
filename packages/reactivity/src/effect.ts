// import { ReactiveEffect } from "vue";

export let activeEffect = undefined as any;
class ReactiveEffect {
  // 在实例上新增 active 属性
  public active = true; // 默认激活状态

  // 替代 以前的 栈记录 嵌套执行 effect 方式
  public parent = null;

  // 记录 effect 依赖了哪些属性，方便清除 --> 3.r
  public deps = [];

  // public 相当于用户传递参数会被赋予 this.fn
  constructor(public fn: any) {}

  // 执行 effect
  run() {
    if (!this.active) {
      this.fn(); // 如果非激活状态，直接执行函数，不需要进行依赖收集
    }

    // 依赖收集， 将当前的 effect 和 稍后渲染的属性关联
    try {
      // 记录当前的执行effect parent
      this.parent = activeEffect;
      activeEffect = this;
      return this.fn();
      // 方便稍后调用取值操作的时候，可以获取倒这个全局的activeEffect --> 2.r
    } catch (error) {
    } finally {
      // activeEffect = undefined;
      // 嵌套执行响应时，记录返回他的父亲
      activeEffect = this.parent;
      this.parent = null;
    }
  }

  stop() {
    this.active = false;
  }
}

export function effect(fn: any) {
  const _effect = new ReactiveEffect(fn);

  _effect.run();
}

// 对象某个属性 --> 多个 effect 渲染
// 一个 effect --> 对应多个对象属性
// 由于对象不能作为key，所以用 weakMap --> { 对象: Map{name: Set} }
const targetMap = new WeakMap();
// 依赖收集方法 这里不能用receiver，不然会死循环
export function track(target: object, type: any, key: any) {
    // 没调用effect不会进行收集
    if (!activeEffect) return;
    let desMap = targetMap.get(target); // 第一次没有
    if (!desMap) {
        targetMap.set(target, (desMap = new Map());
    }
    let dep = desMap.get(key);
    // 如果没用收集过
    if (!dep) {
        // 设置一个 set 用来存放该属性 effect 的收集
        desMap.set(key, (dep = new Set()));
    }

    let showTrack = !dep.has(activeEffect); // 去重
    if (showTrack) {
        dep.add(activeEffect);
        // 3.r 如果 effect 被清除应该dep也删除. 在这里做记录，清理的时候好清理  -- flag ? this.name : this.age
        activeEffect.deps.push(dep);
    }
}