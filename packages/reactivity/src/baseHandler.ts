import { isObject } from "@vue/shared";
import { track, trigger } from "./effect";
import { reactive } from "./reactive";

export const enum ReactFlags {
  IS_REACTIVE = "__v_isReactive",
}

export const mutableHandles = {
  get(target: object, key: PropertyKey, receiver: any) {
    // return target[key];

    // 1.r 当被代理过的时候，会返回true；没被代理过不会执行这段
    if (key === ReactFlags.IS_REACTIVE) {
      return true;
    }

    // 进行依赖收集
    track(target, "get", key);

    // Reflect 会把 this 改为代理对象，否则映射的还是原始对象， 也不能用 receiver[key] 会陷入死循环
    let res = Reflect.get(target, key, receiver);

    if (isObject(res)) {
      // 取值就可以代理
      return reactive(res); // 对象要进行深度代理 性能好 取值就可以代理
    }
    return res;
  },
  set(target: object, key: PropertyKey, value: any, receiver: any) {
    // target[key] = value;
    // return true;

    let oldValue = target[key];
    // 会返回布尔值
    const result = Reflect.set(target, key, value, receiver);
    // 如果变动的值不等于旧值
    if (oldValue != value) {
      // 依赖更新
      trigger(target, "set", key, value, oldValue);
    }

    return result;
  },
} as any;
