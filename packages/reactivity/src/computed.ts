/* eslint-disable */
/* tslint-disable */
import { isFunction } from "@vue/shared";
import { ReactiveEffect, track, trackEffects } from "./effect";

class ComputedRefImpl {
  public effect: any;
  public _dirty = true;

  public __v_isReadonly = true;
  public __v_isRef = true;
  public _value: any;
  public dep = new Set();
  constructor(getter: any, public setter: any) {
    // 将用户的getter放到effect中，这里面所包含的响应数据就会被这个effect收集起来
    this.effect = new ReactiveEffect(getter, () => {
        // 依赖属性的调度使用scheduler
        if (!this._dirty) {
          this._dirty = true;

          // 实现一个触发更新
          trackEffects(this.dep);
        }
    });
    // 类的属性访问器，底层就是 Object.defineProperty
  }

  get value() {
    trackEffects(this.dep);
    // track(this, 'get', 'value')
    if (this._dirty) {
      this._dirty = false;
      this._value = this.effect.run();
    }
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue)
  }
}

export const computed = (getterOrOptions: any) => {
  // 有两种情况，只有 getter 和 两种都有
  let onlyGetter = isFunction(getterOrOptions);
  let getter;
  let setter;
  if (onlyGetter) {
    getter = onlyGetter;
    setter = () => {
      console.warn("no set");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }

  return new ComputedRefImpl(getter, setter);
};

