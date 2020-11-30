// 判断传入的是否为对象
const isObj = obj => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

// 一个订阅构造函数
function Dep() {
  // 用一个set或者数据来记录依赖关系
  this.recordsSets = new Set();
}
// 收集依赖
Dep.prototype.denpend = function () {
  if (currentExcuseFunc) {
    this.recordsSets.add(currentExcuseFunc);
  }
}
// 通知依赖执行
Dep.prototype.notify = function () {
  // 执行依赖
  this.recordsSets.forEach(fn => fn());
}

let currentExcuseFunc = null;
// 自动执行, 用于执行依赖关系
function autorun(fn) {
  // // 获取当前执行的函数
  // currentExcuseFunc = fn;
  // // 执行函数
  // fn();
  // currentExcuseFunc = null;

  // 为了 动态收集依赖，需要从新运行
  function funcWrapper(){
    currentExcuseFunc = funcWrapper;
    fn();
    currentExcuseFunc = null;
  }
  funcWrapper();
}

// 一个观察者模式
function observe(obj) {
  if (!isObj(obj)) {
    return;
  }
  // 遍历obj的多个数据
  Object.keys(obj).forEach(key => {
    let originValue = obj[key];
    observe(originValue) // 继续保持为响应式
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      get() {
        // 收集依赖
        dep.denpend();
        return originValue;
      },
      set(val) {
        observe(val)
        originValue = val;
        // 发出通知去执行
        dep.notify();
      }
    })
  })
}


let obj = {
  name: 'cll',
  age: 23,
  sex: 'male',
  addr: {
    counter: 'China',
    city: 'JX'
  }
}

observe(obj);

autorun(() => {
  // console.log(obj.name, obj.addr.city, obj.addr.counter,'--------');
  if(obj.age % 2 === 0){
    console.log(obj.name);
  }else{
    console.log(obj.sex);
  }
})




