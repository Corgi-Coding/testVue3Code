import { isReactive } from "vue";
import { ReactiveEffect } from "./effect";
import { isObject, isFunction } from "@vue/shared";

function travelsal(value: any, set = new Set()) {
    if (!isObject(value)) return value;
    if (set.has(value)) {
        return value;
    }
    set.add(value);
    for (let key in value) {
        travelsal(value[key], set);
    }
    return value;
}

// watch 和 effect 很像，但是会保存老值和新值
export function watch(source: any, cb: (arg0?: any, arg1?: any) => void) {
    let getter;
    if (isReactive(source)) {
        // 对传入数据进行递归循环，只要循环就会访问倒对象的所有属性
        getter = () => travelsal(source);
    } else if (isFunction(source)) {
        getter = source;
    } else {
        return
    }
    let cleanup: any;
    const onCleanup = (fn: any) => {
        cleanup = fn;
    }

    let oldValue: any;
    const job = () => {
        if (cleanup) {
            cleanup(); // 下一次watch调用上一次的cleanup
        }
        const newValue = effect.run();
        cb(newValue, oldValue, onCleanup);
        oldValue = newValue;
    }

    const effect = new ReactiveEffect(getter, job);

    return effect.run();
}
