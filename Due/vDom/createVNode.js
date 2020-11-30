export default class CreateVNode {

    /**
     *创建一个节点，需要的参数有
     * @param tag  标记节点的类型， 如： DIV, SPAN, 文本节点#TEXT 等
     * @param elm 对应真实的dom节点
     * @param children 对应虚拟的dom的子节点
     * @param parent 对应虚拟节点的父级节点
     * @param nodeType 节点类型
     * @param text 如果是文本节点那么节点的值
     * @param data 对应的vnode的数据，先保留
     */
    constructor(tag, elm, children, parent, nodeType, text, data) {
        this.tag = tag;
        this.elm = elm;
        this.children = children;
        this.parent = parent;
        this.nodeType = nodeType;
        this.text = text;
        this.data = data;
        this.env = {}; // 对应的节点执行的环境
        this.instructions = null; // 节点里面的指令
        this.template = []; // 节点里面涉及到的模板
    }
}
