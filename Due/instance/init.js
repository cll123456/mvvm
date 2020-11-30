import {proxyData} from "./proxy.js";
import {mount} from "./mount.js";

/**
 * 一个混合的方法
 * @param Due
 */
let uid = 0;

export function initInMinix(Due) {
    Due.prototype.__init = function (options) {
        // vm 是虚拟节点
        let vm = this;
        // 每一个虚拟节点都有唯一一个uid
        vm.uid = getRandomNum() + uid++;
        // 是否为due节点
        vm.isDue = true;
        // 初始化methods
        if (!!(options && options.methods)) {
            vm.__methods = options.methods;
        }
        if (!!(options && options.created)) {
            vm.__created = options.created;
        }
        if (!!(options && options.computed)) {
            vm.__computed = options.computed;
        }
        // 返回一个代理
        // 创建一个data
        if (!!(options && options.data)) {
            vm.__data = proxyData(vm, options.data, "");
        }

        // 进行挂载
        if (!!(options && options.el)) {
            let vm = this;
            let domNode = document.getElementById(options.el);
            // 挂载节点
            mount(vm, domNode);
        }

    }
}

/**
 * 获取随机数
 * @returns {string}
 */
function getRandomNum() {
    return Date.now() + Math.random().toString(16).substring(2, 10);
}
