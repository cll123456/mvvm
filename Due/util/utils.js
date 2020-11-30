/**
 * 通过模板的名字获取对应的值
 * @param obj {Object}
 * @param templateName {String} 模板名字
 */
export function getValueByTemplateName(obj, templateName) {
    if (!obj) {
        return obj;
    }
    // templateName 可能为a.b.v
    let propsArr = templateName.split('.');
    let temp = obj;
    for (let i = 0, l = propsArr.length; i < l; i++) {
        if (temp[propsArr[i]]) {
            temp = temp[propsArr[i]];
        } else {
            return null;
        }
    }
    return temp;
}

/**
 * 修改指定属性的值
 * @param obj {Object} 数据对象
 * @param props {String} 属性名
 * @param value {String} 需要修改的值
 * @returns {undefined|*}
 */
export function setValue(obj, props, value) {
    if (!obj) {
        return obj;
    }
    let temp = obj;
    // 获取倒数第二个属性
    let propsArr = props.split('.');
    for (let i = 0, l = propsArr.length - 1; i < l; i++) {
        if (temp[propsArr[i]]) {
            temp = obj[propsArr[i]];
        } else {
            return undefined;
        }
    }
    // 判断需要修改的那个属性里最后一个属性存在
    if (temp[propsArr[propsArr.length - 1]] !== null) {
        // 修改值
        temp[propsArr[propsArr.length - 1]] = value;
    }
}

/**
 * 合并对象
 * @param obj1
 * @param obj2
 * @returns {{}|*}
 */
export function mergeObj(obj1, obj2) {
    if (!obj1 && !obj2) {
        return {};
    }
    if (!obj1) {
        return clone(obj2);
    }
    if (!obj2) {
        return clone(obj1);
    }
    let getObj1Attr = Object.getOwnPropertyNames(obj1);
    let getObj2Attr = Object.getOwnPropertyNames(obj2);
    let res = {};
    for (let i = 0; i < getObj1Attr.length; i++) {
        res[getObj1Attr[i]] = obj1[getObj1Attr[i]];
    }
    for (let i = 0; i < getObj2Attr.length; i++) {
        res[getObj2Attr[i]] = obj2[getObj2Attr[i]];
    }
    return res;

}

/**
 * 克隆的方法
 * @param obj
 * @returns {*}
 */
export function clone(obj) {
    if (obj instanceof Array || obj.__proto__.eleType === 'Array') {
        return cloneArray(obj);
    } else if (obj instanceof Object) {
        return cloneObj(obj)
    } else {
        return obj;
    }
}

/**
 * 克隆对象
 * @param obj
 * @returns {{}}
 */
function cloneObj(obj) {
    let res = {};
    // 获取对象里面的所有属性，包括对象里面的属性
    let objAttr = Object.getOwnPropertyNames(obj);
    for (let i = 0; i < objAttr.length; i++) {
        res[objAttr[i]] = clone(obj[objAttr[i]]);
    }
    return res;
}

/**
 * 克隆数组
 * @param array
 * @returns {[]}
 */
function cloneArray(array) {
    let arr = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
        arr[i] = clone(array[i]);
    }
    return arr;
}
