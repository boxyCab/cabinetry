// src/utils/overlapChecker.js

/**
 * 检查一个物件是否与多个物件重叠
 * @param {number} pos - 主物件的位置
 * @param {number} width - 主物件的宽度
 * @param {Array<{pos: number, width: number}>} objects - 对比物件数组
 * @returns {Error|null} - 重叠返回 Error，无重叠返回 null
 */
export function checkOverlapWithMultiple(pos, width, objects) {
    if (!Array.isArray(objects)) {
      return new Error('objects 必须是数组');
    }
  
    const end = pos + width;
  
    for (let obj of objects) {
      if (!obj || typeof obj.pos !== 'number' || typeof obj.width !== 'number') {
        return new Error('无效的物件数据，需包含 pos 和 width 属性');
      }
  
      const objEnd = obj.pos + obj.width;
      if (pos < objEnd && obj.pos < end) {
        return new Error(`与物件(pos: ${obj.pos}, width: ${obj.width})重叠`);
      }
    }
  
    return null;
  }
  
  /**
   * 检查物件是否在 wall 范围内且不与其他物件重叠
   * @param {number} pos - 主物件的位置
   * @param {number} width - 主物件的宽度
   * @param {Array<{pos: number, width: number}>} objects - 对比物件数组
   * @param {number} wallWidth - 墙的宽度
   * @returns {Error|null} - 违反约束返回 Error，合法返回 null
   */
  export function checkWithinWallAndNoOverlap(pos, width, objects, wallWidth) {
    // 参数验证
    if (typeof pos !== 'number' || typeof width !== 'number' || typeof wallWidth !== 'number') {
      return new Error('pos、width 和 wallWidth 必须是数字');
    }
    if (!Array.isArray(objects)) {
      return new Error('objects 必须是数组');
    }
  
    // 检查 wall 范围约束
    if (pos < 0) {
      return new Error('物件位置不能小于 0');
    }
    if (pos > wallWidth) {
      return new Error(`物件位置不能大于 wall 宽度 ${wallWidth}`);
    }
    if (pos + width > wallWidth) {
      return new Error(`物件右边界(position + width)不能超过 wall 宽度 ${wallWidth}`);
    }
  
    // 检查重叠
    return checkOverlapWithMultiple(pos, width, objects);
  }