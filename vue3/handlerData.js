// vue3通过 代理 proxy来处理对象里面的属性

// 判断传入的是否为对象
const isObj = obj => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

// 用于缓存对象的属性，如果存在直接返回，不存在直接返回一个代理，里面的结构式 key:obj, value: proxyobj
const cacheMapper = new WeakMap();



// 观察者模式
function reviewer(obj) {
  // 通过代理来做
  if(!isObj(obj)){
    return;
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
      console.log(`get ${key}: ${target[key]}`)
      // 返回的也需要一个代理， 不会无法遍历对象里面的对象
      return reviewer(Reflect.get(target, key));
    },
    set(target, key, value) {
      // 设置的值，也需要是一个代理
      Reflect.set(target, key, reviewer(value));
      console.log(`set ${key}: ${value}`);
    }
  })
  cacheMapper.set(obj, getObj);
  return getObj;

}

let obj = {
  name: 'cll',
  age: 23,
  addr: {
    counter: 'China',
    city: 'JX'
  }
}

const proxy = reviewer(obj);

proxy.name;  // --> get name: cll
proxy.age = 17; // --> set age: 17
proxy.addr.counter;  // --> get counter: China
proxy.addr.city = 'NC' // --> set city: NC