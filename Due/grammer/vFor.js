// 实现v-for的指令
// 分析思路， v-for里面的是 （item） in list list 是data里面的属性，而item不是

import CreateVNode from "../vDom/createVNode.js";
import {getValueByTemplateName} from "../util/utils.js";

export function initVFor(vm, elm, instructions, parent) {
    // 创建一个虚拟节点，使用红黑树的做法
    // 解析instructions,获取里面的属性
    let vNode = new CreateVNode(elm.nodeName, elm, [], parent, 0, '', getInstructionsData(instructions)[2])
    vNode.instructions = instructions;
    // 删除原有的节点
    parent.elm.removeChild(elm);
    // 由于删除了节点会破快原有的dom结构，我们需要手动补一个文本节点进去
    parent.elm.appendChild(document.createTextNode(''));
    // 在虚拟节点的env遍历上赋值，然后在返回虚拟节点
    // 分析虚拟节点，里面需要创建相应的节点个数
    let result = analysisVNode(vm, elm, instructions, parent);
    return vNode;
}

/**
 * 获取v-for 里面遍历的属性值，
 * @param instructions
 * @returns {*|string[]}
 */
function getInstructionsData(instructions) {
    let insArr = instructions.split(' ');
    if (!instructions || insArr.length !== 3 || insArr[1] !== 'in') {
        throw  new Error('您的v-for传入的指令有问题！');
    }
    return insArr;
}

/**
 * 分析虚拟节点
 * @param vm
 * @param elm
 * @param instructions
 * @param parent
 * @returns {Error|[]}
 */
function analysisVNode(vm, elm, instructions, parent) {
    let ins = getInstructionsData(instructions);
    // 需要重vm.__data里面获取值
    let dataArr = getValueByTemplateName(vm.__data, ins[2]);
    if (!dataArr) {
        throw new Error('获取v-for data的属性值不存在')
    }
    let result = []
    for (let i = 0; i < dataArr.length; i++) {
        // 创建真实的dom节点
        let domNode = document.createElement(elm.nodeName);
        domNode.innerHTML = elm.innerHTML;
        // 此时要给每一个domNode 里面的env 赋值, 每一个都是单独的
        let env = analysisKv(ins[0], dataArr[i], i);
        domNode.setAttribute('env', JSON.stringify(env));
        parent.elm.appendChild(domNode)
        result.push(domNode);
    }
    return result;
}

/**
 * 分析每一个遍历的dom里面的值
 * @param prop
 * @param value
 * @param index
 */
function analysisKv(prop, value, index) {
    // 对传入的prop 进行分析  可能有以下情况（item） item (item, index)
    if (/([a-zA-Z0-9 _$]+)/.test(prop)) {
        // 是否存在括号
        prop = prop.trim();
        prop = prop.substring(1, prop.length - 1);
    }
    // 后面的情况是带有 ，
    let obj = {};
    let propArr = prop.split(',');
    if (propArr.length >= 1) {
        obj[propArr[0].trim()] = value;
    }
    if (propArr.length >= 2) {
        obj[propArr[1].trim()] = index;
    }
    return obj;
}
