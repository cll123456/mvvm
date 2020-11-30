import {setValue} from "../util/utils.js";

/**
 * 实现v-model
 * @param vm
 * @param elm
 * @param props
 */
export function vModel(vm, elm, props) {
    elm.onchange = function (e) {
        setValue(vm.__data, props, elm.value)
    }
    elm.oninput = function (e) {
        setValue(vm.__data, props, elm.value)
    }
}
