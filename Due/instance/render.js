// 渲染模块

import {getValueByTemplateName} from "../util/utils.js";
import {checkedVBind} from "../grammer/vBind.js";

/**
 * 准备渲染模块
 * @param vm
 * @param vNode
 */
export function prepareRender(vm, vNode) {
    // 需要判断当前的节点类型，如果是文本节点，获取文本里面的内容，如果是标签节点，需要递归获取里面的文本节点
    if (vNode === null) {
        return;
    } else if (vNode.nodeType === 1 && vNode.tag === 'INPUT') {
        analysisAttr(vm, vNode)
    } else if (vNode.nodeType === 1 && vNode.elm.getAttributeNames().find(item => item.indexOf(':') > -1)) {
        // 如果里面存在v-bind，需要进行映射
        setVBindMapper(vm, vNode);
    } else if (vNode.nodeType === 3) {
        // 如果是文本节点，进行分析
        analysisNodeText(vNode);
    } else if (vNode.nodeType === 0) {
        setMapper('{{' + vNode.data + '}}', vNode)
        for (let i = 0, l = vNode.children.length; i < l; i++) {
            prepareRender(vm, vNode.children[i]);
        }
    } else {
        // 如果是其他的标签文本，遍历子节点继续找文本节点
        for (let i = 0, l = vNode.children.length; i < l; i++) {
            prepareRender(vm, vNode.children[i]);
        }
    }
}

export const template2VNode = new Map();
export const vNode2Template = new Map();

/**
 * 分析节点字符串
 * @param vNode
 */
function analysisNodeText(vNode) {
    let templateStringList = vNode.text.match(/{{[a-zA-Z0-9_. ]+}}/g);
    // 遍历获取到的模板字符串，然后做节点与模板映射， 模板与节点映射
    for (let i = 0, l = templateStringList && templateStringList.length; i < l; i++) {
        setMapper(templateStringList[i], vNode);
    }
}

/**
 * 分析input框的属性
 * @param vNode
 */
function analysisAttr(vm, vNode) {
    let attrs = vNode.elm.getAttributeNames();
    if (attrs.indexOf('v-model')) {
        setTemplate2VNode("{{" + vNode.elm.getAttribute('v-model') + '}}', vNode)
        setVNode2Template("{{" + vNode.elm.getAttribute('v-model') + '}}', vNode)
    }
}

/**
 * 通过模板名称找到对应的节点名称
 * @param template
 * @param vNode
 */
function setTemplate2VNode(template, vNode) {
    let templateName = template.substring(2, template.length - 2).trim();
    let getVNodeByTemplateName = vNode2Template.get(templateName);
    if (getVNodeByTemplateName) {
        getVNodeByTemplateName.push(vNode);
    } else {
        vNode2Template.set(templateName, [vNode]);
    }
}

/**
 * 通过节点找到对应的模板
 * @param template
 * @param vNode
 */
function setVNode2Template(template, vNode) {
    let getTemplateByVNode = template2VNode.get(vNode);
    if (getTemplateByVNode) {
        getTemplateByVNode.push(template.substring(2, template.length - 2).trim());
    } else {
        template2VNode.set(vNode, [template.substring(2, template.length - 2)]);
    }
}

/**
 * 渲染混合
 * @param Due
 */
export function renderMixin(Due) {
    Due.prototype.__render = function () {
        renderVNode(this, this.__vNode);
    }
}

/**
 * 渲染节点
 * @param vm
 * @param vNode
 */
export function renderVNode(vm, vNode) {
    // 判断传入的节点类型，如果是文本节点进行渲染，如果是标签节点则继续递归找到文本节点
    if (vNode.nodeType === 3) {
        // 文本节点
        // 对节点进行分析，渲染到页面上
        // 获取模板与节点的对应值
        let getTemplateListByVNode = template2VNode.get(vNode);
        if (getTemplateListByVNode) {
            // 通过模板去获取值，然后替换模板的值
            let nodeText = vNode.text;

            for (let i = 0, l = getTemplateListByVNode.length; i < l; i++) {
                let getTemplateNameValue = getTemplateValue([vm.__data, vNode.env], getTemplateListByVNode[i].trim());
                if (getTemplateNameValue) {
                    nodeText = nodeText.replace("{{" + getTemplateListByVNode[i] + "}}", getTemplateNameValue);
                }
            }
            vNode.elm.nodeValue = nodeText;
        }
    } else if (vNode.nodeType === 1 && vNode.tag === 'INPUT') {
        let getTemplateValueList = template2VNode.get(vNode);
        if (getTemplateValueList) {
            for (let i = 0; i < getTemplateValueList.length; i++) {
                let inputValue = getTemplateValue([vm.__data, vNode.env], getTemplateValueList[i].trim());
                if (inputValue) {
                    vNode.elm.value = inputValue;
                }
            }
        }
    } else {
        // 标签节点，继续递归查找文本节点
        for (let i = 0, l = vNode.children && vNode.children.length; i < l; i++) {
            renderVNode(vm, vNode.children[i]);
        }
    }
}

/**
 * 获取模板的值
 * @param objList
 * @param templateName
 * @returns {Object|null|*}
 */
function getTemplateValue(objList, templateName) {
    if (!objList) {
        return objList;
    }
    for (let i = 0; i < objList.length; i++) {
        let temp = getValueByTemplateName(objList[i], templateName);
        if (temp !== null) {
            return temp;
        }
    }
    return null;
}

/**
 * 更新节点，当数据发生改变的时候，更新节点
 * @param vm {Object}
 * @param templateName {String} 属性名的名称
 */
export function updateRenderVNode(vm, templateName) {
    let getVNodeList = vNode2Template.get(templateName);
    if (getVNodeList) {
        for (let i = 0; i < getVNodeList.length; i++) {
            renderVNode(vm, getVNodeList[i]);
            checkedVBind(vm, getVNodeList[i])
        }
    }
}

/**
 * 清除映射关系
 */
export function clearMap() {
    vNode2Template.clear();
    template2VNode.clear();
}

/**
 * 进行映射
 * @param templateName
 * @param vNode
 */
export function setMapper(templateName, vNode) {
    setTemplate2VNode(templateName, vNode);
    setVNode2Template(templateName, vNode);
}

/**
 * 设置vBind的映射
 * @param vm
 * @param vNode
 */
function setVBindMapper(vm, vNode) {
    let props = vNode.elm.getAttributeNames();
    for (let i = 0; i < props.length; i++) {
        if (props[i].indexOf(':') > -1) {
            let propsValue = vNode.elm.getAttribute(props[i]).trim();
            // {red: styleObj.x === 1, blue: styleObj.x > 1}  || vBindColor
            // 判断是否是一个表达式
            if (/^{[\w\W]+}$/.test(propsValue)) {
                propsValue = propsValue.trim();
                propsValue = propsValue.substring(1, propsValue.length - 1);
                let propsArr = propsValue.split(',');
                // 通过=== == > < = 来截取
                let arr = ['===', '>', '<', '==', '>=', '<='];
                for (let i = 0; i < propsArr.length; i++) {
                    // todo 没有意义 vue是通过底层的编译原理来解析的，又要给很重要的vue-compiler
                }
            } else {
                setMapper('{{' + propsValue + '}}', vNode);
            }
        }
    }
}
