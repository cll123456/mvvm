// 挂载节点
import CreateVNode from "../vDom/createVNode.js";
import {clearMap, prepareRender, vNode2Template} from "./render.js";
import {vModel} from "../grammer/vModel.js";
import {initVFor} from "../grammer/vFor.js";
import {mergeObj} from "../util/utils.js";
import {renderVNode} from "./render.js";
import {checkedVBind} from "../grammer/vBind.js";
import {checkVOn} from "../grammer/vOn.js";

/**
 * 对外提供一个$mount的挂载方法，在传教虚拟节点的同时可以先不挂载，在想要挂载的时候进行挂载
 * @param Due
 */
export function initMount(Due) {
    Due.prototype.$mount = function (el) {
        let vm = this;
        let rootDom = document.getElementById(el);
        mount(vm, rootDom);
    }
}

/**
 * 挂载节点并且获取虚拟的dom节点
 * @param vm 挂载到那个虚拟dom 上
 * @param elm 真实的dom跟节点
 */
export function mount(vm, elm) {
    // 获取一个虚拟的跟节点
    vm.__vNode = createVDom(vm, elm, null);
    // 节点挂载完毕后，需要准备dom渲染
    prepareRender(vm, vm.__vNode);
}

/**
 * 创建一个虚拟dom树
 * @param vm 挂载的due实例
 * @param elm 真实的dom节点
 * @param parent 父级节点
 */
function createVDom(vm, elm, parent) { // 需要使用树的深度优先搜索
    // 分析节点的属性，是否含有v-model, v-if等
    // 进行节点的挂载
    let vNode = analysisAttrsProp(vm, elm, parent);
    // 如果没有虚拟节点，则创建一个
    if (!vNode) {
        let children = [];
        let tag = elm.nodeName;
        let text = getNodeText(elm);
        let nodeType = elm.nodeType;
        let data = null;
        vNode = new CreateVNode(tag, elm, children, parent, nodeType, text, data);
        if (elm.nodeType === 1 && elm.getAttribute('env')) {
            vNode.env = mergeObj(vNode.env, JSON.parse(elm.getAttribute('env')));
        } else {
            vNode.env = mergeObj(vNode.env, parent ? parent.env : {});
        }
    }
    // 绑定v-bind属性
    checkedVBind(vm, vNode);
    // 绑定v-on事件
    checkVOn(vm, vNode);
    let childs = vNode.nodeType == 0 ? vNode.parent.elm.childNodes : vNode.elm.childNodes;
    for (let i = 0, l = childs.length; i < l; i++) {
        let childrenNode = createVDom(vm, childs[i], vNode);
        if (childrenNode instanceof CreateVNode) {
            vNode.children.push(childrenNode);
        } else {
            // 如果获取到的子节点是一个数组，将数组进行合并
            vNode.children = vNode.children.concat(childrenNode);
        }
    }
    return vNode;
}

/**
 * 获取文本节点的内容
 * @param elm
 * @returns {string|any}
 */
function getNodeText(elm) {
    if (elm.nodeType === 3) {
        return elm.nodeValue;
    } else {
        return '';
    }
}

/**
 * 在挂载虚拟dom节点的时候，分析节点的属性是否含有v-model, v-for等
 * @param vm
 * @param elm
 * @param parent
 */
function analysisAttrsProp(vm, elm, parent) {
    // 如果不是标签节点直接返回
    if (elm.nodeType !== 1) {
        return;
    }
    let attrProps = elm.getAttributeNames();
    if (attrProps.indexOf('v-model') > -1) {
        return vModel(vm, elm, elm.getAttribute('v-model'));
    } else if (attrProps.indexOf('v-for') > -1) {
        // 存在v-for指令
        return initVFor(vm, elm, elm.getAttribute('v-for'), parent);
    }
}

/**
 * 重新构建节点
 * @param vm
 * @param templateName
 */
export function rebuildNode(vm, templateName) {
    // 通过模板名称或者节点
    let vNode = vNode2Template.get(templateName);
    // 可能拿到有多个节点
    for (let i = 0; i < vNode.length; i++) {
        // 把旧的节点给清理掉
        vNode[i].parent.elm.innerHTML = "";
        // 把虚拟的节点继续挂载到父级那边去
        vNode[i].parent.elm.appendChild(vNode[i].elm);
        // 重新构建节点
        let resNode = createVDom(vm, vNode[i].elm, vNode[i].parent);
        vNode[i].parent.children = [resNode];
        clearMap();
        // 由于删掉了映射关系，需要重新渲染整个虚拟节点
        prepareRender(vm, vm.__vNode);
        renderVNode(vm, vm.__vNode);
        checkedVBind(vm, vm.__vNode);
    }
}


