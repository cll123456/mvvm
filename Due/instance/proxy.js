// 代理相关的操作
import {updateRenderVNode} from "./render.js";
import {rebuildNode} from "./mount.js";

let arrayProto = Array.prototype;
let validate = Object.prototype.toString;

export function proxyData(vm, obj, namespace) {
    // 定义一个代理
    let proxyRes = null;
    // 判断obj 是否为空，并且判断里面的data是不是一个对象还是一个数组
    if (validate.call(obj) === '[object Array]') {
        // 判断传入的是否一个数组
        proxyRes = new Array(obj.length);
        for (let i = 0; i < proxyRes.length; i++) {
            proxyRes[i] = proxyData(vm, obj[i], namespace);
        }
        proxyRes = proxyArr(vm, obj, namespace);
    } else if (validate.call(obj) === '[object Object]') {
        // 判断传入的是否一个object
        // 代理一个对象
        proxyRes = proxyObj(vm, obj, namespace);
    } else if (validate.call(obj) === '[object Number]'){
        return obj;
    } else {
        throw new Error('传入的data不是一个对象，也不是一个数组')
    }

    return proxyRes;
}


/**
 * 代理一个对象
 * @param vm due 对象
 * @param obj 需要代理的对象
 * @param namespace 命名空间，用于递归代理时候的名字
 */
function proxyObj(vm, obj, namespace) {
    let proxyRes = {};
    // 代理每一个属性
    for (let prop in obj) {
        Object.defineProperty(proxyRes, prop, {
            configurable: true,
            get() {
                return obj[prop];
            },
            set(value) {
                // 这里可以收到通知数据要改变了，改变的是哪个属性
                console.log(getProxyName(namespace, prop), '===obj==')
                obj[prop] = value;
                // 响应式数据改变模板里面的值
                updateRenderVNode(vm, getProxyName(namespace, prop))
            }
        })
        // 继续代理到vm上
        Object.defineProperty(vm, prop, {
            configurable: true,
            get() {
                return obj[prop];
            },
            set(value) {
                // 这里可以收到通知数据要改变了，改变的是哪个属性
                console.log(getProxyName(namespace, prop), '==vm===')
                obj[prop] = value;
                updateRenderVNode(vm, getProxyName(namespace, prop))
            }
        })

        // 判断属性里面的值是否为对象，如果是对象，需要递归进行代理
        if (obj[prop] instanceof Object) {
            proxyRes[prop] = proxyData(vm, obj[prop], getProxyName(namespace, prop))
        }
    }
    return proxyRes;
}

/**
 * 获取代理属性的名字，用于递归代理
 * @param namespace
 * @param nowPropName
 * @returns {string}
 */
function getProxyName(namespace = '', nowPropName = '') {
    if (!namespace) {
        return nowPropName;
    } else if (!nowPropName) {
        return namespace;
    } else {
        return namespace + '.' + nowPropName;
    }
}

/**
 * 代理数组
 * @param vm
 * @param array
 * @param namespace
 * @returns {*[]}
 */
function proxyArr(vm, array = [], namespace = '') {
    let arrayMethods = {
        eleType: 'Array',
        push: () => {
        },
        pop: () => {
        },
        shift: () => {
        },
        unshift: () => {
        },
        sort: () => {
        },
        reverse: () => {
        },
        splice: () => {
        }
    }

    // 将数组操作的一些基本方法给变异
    for (const argumentsKey in arrayMethods) {
        if (arrayProto[argumentsKey]) {
            proxyArrMethods.call(vm, arrayMethods, argumentsKey, namespace, vm)
        }
    }

    // 把当前传入的array的原型改成ArrayMethods, 变异方法
    array.__proto__ = arrayMethods;
    return array;
}

/**
 * 代理数组的变异方法
 * @param obj
 * @param funcName
 * @param namespace
 * @param vm
 */
function proxyArrMethods(obj, funcName, namespace, vm) {
    Object.defineProperty(obj, funcName, {
        enumerable: true, // 可枚举意味着可以北遍历
        configurable: true, // 可以配置，意味着可以加或者删除
        // 给一个自定义的方法赋值，赋值原来的方法
        value: function (...arg) {
            let originMethods = arrayProto[funcName];
            let res = originMethods.apply(this, arg);
            console.log(getProxyName(namespace, ''));
            rebuildNode(vm, getProxyName(namespace, ''))
            return res;
        }
    })
}
