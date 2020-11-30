// vue3 使用 一个大的Mapper 来 做一一映射

// 对象使用一个map来接受， key为obj, value为map, map 里面的key 为属性值， value是收集的依赖，
const targetMap = new WeakMap();

// 收集依赖,需要传入对象，和对应的属性

/**
 * 记录当前正在执行的函数，依赖哪个对象的哪个属性
 * 相当于 dep.depend
 * @param {*} target
 * @param {*} key
 */
function track(target, key) {
  // 从map中获取对象
  let objMap = targetMap.get(target);
  if (!objMap) {
    objMap = new Map();
    // 把第二层的map放入weakmap中
    targetMap.set(target, objMap);
  }
  let valueSets = objMap.get(key);
  if (!valueSets) {
    // 建立一个set来存放依赖
    valueSets = new Set();
    objMap.set(key, valueSets);
  }
  if (currentExcuseFunc) {
    valueSets.add(currentExcuseFunc);
  }
}

// 发出通知，执行依赖，需要传入对象和对应的属性
/**
 * 依次触发依赖该对象该属性的所有函数
 * 相当于 dep.notify
 * @param {*} target
 * @param {*} key
 */
function trigger(target, key) {
   // 从map中获取对象
   let objMap = targetMap.get(target);
   if (!objMap) {
     return;
   }
   let valueSets = objMap.get(key);
   if (!valueSets) {
    return;
   }
   // 通知所有相关的依赖，执行
   valueSets.forEach(fn => fn())
}

let currentExcuFunc = null;
// 自动执行，用于去看哪些依赖为引用
function effect(fn) {
  function funcWrapper() {
    currentExcuseFunc = funcWrapper;
    fn();
    currentExcuseFunc = null;
  }

  funcWrapper();
}

let state = {
  name: 'cll',
  age: 12
}
effect(() => {
  track(state, 'name');
  console.log('name is ', state.name);
})

effect(() => {
  track(state, 'age');
  console.log('age is', state.age);
})

trigger(state, 'name');
trigger(state, 'age')