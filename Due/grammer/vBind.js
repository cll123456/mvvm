// 解析vBind
import {getValueByTemplateName, mergeObj} from "../util/utils.js";
import {generateCode, isTrue} from "../util/code.js";
import {setMapper, vNode2Template} from "../instance/render.js";

/**
 * 解析v-bind属性
 * @param vm
 * @param vNode
 */
export function checkedVBind(vm, vNode) {
    // 只有标签节点才有可能绑定v-bind
    if (vNode.nodeType !== 1) {
        return;
    }
    // 获取vNode中的属性值
    let props = vNode.elm.getAttributeNames();
    // 遍历数组并且判断里面是否存在v-bind
    for (let i = 0; i < props.length; i++) {
        if (props[i].indexOf('v-bind:') === 0 || props[i].indexOf(':') === 0) {
            // 解析v-bind里面的东西
            vBind(vm, vNode, props[i], vNode.elm.getAttribute(props[i]));
        }
    }
}

/**
 * 实现v-bind
 * @param vm
 * @param vNode
 * @param name
 * @param value
 */
function vBind(vm, vNode, name, value) {
    // 获取属性名 如v-bind:class 得到class
    let getProp = name.split(':')[1];
    // 判断传入的value是不是一个表达式，vue, 如果是{}开头就是表达式
    if (/^{[\w\W]+}$/.test(value)) {
        // 把value里面的大括号先去掉
        value = value.trim();
        value = value.substring(1, value.length - 1);
        // 通过逗号分隔，把对象里面的k v 给解析成一对
        let objArr = value.split(',');
        // 分析objArr 里面的表达式
        let result = analysisExpression(vm, vNode, objArr);
        vNode.elm.setAttribute(getProp, result);

    } else {

        // 通过value 去获取值
        let getValue = getValueByTemplateName(vm.__data, value);
        // 给属性赋值
        vNode.elm.setAttribute(getProp, getValue);
    }
}

/**
 * 分析表达式
 * @param vm
 * @param vNode
 * @param expressionList
 * @returns {string}
 */
function analysisExpression(vm, vNode, expressionList) {
    let result = '';
    // 因为考虑到这里面可以是表达式，可能是局部变量的值，或者是data里面的值
    let propObj = mergeObj(vm.__data, vNode.env);
    // 把 red: a > 1 blue: b < 2, 需要一个执行环境来执行， 然后把propsObj 转成一个字符串，使用eval() 这个执行环境
    let resCode = generateCode(propObj);
    for (let i = 0; i < expressionList.length; i++) {
        // 进行dom的映射
        let express = expressionList[i].split(':')[1].trim();
        if (express) {
            if (isTrue(resCode, express)) {
                result += expressionList[i].split(':')[0].trim() + ',';
            }
        }
    }
    if (result.length > 0) {
        result = result.substring(0, result.length - 1);
    }
    return result;
}
