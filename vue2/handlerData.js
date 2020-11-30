// 对于处理数据使用的是Object.defineProperty

// 判断传入的是否为对象
const isObj = obj => typeof obj === 'object' && obj !== null && !Array.isArray(obj);

function observe(obj){
  if(!isObj(obj)){
    return;
  }
  // 遍历obj的多个数据
  Object.keys(obj).forEach(key => {
    let originValue = obj[key];
    observe(originValue) // 继续保持为响应式
    Object.defineProperty(obj, key, {
      get(){
        console.log(`get ${key}: ${originValue}`) // 发出通知
        return originValue;
      },
      set(val){
        observe(val)
        originValue =  val;
        console.log(`set ${key}: ${val}`); // 发出通知
      }
    })
  })
}


let obj = {
  name: 'cll',
  age: 23,
  addr: {
    counter: 'China',
    city: 'JX'
  }
}

observe(obj);

obj.name;  // --> get name: cll
obj.age = 17; // --> set age: 17
obj.addr.counter;  // --> get counter: China
obj.addr.city = 'NC' // --> set city: NC