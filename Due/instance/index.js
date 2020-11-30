/**
 * 提供一个全局的Due的函数
 * @param {*} options
 */
import {initInMinix} from "./init.js";
import {renderMixin} from "./render.js";

function Due(options) {
    this.__init(options)
    if (options.created) {
        this.created.call(this);
    }
    this.__render();
}

// 初始化数据
initInMinix(Due);
// 节点内容渲染
renderMixin(Due);

export default Due;
