import { isObject } from "@vue/shared";
import { ReactFlags, mutableHandles } from "./baseHandler";

// 将数据转化为响应式数据，只能代理对象类型，弱引用
const reactiveMap = new WeakMap();

// vue2 defineProperty  弊端： 只能监听已经被定义的对象属性，如果对象属性未被定义，需要用 $set
export function reactive(target: any) {
    if (!isObject(target)) {
        return;
    }

    // 当已经被代理过时，会返回原对象 --> 1.r
    if (target[ReactFlags.IS_REACTIVE]) {
        return target;
    }

    // 防止重复赋予响应值，节省性能
    let existingProxy = reactiveMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }

    const proxy = new Proxy(target, mutableHandles);

    reactiveMap.set(target, proxy);

    // 返回代理对象
    return proxy;
}
