import {getValueByTemplateName} from "../util/utils.js";


/**
 * 检查节点中是否含有v-on事件
 * @param vm
 * @param vNode
 */

export function checkVOn(vm, vNode) {
    // 如果不是标签节点，直接返回
    if (vNode.nodeType !== 1) {
        return;
    }
    // 获取节点的属性名称
    let getVNodePropsNameArr = vNode.elm.getAttributeNames();
    // 判断里面是否包含 v-on: 或者 @
    for (let i = 0; i < getVNodePropsNameArr.length; i++) {
        if (getVNodePropsNameArr[i].indexOf('v-on:') > -1 || getVNodePropsNameArr[i].indexOf('@') > -1) {
            let eventType = getVNodePropsNameArr[i].indexOf('v-on:') > -1 ? getVNodePropsNameArr[i].split(':')[1] : getVNodePropsNameArr[i].split('@')[1]
            vOn(vm, vNode, eventType, vNode.elm.getAttribute(getVNodePropsNameArr[i]))
        }
    }
}

/**
 * 绑定事件
 * @param vm
 * @param vNode
 * @param eventType
 * @param funcName
 */
function vOn(vm, vNode, eventType, funcName) {
    let getFunction = getValueByTemplateName(vm.__methods, funcName);
    if (getFunction) {
        document.addEventListener(eventType, proxyFunction(vm, getFunction))
    }
}

/**
 * 代理一个方法
 * @param vm
 * @param funcName
 * @returns {function(): void}
 */
function proxyFunction(vm, funcName) {
    return function () {
        funcName.call(vm);
    }
}
