import {clone} from "./utils.js";


/**
 * 将对象变成一个声明式的属性
 *
 * @param obj
 * @returns {string}
 */

export function generateCode(obj) {
    let str = '';
    for (const prop in obj) {
        str += 'let ' + prop + ' =' + JSON.stringify(clone(obj[prop])) + ';';
    }
    return str;
}

/**
 * 判断表达式的结果式否为真
 * @param codeRes
 * @param expressValue
 * @returns {boolean}
 */
export function isTrue(codeRes,expressValue){
    let bool = false;
    let code = codeRes;
    // 通过自主构建一个执行环境，让代码执行，得出结果
    code += 'if(' + expressValue +'){bool = true}';
    eval(code);
    return bool;
}
