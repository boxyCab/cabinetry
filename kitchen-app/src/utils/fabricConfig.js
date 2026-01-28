// fabric-patch.js
import { fabric } from 'fabric';

/**
 * ================================
 * 1️⃣ 安全扩展 toObject
 * ================================
 */
if (!fabric.Object.prototype._patchedToObject) {
  const originalToObject = fabric.Object.prototype.toObject;
  fabric.Object.prototype.toObject = function (propertiesToInclude) {
    return originalToObject.call(
      this,
      (propertiesToInclude || []).concat([
        'objectType',
        'cabinettype',
        'relatedId',
        'relatedId2',
        'rotation',
        'scale',
        'cabinetFlag',
        'widthcabinet',
        'cabheight',
        'objectname',
        'depth',
        'kitchen',
        'id',
      ])
    );
  };
  fabric.Object.prototype._patchedToObject = true;
}

/**
 * ================================
 * 2️⃣ Fabric 4/5/6 兼容 bringToFront
 * ================================
 */
export function bringToFrontSafe(canvas, obj) {
  if (!canvas || !obj) return;

  // Fabric 4/5 老方法
  if (typeof obj.bringToFront === 'function') {
    try {
      obj.bringToFront();
      return;
    } catch (e) { /* fallthrough */ }
  }

  // Fabric 6 风格
  if (typeof canvas.bringToFront === 'function') {
    canvas.bringToFront(obj);
    return;
  }

  // 兜底：手动重排数组
  const objects = canvas.getObjects();
  const idx = objects.indexOf(obj);
  if (idx > -1) {
    const newOrder = [...objects];
    newOrder.splice(idx, 1);
    newOrder.push(obj);
    canvas._objects = newOrder;
    canvas.renderAll();
  }
}

/**
 * ================================
 * 3️⃣ Fabric 4/5/6 兼容 sendToBack
 * ================================
 */
export function sendToBackSafe(canvas, obj) {
  if (!canvas || !obj) return;

  if (typeof obj.sendToBack === 'function') {
    try {
      obj.sendToBack();
      return;
    } catch (e) { /* fallthrough */ }
  }

  if (typeof canvas.sendToBack === 'function') {
    canvas.sendToBack(obj);
    return;
  }

  const objects = canvas.getObjects();
  const idx = objects.indexOf(obj);
  if (idx > -1) {
    const newOrder = [...objects];
    newOrder.splice(idx, 1);
    newOrder.unshift(obj);
    canvas._objects = newOrder;
    canvas.renderAll();
  }
}

/**
 * ================================
 * 4️⃣ Fabric 6 兼容 _setWidthHeight
 * ================================
 * 适用于 group 强制宽高
 */
fabric.Object.prototype._setWidthHeightSafe = function (width, height) {
  if (typeof this._setWidthHeight === 'function') {
    this._setWidthHeight(width, height);
  } else {
    this.set({ width, height });
    if (!this.dimensions) this.dimensions = {};
    this.dimensions.x = width;
    this.dimensions.y = height;
  }
};

/**
 * ================================
 * 5️⃣ Fabric 6 兼容 layout 排版
 * ================================
 */
fabric.Object.prototype._updateLayoutSafe = function () {
  if (typeof this._updateLayout === 'function') {
    this._updateLayout();
  }
};

export default fabric;
