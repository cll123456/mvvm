// vue3的响应式原理

// 对象使用一个map来接受， key为obj, value为map, map 里面的key 为属性值， value是收集的依赖，
const targetMap = new WeakMap();
// 当前执行的函数
let currentExcuseFunc = null;
// 判断传入的是否为对象
const isObj = obj => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

// 用于缓存对象的属性，如果存在直接返回，不存在直接返回一个代理，里面的结构式 key:obj, value: proxyobj
const cacheMapper = new WeakMap();

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

// 自动执行，用于去看哪些依赖为引用
function effect(fn) {
  function funcWrapper() {
    currentExcuseFunc = funcWrapper;
    fn();
    currentExcuseFunc = null;
  }
  funcWrapper();
}


// 观察者模式
function reviewer(obj) {
  // 通过代理来做
  if (!isObj(obj)) {
    return obj;
  }

  // 获取一个代理对象
  let getObj = cacheMapper.get(obj)
  if (getObj) {
    // 如果存在直接返回
    return getObj;
  }
  // 不存在new 一个代理
  getObj = new Proxy(obj, {
    get(target, key) {
      // 收集依赖
      track(target, key);
      // 返回的也需要一个代理， 不会无法遍历对象里面的对象
      return reviewer(Reflect.get(target, key));
    },
    set(target, key, value) {
      // 设置的值，也需要是一个代理
      Reflect.set(target, key, reviewer(value));
      trigger(target, key); // 发出通知，执行依赖
    },
    // 删除一个属性
    deleteProperty(target, key){
      Reflect.deleteProperty(target, key);
      trigger(target, key);
    }
  })
  cacheMapper.set(obj, getObj);
  return getObj;
}



let obj = reviewer({
  name: 'cll',
  age: 23,
  addr: {
    counter: 'China',
    city: 'JX'
  }
})


effect(() => {
  console.log(obj.name, obj.addr.city, obj.addr.counter, '---')
})

obj.name = 'chen' // --> chen JX China ---
obj.addr.city = '中国' // --> chen 中国 China ---
obj.sex = 'male' // 不会有打印