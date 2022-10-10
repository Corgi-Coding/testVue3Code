import { track } from "./effect";

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
    track(target, 'get', key);

    // Reflect 会把 this 改为代理对象，否则映射的还是原始对象， 也不能用 receiver[key] 会陷入死循环
    return Reflect.get(target, key, receiver);
  },
  set(target: object, key: PropertyKey, value: any, receiver: any) {
    // target[key] = value;
    // return true;

    // 会返回布尔值
    return Reflect.set(target, key, value, receiver);
  },
};

