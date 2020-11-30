// 此文件为 收集 依赖 和 执行已经收集依赖

// 一个订阅构造函数
function Dep() { 
  // 用一个set或者数据来记录依赖关系
  this.recordsSets = new Set();
}
// 收集依赖
Dep.prototype.denpend = function () { 
  if(currentExcuseFunc){
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
function autorun(fn){
  // 获取当前执行的函数
currentExcuseFunc = fn;
// 执行函数
fn();
currentExcuseFunc = null;
}

const dep = new Dep();
autorun(() => {
  dep.denpend();
  console.log('run1');
})

autorun(() => {
  dep.denpend();
  console.log('run2');
})


dep.notify(); // --> run1 run2
dep.notify(); // --> run1 run2