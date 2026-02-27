import fabric from '../utils/fabricConfig';
import store, { updateCabinet, selectCabinetObject, selectKitchenShapeType } from './../store';
import { saveHistory, } from '../management/historyManager';

export const drawCabinetset = (canvas, shapeData, flag, dispatch, cabinetObject) => {
    return shapeData.map((item, index) => drawCabinet(canvas, item, index, flag, dispatch, cabinetObject));
};
export const drawElevationCabinetset = (canvas, shapeData) => {
    return shapeData.map((item, index) => drawEvelationCabinet(canvas, item, index));
};
export const drawCabinet = (canvas, cabInfo, id, flag, dispatch, cabinetObject) => {
    // 添加 canvas 检查
    if (!canvas) {
        console.error('Canvas is undefined');
        return;
    }

    let cabInfoWidth = 0;
    let cabInfoHeight = 0;
    let groupWidth = 0;
    let groupHeight = 0;
    let groupX = cabInfo.x;
    let groupY = cabInfo.y;
    let cabX = cabInfo.x;
    let cabY = cabInfo.y;
    let cabInfoMove = true;
    let cabinetFlag = flag;
    if (flag === "addFlag" || cabInfo.updateFlg === 3) {
        // 从CabinetList描绘出来的图形，可以移动
        cabInfoMove = false;
        cabinetFlag = "addFlag";
    } else {
        cabinetFlag = "init";
    }
    if (parseFloat(cabInfo.rotation) === 0) {
        cabInfoWidth = cabInfo.width;
        cabInfoHeight = cabInfo.depth;
    } else if (parseFloat(cabInfo.rotation) === 180) {
        cabInfoWidth = cabInfo.width;
        cabInfoHeight = cabInfo.depth;
        if (cabInfo.objectType === 'islandouter') {
            // 岛台外柜
        } else {
            cabX = cabInfo.x - cabInfo.width;
        }

    } else if (parseFloat(cabInfo.rotation) === 90) {
        cabInfoWidth = cabInfo.depth;
        cabInfoHeight = cabInfo.width;
    } else if (parseFloat(cabInfo.rotation) === 270) {
        cabInfoWidth = cabInfo.depth;
        cabInfoHeight = cabInfo.width;
        if (cabInfo.objectType === 'islandouter') {
            // 岛台外柜
        } else {
            cabY = cabInfo.y - cabInfo.width;
        }

    }
    groupWidth = cabInfoWidth;
    groupHeight = cabInfoHeight;

    if (cabInfo.cabinettype === 'BLS' || cabInfo.cabinettype === 'WLS') {
        if (parseFloat(cabInfo.rotation) === 180) {
            drawBLSRotate(canvas, cabInfo, 180, cabinetFlag);
        } else if (parseFloat(cabInfo.rotation) === 90) {
            drawBLSRotate(canvas, cabInfo, 90, cabinetFlag);
        } else if (parseFloat(cabInfo.rotation) === 270) {
            drawBLSRotate(canvas, cabInfo, 270, cabinetFlag);
        } else {
            // 创建带缺口的路径数据，缺口位于左上角
            const pathData = `
        M ${cabInfoWidth} 0                             // 起点：右上角
        V ${cabInfoWidth}                               // 绘制右边到右下角
        H 0                                            // 绘制底边到左下角
        V ${cabInfoWidth - cabInfoHeight}  // 绘制左边到缺口下方
        H ${cabInfoWidth - cabInfoHeight}              // 绘制缺口底边
        V 0                                            // 绘制缺口右边回到起点
        Z                                              // 闭合路径
        `;
            // 创建带缺口的路径
            const path = new fabric.Path(pathData, {
                fill: cabInfo.fill || '#FFFBF0',  // 填充颜色
                left: Math.round(cabX * 100) / 100,      // 矩形起始位置的 X 坐标
                top: Math.round((cabY - (cabInfoWidth - cabInfoHeight)) * 100) / 100, // 矩形起始位置的 Y 坐标
                stroke: 'black',                 // 边框颜色
                strokeWidth: 0.5,                // 边框宽度
                strokeLineJoin: 'round',         // 确保路径的边缘连接是平滑的
                selectable: false  // 确保矩形不可选择
            });
            // 创建文本对象
            const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
                left: Math.round(cabX + cabInfoWidth / 2),  // 文本居中
                top: Math.round(cabY - (cabInfoWidth - cabInfoHeight) + cabInfoWidth / 2),    // 文本居中
                fontSize: 14,
                originX: 'center',  // 设置文本原点为中心
                originY: 'center',
                fontFamily: 'Arial', // 使用清晰的字体
                fill: 'blue',         // 设置字体颜色为蓝色
                angle: cabInfo.rotation,             // 将文本旋转 90 度
                selectable: false    // 确保文本不可选择
            });
            // 添加路径到画布
            //canvas.add(path, text);
            const group = new fabric.Group([path, text], {
                left: Math.round(path.left * 100) / 100,
                top: Math.round(path.top * 100) / 100,
                width: Math.round(cabInfoWidth * 100) / 100,
                height: Math.round(cabInfoWidth * 100) / 100,
                // angle: cabInfo.rotation, // 可旋转角度
                selectable: true,  // 确保矩形不可选择
                lockMovementX: cabInfoMove, // 锁定水平方向移动
                lockMovementY: cabInfoMove, // 锁定垂直方向移动
                lockScalingX: true, // 禁止修改宽度
                lockScalingY: true, // 禁止修改高度
            });
            // 为组对象设置自定义属性
            //group.top = path.top + (cabInfoWidth - cabInfoHeight)+ cabInfoWidth / 2;
            group.width = Math.round(cabInfoWidth * 100) / 100;
            group.height = Math.round(cabInfoWidth * 100) / 100;
            group.cabinettype = cabInfo.cabinettype;
            //group.height = cabInfo.height;
            group.objectType = cabInfo.objectType;
            group.objectname = cabInfo.objectname;
            group.rotation = cabInfo.rotation;
            group.relatedId = cabInfo.relatedId;
            group.relatedId2 = cabInfo.relatedId2;
            group.color = cabInfo.color;
            group.scale = cabInfo.scale;
            group.depth = cabInfo.depth;
            group.kitchen = cabInfo.kitchen;
            group.id = cabInfo.id;
            group.flag = cabinetFlag;
            group.widthcabinet = cabInfo.widthcabinet;
            canvas.add(group);
        }

    } else if (cabInfo.cabinettype === 'BLSD' || cabInfo.cabinettype === 'WDCD' ||
        cabInfo.cabinettype === 'SBDD' || cabInfo.cabinettype === 'WLSD') {
        // 不需要绘制路径
    } else if (cabInfo.cabinettype === 'SBD' || cabInfo.cabinettype === 'WDC') {
        if (parseFloat(cabInfo.rotation) === 180) {
            drawSBDRotate(canvas, cabInfo, 180, cabinetFlag);
        } else if (parseFloat(cabInfo.rotation) === 90) {
            drawSBDRotate(canvas, cabInfo, 90, cabinetFlag);
        } else if (parseFloat(cabInfo.rotation) === 270) {
            drawSBDRotate(canvas, cabInfo, 270, cabinetFlag);
        } else {
            // 创建带缺口的路径数据，缺口位于左上角
            const pathData = `

        M ${cabInfoWidth - cabInfoHeight} 0            // 起点：右上角
        L ${cabInfoWidth} 0                                         // 绘制右边到右下角
        L ${cabInfoWidth} ${cabInfoWidth}                               // 绘制右边到右下角
        L 0 ${cabInfoWidth}                                            // 绘制底边到左下角
        L 0 ${cabInfoWidth - cabInfoHeight}              // 绘制左边到缺口下方
            Z                                              // 闭合路径
    `;
            // 创建带缺口的路径
            const path = new fabric.Path(pathData, {
                fill: cabInfo.fill || '#FFFBF0',  // 填充颜色
                left: Math.round((cabX) * 100) / 100,      // 矩形起始位置的 X 坐标
                top: Math.round((cabY - (cabInfoWidth - cabInfoHeight)) * 100) / 100, // 矩形起始位置的 Y 坐标
                stroke: 'black',                 // 边框颜色
                strokeWidth: 0.5,                // 边框宽度
                strokeLineJoin: 'round',         // 确保路径的边缘连接是平滑的
                selectable: false  // 确保矩形不可选择
            });
            // 创建文本对象
            const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
                left: Math.round(cabX + cabInfoWidth / 2),  // 文本居中
                top: Math.round(cabY - (cabInfoWidth - cabInfoHeight) + cabInfoWidth / 2),    // 文本居中
                fontSize: 14,
                originX: 'center',  // 设置文本原点为中心
                originY: 'center',
                fontFamily: 'Arial', // 使用清晰的字体
                fill: 'blue',         // 设置字体颜色为蓝色
                angle: 0,             // 将文本旋转 90 度
                selectable: false    // 确保文本不可选择
            });
            // 添加路径到画布
            //canvas.add(path, text);
            const group = new fabric.Group([path, text], {
                left: Math.round(path.left * 100) / 100,
                top: Math.round(path.top * 100) / 100,
                width: Math.round(cabInfoWidth * 100) / 100,
                height: Math.round(cabInfoWidth * 100) / 100,
                angle: 0, // 可旋转角度
                selectable: true,  // 确保矩形不可选择
                lockMovementX: cabInfoMove, // 锁定水平方向移动
                lockMovementY: cabInfoMove, // 锁定垂直方向移动
                lockScalingX: true, // 禁止修改宽度
                lockScalingY: true, // 禁止修改高度
            });
            // 为组对象设置自定义属性
            //group.top = path.top + (cabInfoWidth - cabInfoHeight)+ cabInfoWidth / 2;
            group.width = Math.round(cabInfoWidth * 100) / 100;
            group.height = Math.round(cabInfoWidth * 100) / 100;
            group.cabinettype = cabInfo.cabinettype;
            //group.height = cabInfo.height;
            group.objectType = cabInfo.objectType;
            group.objectname = cabInfo.objectname;
            group.rotation = cabInfo.rotation;
            group.relatedId = cabInfo.relatedId;
            group.relatedId2 = cabInfo.relatedId2;
            group.color = cabInfo.color;
            group.scale = cabInfo.scale;
            group.depth = cabInfo.depth;
            group.kitchen = cabInfo.kitchen;
            group.id = cabInfo.id;
            group.flag = cabinetFlag;
            group.widthcabinet = cabInfo.widthcabinet;
            canvas.add(group);
        }

    } else if (cabInfo.cabinettype === 'BBCR' || cabInfo.cabinettype === 'BBCL' ||
        cabInfo.cabinettype === 'BBCRD' || cabInfo.cabinettype === 'BBCLD' ||
        cabInfo.cabinettype === 'WBCR' || cabInfo.cabinettype === 'WBCL' ||
        cabInfo.cabinettype === 'WBCRD' || cabInfo.cabinettype === 'WBCLD') {
        let rectWhiteWidth = 3 * cabInfo.scale;
        let rectWhiteHeight = cabInfoHeight;
        let rectWhiteX = 0;
        let rectWhiteY = 0;

        if (cabInfo.cabinettype === 'BBCR' || cabInfo.cabinettype === 'WBCR') {
            if (parseFloat(cabInfo.rotation) === 180) {
                cabX = cabInfo.x - cabInfoWidth + 3 * cabInfo.scale;
                cabInfoWidth = cabInfoWidth - 3 * cabInfo.scale;
                rectWhiteWidth = 3 * cabInfo.scale;
                rectWhiteHeight = cabInfo.depth;
                rectWhiteX = cabInfo.x - cabInfo.width;
                rectWhiteY = cabInfo.y;
                groupX = rectWhiteX;

            } else if (parseFloat(cabInfo.rotation) === 270) {
                cabY = cabInfo.y - cabInfo.width + 3 * cabInfo.scale;
                cabInfoHeight = cabInfoHeight - 3 * cabInfo.scale;
                rectWhiteWidth = cabInfo.depth;
                rectWhiteHeight = 3 * cabInfo.scale;
                rectWhiteX = cabInfo.x;
                rectWhiteY = cabInfo.y - cabInfo.width;
                groupY = cabInfo.y - cabInfo.width;
            } else if (parseFloat(cabInfo.rotation) === 90) {
                cabInfoHeight = cabInfoHeight - 3 * cabInfo.scale;
                rectWhiteX = cabInfo.x;
                rectWhiteY = cabInfo.y + cabInfoHeight;
                rectWhiteWidth = cabInfo.depth;
                rectWhiteHeight = 3 * cabInfo.scale;
            } else {
                cabInfoWidth = cabInfoWidth - 3 * cabInfo.scale;
                rectWhiteX = cabInfo.x + cabInfo.width - 3 * cabInfo.scale;
                rectWhiteY = cabInfo.y;
                rectWhiteWidth = 3 * cabInfo.scale;
                rectWhiteHeight = cabInfo.depth;
            }
        } else if (cabInfo.cabinettype === 'BBCL' || cabInfo.cabinettype === 'WBCL') {
            if (parseFloat(cabInfo.rotation) === 180) {
                cabX = cabInfo.x - cabInfoWidth;
                cabInfoWidth = cabInfoWidth - 3 * cabInfo.scale;
                rectWhiteWidth = 3 * cabInfo.scale;
                rectWhiteHeight = cabInfo.depth;
                rectWhiteX = cabInfo.x - 3 * cabInfo.scale;
                rectWhiteY = cabInfo.y;
                groupX = cabX;
            } else if (parseFloat(cabInfo.rotation) === 270) {
                cabY = cabInfo.y - cabInfo.width;
                cabInfoHeight = cabInfoHeight - 3 * cabInfo.scale;
                rectWhiteWidth = cabInfo.depth;
                rectWhiteHeight = 3 * cabInfo.scale;
                rectWhiteX = cabInfo.x;
                rectWhiteY = cabInfo.y - 3 * cabInfo.scale;
                groupY = cabY;
            } else if (parseFloat(cabInfo.rotation) === 90) {
                cabY = cabInfo.y + 3 * cabInfo.scale;
                cabInfoHeight = cabInfoHeight - 3 * cabInfo.scale;
                rectWhiteX = cabInfo.x;
                rectWhiteY = cabInfo.y;
                rectWhiteWidth = cabInfo.depth;
                rectWhiteHeight = 3 * cabInfo.scale;
            } else {
                cabX = cabInfo.x + 3 * cabInfo.scale;
                cabInfoWidth = cabInfoWidth - 3 * cabInfo.scale;
                rectWhiteX = cabInfo.x;
                rectWhiteY = cabInfo.y;
                rectWhiteWidth = 3 * cabInfo.scale;
                rectWhiteHeight = cabInfo.depth;
            }
        } else if (cabInfo.cabinettype === 'BBCLD' || cabInfo.cabinettype === 'WBCLD') {
            // if (cabInfo.cabinettype === 'BBCLD') {
            //     cabInfo.widthcabinet = cabInfo.widthcabinet - 24;
            // } else if (cabInfo.cabinettype === 'WBCLD') {
            //     cabInfo.widthcabinet = cabInfo.widthcabinet - 12;
            // }

            rectWhiteWidth = 0;
            rectWhiteHeight = 0;
            if (parseFloat(cabInfo.rotation) === 180) {
                cabX = cabInfo.x - 3 * cabInfo.scale;
                cabInfoWidth = 3 * cabInfo.scale;
            } else if (parseFloat(cabInfo.rotation) === 270) {
                cabY = cabInfo.y - 3 * cabInfo.scale;
                cabInfoHeight = 3 * cabInfo.scale;
            } else if (parseFloat(cabInfo.rotation) === 90) {
                // cabY = cabInfo.y - 3*cabInfo.scale;
                cabInfoHeight = 3 * cabInfo.scale;
            } else {
                // cabX = cabInfo.x - 3*cabInfo.scale ;
                cabInfoWidth = 3 * cabInfo.scale;
            }
        } else if (cabInfo.cabinettype === 'BBCRD' || cabInfo.cabinettype === 'WBCRD') {
            // if (cabInfo.cabinettype === 'BBCRD') {
            //     cabInfo.widthcabinet = cabInfo.widthcabinet - 24;
            // } else if (cabInfo.cabinettype === 'WBCRD') {
            //     cabInfo.widthcabinet = cabInfo.widthcabinet - 12;
            // }
            rectWhiteWidth = 0;
            rectWhiteHeight = 0;
            if (parseFloat(cabInfo.rotation) === 180) {
                cabX = cabInfo.x - cabInfoWidth;
                cabInfoWidth = 3 * cabInfo.scale;
            } else if (parseFloat(cabInfo.rotation) === 270) {
                cabY = cabInfo.y - cabInfoHeight;
                cabInfoHeight = 3 * cabInfo.scale;
            } else if (parseFloat(cabInfo.rotation) === 90) {
                cabY = cabInfo.y + cabInfoWidth;
                cabInfoHeight = 3 * cabInfo.scale;
            } else {
                cabX = cabInfo.x + cabInfo.depth;
                cabInfoWidth = 3 * cabInfo.scale;
            }
        }
        if (rectWhiteWidth > 0) {
            // BBC
            const cabinetRect = new fabric.Rect({
                left: Math.round(cabX * 100) / 100,
                top: Math.round(cabY * 100) / 100,
                fill: cabInfo.fill || '#FFFBF0',
                width: Math.round(cabInfoWidth * 100) / 100 || 100,
                height: Math.round(cabInfoHeight * 100) / 100 || 20,
                angle: 0,
                stroke: 'black', // 边框颜色
                strokeWidth: 0.5, // 边框宽度
                selectable: false  // 确保矩形不可选择
            });
            // 创建文本对象
            const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
                left: Math.round(cabX + cabInfoWidth / 2),  // 文本居中
                top: Math.round(cabY + cabInfoHeight / 2),    // 文本居中
                fontSize: 14,
                originX: 'center',  // 设置文本原点为中心
                originY: 'center',
                fontFamily: 'Arial', // 使用清晰的字体
                fill: 'blue',         // 设置字体颜色为蓝色
                angle: cabInfo.rotation,             // 将文本旋转 90 度
                selectable: false    // 确保文本不可选择
            });
            const cabinetRectWhite = new fabric.Rect({
                left: Math.round(rectWhiteX * 100) / 100,
                top: Math.round(rectWhiteY * 100) / 100,
                fill: "white",
                width: rectWhiteWidth,
                height: Math.round(rectWhiteHeight * 100) / 100 || 20,
                angle: 0,
                stroke: 'black', // 边框颜色
                strokeWidth: 0.5, // 边框宽度
                selectable: false  // 确保矩形不可选择
            });
            //canvas.add(cabinetRect, text);
            // 将矩形和文本对象组合成一个组
            const group = new fabric.Group([cabinetRect, text, cabinetRectWhite], {
                left: Math.round(groupX * 100) / 100,
                top: Math.round(groupY * 100) / 100,
                width: Math.round(groupWidth * 100) / 100,
                height: Math.round(groupHeight * 100) / 100,
                // angle: cabinetRect.angle, // 可旋转角度
                selectable: true, // 矩形可选
                lockMovementX: cabInfoMove, // 锁定水平方向移动
                lockMovementY: cabInfoMove, // 锁定垂直方向移动
                lockScalingX: true, // 禁止修改宽度
                lockScalingY: true, // 禁止修改高度
            });
            // 为组对象设置自定义属性
            group.width = Math.round(groupWidth * 100) / 100;
            group.height = Math.round(groupHeight * 100) / 100;
            group.cabinettype = cabInfo.cabinettype;
            // group.width = cabInfo.width;
            group.objectType = cabInfo.objectType;
            group.rotation = cabInfo.rotation;
            group.relatedId = cabInfo.relatedId;
            group.relatedId2 = cabInfo.relatedId2;
            group.objectname = cabInfo.objectname;
            group.scale = cabInfo.scale;
            group.depth = cabInfo.depth;
            group.kitchen = cabInfo.kitchen;
            group.id = cabInfo.id;
            group.flag = cabinetFlag;
            group.widthcabinet = cabInfo.widthcabinet;
            canvas.add(group);
        } else {

            // 创建文本对象
            let objectText = "BF3";
            if (cabInfo.cabinettype === 'WBCRD' || cabInfo.cabinettype === 'WBCLD') {
                objectText = "WF03";
            }
            // TODO 对于BBCD/WBCD是否移动要确认
            const text = new fabric.Text(objectText || 'Cabinet', {
                left: Math.round(cabX + cabInfoWidth / 2),  // 文本居中
                top: Math.round(cabY + cabInfoHeight / 2),    // 文本居中
                fontSize: 14,
                originX: 'center',  // 设置文本原点为中心
                originY: 'center',
                fontFamily: 'Arial', // 使用清晰的字体
                fill: 'blue',         // 设置字体颜色为蓝色
                angle: cabInfo.rotation,             // 将文本旋转 90 度
                selectable: false    // 确保文本不可选择
            });
            const cabinetBF3 = new fabric.Rect({
                left: Math.round((cabX) * 100) / 100,
                top: Math.round((cabY) * 100) / 100,
                fill: cabInfo.fill || '#FFFBF0',
                width: Math.round(cabInfoWidth * 100) / 100 || 100,
                height: Math.round(cabInfoHeight * 100) / 100 || 20,
                angle: 0,
                stroke: 'black', // 边框颜色
                strokeWidth: 0.5, // 边框宽度
                selectable: false  // 确保矩形不可选择
            });
            // canvas.add(cabinetBF3, text);
            // 将矩形和文本对象组合成一个组
            const group = new fabric.Group([cabinetBF3, text], {
                left: Math.round(cabX * 100) / 100,
                top: Math.round(cabY * 100) / 100,
                width: Math.round(cabInfoWidth * 100) / 100,
                height: Math.round(cabInfoHeight * 100) / 100,
                // angle: cabinetBF3.angle, // 可旋转角度
                selectable: true, // 矩形可选
                lockMovementX: cabInfoMove, // 锁定水平方向移动
                lockMovementY: cabInfoMove, // 锁定垂直方向移动
                lockScalingX: true, // 禁止修改宽度
                lockScalingY: true, // 禁止修改高度
            });
            // 为组对象设置自定义属性
            group.width = Math.round(cabInfoWidth * 100) / 100;
            group.height = Math.round(cabInfoHeight * 100) / 100;
            group.cabinettype = cabInfo.cabinettype;
            // group.width = 3*cabInfo.scale ;
            group.objectType = cabInfo.objectType;
            group.rotation = cabInfo.rotation;
            group.relatedId = cabInfo.relatedId;
            group.objectname = cabInfo.objectname;
            group.scale = cabInfo.scale;
            group.depth = cabInfo.depth;
            group.kitchen = cabInfo.kitchen;
            group.id = cabInfo.id;
            group.flag = cabinetFlag;
            group.widthcabinet = cabInfo.widthcabinet;

            // 🔹 Fabric 6 兼容版本：强制以矩形为边界
            group._recalcDimensions = function () {
                this.set({
                    width: Math.round(cabinetBF3.width * cabinetBF3.scaleX * 100) / 100,
                    height: Math.round(cabinetBF3.height * cabinetBF3.scaleY * 100) / 100
                });
                this.dimensions = {
                    x: Math.round(cabinetBF3.width * cabinetBF3.scaleX * 100) / 100,
                    y: Math.round(cabinetBF3.height * cabinetBF3.scaleY * 100) / 100
                };
            };

            // 🔹 立即刷新尺寸与坐标
            group._recalcDimensions();
            group.setCoords();
            canvas.add(group);
        }

    } else {

        const cabinetRect = new fabric.Rect({
            left: Math.round(cabX * 100) / 100,
            top: Math.round(cabY * 100) / 100,
            fill: cabInfo.fill || '#FFFBF0',
            width: Math.round((cabInfoWidth) * 100) / 100 || 100,
            height: Math.round((cabInfoHeight) * 100) / 100 || 20,
            angle: 0,
            stroke: 'black', // 边框颜色
            strokeWidth: 0.5, // 边框宽度
            selectable: true, // 不允许单独选中
            evented: true,    // 不响应事件
        });


        let textX = Math.round(cabX + cabInfoWidth / 2);
        let textY = Math.round(cabY + cabInfoHeight / 2);
        let lockXO = true;
        let lockYO = true;
        //// 对应 所有柜子都需要移动的问题
        // if (cabInfo.cabinettype === 'PNB' || cabInfo.cabinettype === 'PNW' ||cabInfo.cabinettype === 'SP' ||cabInfo.cabinettype === 'FILLER') {

        if (cabInfo.rotation === 90 || cabInfo.rotation === 270) {
            if (cabInfoMove === false) {
                lockXO = false;
                lockYO = false;
            } else {
                lockYO = false;
            }

        } else if (cabInfo.rotation === 0 || cabInfo.rotation === 180) {
            if (cabInfoMove === false) {
                lockXO = false;
                lockYO = false;
            } else {
                lockXO = false;
            }
        }
        // } else {
        //     lockXO = cabInfoMove;
        //     lockYO = cabInfoMove;
        // }
        // 创建文本对象
        const text = new fabric.Textbox(cabInfo.objectname || 'Cabinet', {
            left: textX,  // 文本居中
            top: textY,    // 文本居中
            fontSize: 14,
            originX: 'center',  // 设置文本原点为中心
            originY: 'center',
            fontFamily: 'Arial', // 使用清晰的字体
            fill: 'blue',         // 设置字体颜色为蓝色
            angle: cabInfo.rotation,
            // selectable: true,    // 
            lockMovementX: false, // 锁定水平方向移动
            lockMovementY: false, // 锁定垂直方向移动
            lockScalingX: true, // 禁止修改宽度
            lockScalingY: true, // 禁止修改高度
            selectable: true, // 不允许单独选中
            evented: true,    // 不响应事件
            // excludeFromLayout: true,
        });
        //canvas.add(cabinetRect, text);

        // 将矩形和文本对象组合成一个组
        const group = new fabric.Group([cabinetRect, text], {
            left: Math.round(cabX * 100) / 100,
            top: Math.round(cabY * 100) / 100,
            // width: cabinetRect.width,
            // height: cabinetRect.height,
            angle: cabInfo.angle, // 可旋转角度
            lockMovementX: lockXO, // 锁定水平方向移动
            lockMovementY: lockYO, // 锁定垂直方向移动
            lockScalingX: true, // 禁止修改宽度
            lockScalingY: true, // 禁止修改高度
            subTargetCheck: true,
            selectable: true,  // 只允许选中整个 group
            hasControls: true,
            evented: true

        });



        // 为组对象设置自定义属性
        group.cabinettype = cabInfo.cabinettype;
        group.cabheight = cabInfo.height;
        group.objectType = cabInfo.objectType;
        group.rotation = cabInfo.rotation;
        group.relatedId = cabInfo.relatedId;
        group.relatedId2 = cabInfo.relatedId2;
        group.objectname = cabInfo.objectname;
        group.scale = cabInfo.scale;
        group.depth = cabInfo.depth;
        group.kitchen = cabInfo.kitchen;
        group.id = cabInfo.id;
        group.flag = cabinetFlag;
        group.widthcabinet = cabInfo.widthcabinet;
        group.updateFlg = cabInfo.updateFlg;
        // 🔹 Fabric 6 兼容版本：强制以矩形为边界
        group._recalcDimensions = function () {
            this.set({
                width: Math.round(cabinetRect.width * cabinetRect.scaleX * 100) / 100,
                height: Math.round(cabinetRect.height * cabinetRect.scaleY * 100) / 100
            });
            this.dimensions = {
                x: Math.round(cabinetRect.width * cabinetRect.scaleX * 100) / 100,
                y: Math.round(cabinetRect.height * cabinetRect.scaleY * 100) / 100
            };
        };

        // 🔹 立即刷新尺寸与坐标
        group._recalcDimensions();
        group.setCoords();

        canvas.add(group);
        // if (group.flag != "addFlag" && group.updateFlg != 3) {
        //// 对应 所有柜子都需要移动的问题
        // if (cabInfo.cabinettype === 'PNB' || cabInfo.cabinettype === 'PNW' || cabInfo.cabinettype === 'FILLER' ||cabInfo.cabinettype === 'SP') {
        if (!group._hasMovedEvent) {
            group.on("modified", function () {
                console.log("Object moved, rect.flag =", group.flag);
                const cabinetObject = selectCabinetObject(store.getState());
                let canvasObjectStore = cabinetObject.canvasObjectList;
                let cabinetListStore = cabinetObject.cabinetObjectList;
                let objectX = group.left;
                let objectY = group.top;
                saveHistory(canvas, cabinetObject);
                if (group.flag === "addFlag" || group.updateFlg === 3) {
                    let updatedCanvasObjectstmp = canvasObjectStore.map(item => {
                        if (item.id === group.id) {
                            let mod = positionMod(objectX, objectY, group.rotation, group.width, group.depth, group.height, group.cabinettype);
                            return {
                                ...item,
                                x: Math.round(mod.left * 100) / 100,
                                y: Math.round(mod.top * 100) / 100,
                                // flag: "moveFlag",
                                // updateFlg: 2
                            };
                        }
                        return item;
                    });
                    let updateCabinetTMP = {
                        ...cabinetObject,
                        updateFlag: 1,
                        canvasObjectList: updatedCanvasObjectstmp,
                    };
                    store.dispatch(updateCabinet(updateCabinetTMP));
                    return;
                }
                group.flag = "moveFlag";   // 在对象上打标记
                let newWallList = cabinetObject.canvasWallList;
                let kitchenShapeType = selectKitchenShapeType(store.getState());


                let wallXS_adjust = 0;
                if (kitchenShapeType === "L") {
                    wallXS_adjust = 20;
                } else if (kitchenShapeType === "U") {
                    wallXS_adjust = 20;
                }
                let moveCanvasObject = canvasObjectStore.find(item => item.id === group.id);
                let wallcabMove = newWallList.find(item => item.wallid === moveCanvasObject.wallid);
                let objectStartPosition = 0;
                let wallAdjust = 0;
                if (wallcabMove.objectType === "island" || wallcabMove.objectType === "peninsula") {
                    if (group.rotation === 0) {
                        if (group.objectType === "islandouter") {
                            objectStartPosition = (wallcabMove.x + wallcabMove.width - group.left - group.width) / group.scale;
                        } else {
                            objectStartPosition = (group.left - (wallcabMove.x)) / group.scale;
                        }
                    } else if (group.rotation === 90) {
                        if (group.objectType === 'islandouter') {
                            objectStartPosition = (wallcabMove.y - group.top - group.height) / group.scale;
                        } else {
                            objectStartPosition = (group.top - (wallcabMove.y)) / group.scale;
                        }
                    } else if (group.rotation === 180) {
                        if (group.objectType === "islandouter") {
                            objectStartPosition = (wallcabMove.x + wallcabMove.width - group.left - group.width) / group.scale;
                        } else {
                            objectX = objectX + group.width;
                            objectStartPosition = (wallcabMove.x + wallcabMove.width - group.left - group.width) / group.scale;
                        }
                    } else if (group.rotation === 270) {
                        if (group.objectType === 'islandouter') {
                            objectStartPosition = (group.top - wallcabMove.y) / group.scale;
                        } else {
                            objectY = objectY + group.height;
                            objectStartPosition = (wallcabMove.y - group.top - group.height) / group.scale;
                        }
                    }
                } else {
                    wallAdjust = wallXS_adjust;
                    if (group.rotation === 0) {
                        objectStartPosition = (group.left - wallcabMove.x - wallAdjust) / group.scale;
                    } else if (group.rotation === 90) {
                        objectStartPosition = (group.top - (wallcabMove.y)) / group.scale;
                    } else if (group.rotation === 180) {
                        objectX = objectX + group.width;
                        objectStartPosition = (wallcabMove.x + wallcabMove.width - group.left - group.width) / group.scale;
                    } else if (group.rotation === 270) {
                        objectY = objectY + group.height;
                        objectStartPosition = (wallcabMove.y + wallcabMove.width - group.top - group.height) / group.scale;
                    }
                }
                let updatedCanvasObjectstmp = canvasObjectStore.map(item => {
                    if (item.id === group.id) {
                        return {
                            ...item,
                            x: Math.round(objectX * 100) / 100,
                            y: Math.round(objectY * 100) / 100,
                            // rotation: group.rotation,
                            flag: "moveFlag",
                            updateFlg: 2
                        };
                    }
                    return item;
                });
                let updatedCabinettmp = cabinetListStore.map(item => {
                    if (item.id === group.relatedId) {
                        return {
                            ...item,
                            startposition: objectStartPosition,
                            updateFlg: 2
                        };
                    }
                    return item;
                });
                let updateCabinetTMP = {
                    ...cabinetObject,
                    updateFlag: 1,
                    canvasObjectList: updatedCanvasObjectstmp,
                    cabinetObjectList: updatedCabinettmp,
                };
                store.dispatch(updateCabinet(updateCabinetTMP));
            });
            group._hasMovedEvent = true; // 打个标记，避免重复绑定
        }
        //  }



    }

    // 组合成一个对象
    return;
};

export const setCabinetSelected = (canvas, eventstatus) => {
    if (!eventstatus) {
        // canvas.selection = false; // 允许框选
        // canvas.interactive = false; // 启用交互
        //   walls.map(wall => {
        //     wall.set('selectable', false);
        //   });
    } else {

        const allObjects = canvas.getObjects(); // 获取画布上的所有对象
        allObjects.forEach((obj) => {
            if (obj.type === 'rect' && obj.fill === '#FFFBF0') { // 判断是否是柜子对象（假设用矩形表示）
                obj.set('selectable', true); // 设置为可选择
                obj.set({
                    lockMovementX: false,
                    lockMovementY: false,
                    lockScalingX: false,
                    lockScalingY: false,
                    lockRotation: false,
                });
                obj.bringToFront();
                console.log(obj.zIndex); // 检查对象的层级
                console.log(obj);
                obj.set('evented', true);
            }
        });

        canvas.selection = true; // 允许框选
        canvas.interactive = true; // 启用交互
        canvas.off('object:selected'); // 移除相关事件监听器
        canvas.off('mouse:down'); // 清除所有鼠标事件监听
        canvas.off('mouse:up');
        canvas.off('object:moving');
        canvas.off('object:scaling');
        canvas.off('object:rotating');
        canvas.renderAll(); // 重新渲染画布
    }
    console.log(canvas.selection); // 检查是否启用多选
    console.log(canvas.interactive); // 检查是否启用交互    
};

export const drawEvelationCabinet = (canvas, cabInfo, id) => {
    // 高度X 
    console.log(cabInfo);
    // 没有抽屉的上柜，下柜
    if (cabInfo.cabinettype === 'BBCL' || cabInfo.cabinettype === 'BBC') {
        drawLowerBBCL(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'BBCR') {
        drawLowerBBCR(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'WBCL' || cabInfo.cabinettype === 'WBC') {
        drawUpperWBCL(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'WBCR') {
        drawUpperWBCR(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'BLS') {
        drawBLS(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'BSR') {
        drawCabBSR(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'B') {
        if (cabInfo.width / cabInfo.scale > 21) { // 
            // 双门
            drawLowerCabHasdrawer(canvas, cabInfo);
        } else {
            // 单门
            drawLowerCabHasdrawerSingle(canvas, cabInfo);
        }
    } else if (cabInfo.cabinettype === 'W' || cabInfo.cabinettype === 'WBR') {
        if (cabInfo.width / cabInfo.scale > 21) {
            // 双门
            drawUpperCabNodrawer(canvas, cabInfo);
        } else {
            drawUpperCabNodrawerSingle(canvas, cabInfo);
        }

    } else if (cabInfo.cabinettype === 'WP') {
        if (cabInfo.width / cabInfo.scale > 21) {
            // 双门
            drawWP(canvas, cabInfo);
        } else {
            drawWPSingle(canvas, cabInfo);

        }
    } else if (cabInfo.cabinettype === '2DB') {
        drawLower2DB(canvas, cabInfo);
    } else if (cabInfo.cabinettype === '3DB') {
        drawLower3DB(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'D') {
        drawLowerCabNodrawer(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'WF') {
        drawFiller(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'RRP') {
        drawFiller(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'PNB' || cabInfo.cabinettype === "PANEL") {
        drawFiller(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'FILLER') {
        drawFiller(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'SB') {
        drawLowerCabHasdrawer(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'TB') {
        drawLowerCabHasdrawerSingle(canvas, cabInfo);
    } else if (cabInfo.cabinettype === 'BBCD' ||
        cabInfo.cabinettype === 'BBCLD' || cabInfo.cabinettype === 'BBCRD' ||
        cabInfo.cabinettype === 'WBCD' || cabInfo.cabinettype === 'WBCLD' || cabInfo.cabinettype === 'WBCRD') {
        drawBBCD(canvas, cabInfo);
    } else {
        const cabinetRect = new fabric.Rect({
            left: Math.round(cabInfo.x * 100) / 100,
            top: Math.round(cabInfo.y * 100) / 100,
            fill: cabInfo.fill || '#FFFBF0',
            width: Math.round(cabInfo.width * 100) / 100 || 100,
            height: Math.round(cabInfo.height * 100) / 100 || 20,
            angle: 0,
            stroke: 'black', // 边框颜色
            strokeWidth: 0.5, // 边框宽度
            selectable: false  // 确保矩形不可选择
        });
        cabinetRect.objectname = cabInfo.objectname;
        cabinetRect.widthcabinet = cabInfo.widthcabinet;
        // 添加大矩形到画布
        canvas.add(cabinetRect);
        // 计算矩形的中心位置
        const centerX = cabinetRect.left + cabinetRect.width / 2;
        let centerY = cabinetRect.top + cabinetRect.height / 2;
        // 创建文本对象
        const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
            left: centerX, // 起始位置为矩形中心
            top: centerY, // 垂直居中
            fontSize: 18,
            originX: 'center', // 设置原点为中心
            originY: 'center',
            fontFamily: 'Arial',
            fill: 'blue',
            selectable: false,
            clipTo: function (ctx) {
                // 限制文本绘制范围，不影响矩形位置
                ctx.rect(
                    -cabinetRect.width / 2, // 相对于文本中心的左边界
                    -cabinetRect.height / 2, // 相对于文本中心的上边界
                    cabinetRect.width,       // 矩形宽度
                    cabinetRect.height       // 矩形高度
                );
            },
        });
        canvas.add(text);

    }

};

// 没有抽屉的上柜
const drawFiller = (canvas, cabInfo) => {
    // console.log(cabInfo);
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round((cabInfo.width || 100) * 100) / 100,
        height: Math.round((cabInfo.height || 20) * 100) / 100,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);

    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    let centerY = cabinetRect.top + cabinetRect.height / 4;

    if (cabInfo.cabinettype === 'PNB') {
        centerY = cabinetRect.top + cabinetRect.height * 3 / 4
    }

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX, // 起始位置为矩形中心
        top: centerY, // 垂直居中
        fontSize: 18,
        originX: 'center', // 设置原点为中心
        originY: 'center',
        fontFamily: 'Arial',
        fill: 'blue',
        selectable: false,
        clipTo: function (ctx) {
            // 限制文本绘制范围，不影响矩形位置
            ctx.rect(
                -cabinetRect.width / 2, // 相对于文本中心的左边界
                -cabinetRect.height / 2, // 相对于文本中心的上边界
                cabinetRect.width,       // 矩形宽度
                cabinetRect.height       // 矩形高度
            );
        },
    });
    canvas.add(text);

}
// 没有抽屉的上柜
const drawUpperCabNodrawer = (canvas, cabInfo) => {
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);

    // 获取大矩形的中心点和宽高
    const { left, top, width, height } = cabinetRect;

    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [left + width / 2, top, left + width / 2, top + height],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(verticalLine);

    // 左右小矩形的内边距（距离边框 3 像素）
    const padding = 5;

    // 左矩形
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width / 2 - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftInnerRect.objectname = cabInfo.objectname;
    leftInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftInnerRect);

    // 右矩形
    const rightInnerRect = new fabric.Rect({
        left: left + width / 2 + padding,
        top: top + padding,
        fill: 'transparent',
        width: width / 2 - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    rightInnerRect.objectname = cabInfo.objectname;
    rightInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(rightInnerRect);

    // 创建文本对象
    // const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
    //     left: Math.round(cabInfo.x + cabInfo.width / 2),  // 文本居中
    //     top: Math.round(cabInfo.y + cabInfo.depth / 2),    // 文本居中
    //     fontSize: 14,
    //     originX: 'center',  // 设置文本原点为中心
    //     originY: 'center',
    //     fontFamily: 'Arial', // 使用清晰的字体
    //     fill: 'blue',         // 设置字体颜色为蓝色
    //     selectable: false    // 确保文本不可选择
    // });
    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    const centerY = cabinetRect.top + cabinetRect.height / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    //   const group = new fabric.Group(
    //     [cabinetRect, verticalLine, leftInnerRect, rightInnerRect, text],
    //     {
    //       left: cabInfo.x, // 设置组的位置
    //       top: cabInfo.y,
    //       //angle: cabInfo.rotation || 0 // 设置旋转
    //       selectable: false     
    //     }
    //   );
    //     // 为组对象设置自定义属性
    //     group.cabinettype = cabInfo.cabinettype;
    //     group.objectname = cabInfo.objectname;
    //     group.scale = cabInfo.scale;
    //     group.depth = cabInfo.depth;
    //     group.kitchen = cabInfo.kitchen;
    //     group.id = cabInfo.id;

    //canvas.add(group);
    return null;
}
const drawCabBSR = (canvas, cabInfo) => {
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高
    const { left, width } = cabinetRect;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    const toeWidth = 4.5 * cabInfo.scale;
    const drawerToeLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerToeLine);
    const top = cabinetRect.top;
    const height = cabinetRect.height - toeWidth;
    // 获取大矩形的中心点和宽高
    // const { left, top, width, height } = cabinetRect;
    // 小矩形的内边距（距离边框 3 像素）
    const padding = 5;
    // 小矩形
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftInnerRect.objectname = cabInfo.objectname;
    leftInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftInnerRect);
    // 创建文本对象
    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    const centerY = cabinetRect.top + cabinetRect.height / 2;
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false,    // 文本不可选择
        clipTo: function (ctx) {
            // 限制文本绘制范围，不影响矩形位置
            ctx.rect(
                -cabinetRect.width / 2, // 相对于文本中心的左边界
                -cabinetRect.height / 2, // 相对于文本中心的上边界
                cabinetRect.width,       // 矩形宽度
                cabinetRect.height       // 矩形高度
            );
        },
    });
    canvas.add(text);

    return null;
}

const drawUpperCabNodrawerSingle = (canvas, cabInfo) => {
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高
    const { left, top, width, height } = cabinetRect;
    // 小矩形的内边距（距离边框 3 像素）
    const padding = 5;
    // 小矩形
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftInnerRect.objectname = cabInfo.objectname;
    leftInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftInnerRect);
    // 创建文本对象
    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    const centerY = cabinetRect.top + cabinetRect.height / 2;
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false,    // 文本不可选择
        clipTo: function (ctx) {
            // 限制文本绘制范围，不影响矩形位置
            ctx.rect(
                -cabinetRect.width / 2, // 相对于文本中心的左边界
                -cabinetRect.height / 2, // 相对于文本中心的上边界
                cabinetRect.width,       // 矩形宽度
                cabinetRect.height       // 矩形高度
            );
        },
    });
    canvas.add(text);
    //       const group = new fabric.Group(
    //     [cabinetRect,  leftInnerRect, text],
    //     {
    //       left: cabInfo.x, // 设置组的位置
    //       top: cabInfo.y,
    //       angle:  0, // 设置旋转
    //       selectable: false 
    //     }
    //   );
    //     // 为组对象设置自定义属性
    //     group.cabinettype = cabInfo.cabinettype;
    //     group.objectname = cabInfo.objectname;
    //     group.scale = cabInfo.scale;
    //     group.depth = cabInfo.depth;
    //     group.kitchen = cabInfo.kitchen;
    //     group.id = cabInfo.id;




    //     // 将矩形和文本对象组合成一个组
    //    // 将所有形状添加到组
    // canvas.add(group);
    return null;
}

// 没有抽屉的下柜
const drawLowerCabNodrawer = (canvas, cabInfo) => {

    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    // 上部一个抽屉
    // 4/5部分画一条直线
    const toeWidth = 4.5 * cabInfo.scale;
    const drawerLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine);

    // toe's width

    // 获取大矩形的中心点和宽高
    const top = outtop;
    const height = Math.round((outheight - toeWidth) * 100) / 100;
    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [Math.round((left + width / 2) * 100) / 100, top, Math.round((left + width / 2) * 100) / 100, top + height],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(verticalLine);

    // 左右小矩形的内边距（距离边框 3 像素）
    const padding = 5;

    // 左矩形
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width / 2 - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftInnerRect.objectname = cabInfo.objectname;
    leftInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftInnerRect);

    // 右矩形
    const rightInnerRect = new fabric.Rect({
        left: left + width / 2 + padding,
        top: top + padding,
        fill: 'transparent',
        width: width / 2 - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    rightInnerRect.objectname = cabInfo.objectname;
    rightInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(rightInnerRect);

    // 计算矩形的中心位置
    const centerX = left + width / 2;
    const centerY = outtop + outheight / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    //   const group = new fabric.Group(
    //     [cabinetRect, verticalLine, leftInnerRect, rightInnerRect, text],
    //     {
    //       left: cabInfo.x, // 设置组的位置
    //       top: cabInfo.y,
    //       angle:  0 // 设置旋转
    //     }
    //   );
    //     // 为组对象设置自定义属性
    //     group.cabinettype = cabInfo.cabinettype;
    //     group.objectname = cabInfo.objectname;
    //     group.scale = cabInfo.scale;
    //     group.depth = cabInfo.depth;
    //     group.kitchen = cabInfo.kitchen;
    //     group.id = cabInfo.id;

    //canvas.add(group);
    return null;
}
// 有抽屉的柜子
const drawLowerCabHasdrawer = (canvas, cabInfo) => {

    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    // 左右小矩形的内边距（距离边框 3 像素）
    const padding = 5;
    // 上部一个抽屉
    const drawWidth = 6.5 * cabInfo.scale;
    // 1/5部分画一条直线
    const drawerLine = new fabric.Line(
        [left, outtop + drawWidth, left + width, outtop + drawWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine);
    const drawerRect = new fabric.Rect({
        left: left + padding,
        top: Math.round((outtop + padding) * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round((cabInfo.width - padding * 2) * 100) / 100,
        height: Math.round((drawWidth - padding * 2) * 100) / 100,
        angle: 0,
        stroke: 'gray', // 边框颜色
        selectable: false  // 确保矩形不可选择
    })
    drawerRect.objectname = cabInfo.objectname;
    drawerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(drawerRect);


    const toeWidth = 4.5 * cabInfo.scale;
    const drawerToeLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerToeLine);

    // 获取大矩形的中心点和宽高
    const top = Math.round((outtop + drawWidth) * 100) / 100;
    const height = Math.round((outheight - drawWidth - toeWidth) * 100) / 100;

    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [Math.round((left + width / 2) * 100) / 100, top, Math.round((left + width / 2) * 100) / 100, top + height],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(verticalLine);



    // 左矩形
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width / 2 - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftInnerRect.objectname = cabInfo.objectname;
    leftInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftInnerRect);

    // 右矩形
    const rightInnerRect = new fabric.Rect({
        left: left + width / 2 + padding,
        top: top + padding,
        fill: 'transparent',
        width: width / 2 - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    rightInnerRect.objectname = cabInfo.objectname;
    rightInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(rightInnerRect);

    // 计算矩形的中心位置
    const centerX = left + width / 2;
    const centerY = outtop + outheight / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    // const group = new fabric.Group(
    // [cabinetRect, verticalLine, leftInnerRect, rightInnerRect, text],
    // {
    //     left: cabInfo.x, // 设置组的位置
    //     top: cabInfo.y,
    //     angle:  0 // 设置旋转
    // }
    // );
    // // 为组对象设置自定义属性
    // group.cabinettype = cabInfo.cabinettype;
    // group.objectname = cabInfo.objectname;
    // group.scale = cabInfo.scale;
    // group.depth = cabInfo.depth;
    // group.kitchen = cabInfo.kitchen;
    // group.id = cabInfo.id;
    // group.objectname = cabInfo.objectname;
    // group.widthcabinet = cabInfo.widthcabinet;
    //canvas.add(group);
    return null;
}

// 有抽屉的柜子
const drawLowerCabHasdrawerSingle = (canvas, cabInfo) => {
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    // 左右小矩形的内边距（距离边框 3 像素）
    const padding = 5;
    // 上部一个抽屉
    const drawWidth = 6.5 * cabInfo.scale;
    // 1/5部分画一条直线
    const drawerLine = new fabric.Line(
        [left, outtop + drawWidth, left + width, outtop + drawWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine);
    const drawerRect = new fabric.Rect({
        left: left + padding,
        top: Math.round((outtop + padding) * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round((cabInfo.width - padding * 2) * 100) / 100,
        height: Math.round((drawWidth - padding * 2) * 100) / 100,
        angle: 0,
        stroke: 'gray', // 边框颜色
        selectable: false  // 确保矩形不可选择
    })
    drawerRect.objectname = cabInfo.objectname;
    drawerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(drawerRect);

    const toeWidth = 4.5 * cabInfo.scale;
    const drawerToeLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerToeLine);

    // 获取大矩形的中心点和宽高
    const top = Math.round((outtop + drawWidth) * 100) / 100;
    const height = Math.round((outheight - drawWidth - toeWidth) * 100) / 100;


    // 左矩形
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftInnerRect.objectname = cabInfo.objectname;
    leftInnerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftInnerRect);
    // 计算矩形的中心位置
    const centerX = left + width / 2;
    const centerY = outtop + outheight / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    // const group = new fabric.Group(
    // [cabinetRect,  leftInnerRect,  text],
    // {
    //     left: cabInfo.x, // 设置组的位置
    //     top: cabInfo.y,
    //     angle:  0 // 设置旋转
    // }
    // );
    // // 为组对象设置自定义属性
    // group.cabinettype = cabInfo.cabinettype;
    // group.objectname = cabInfo.objectname;
    // group.scale = cabInfo.scale;
    // group.depth = cabInfo.depth;
    // group.kitchen = cabInfo.kitchen;
    // group.id = cabInfo.id;

    //canvas.add(group);
    return null;
}
// 2DB
const drawLower2DB = (canvas, cabInfo) => {

    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    const toeWidth = 4.5 * cabInfo.scale;
    const drawerToeLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerToeLine);

    const top = cabinetRect.top;
    const height = cabinetRect.height - toeWidth;


    // 1/2部分画一条直线
    const drawerLine = new fabric.Line(
        [left, outtop + height / 2, left + width, outtop + height / 2],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine);

    // （距离边框 3 像素）
    const padding = 5;

    // 上抽屉
    const drawerUpperRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    drawerUpperRect.objectname = cabInfo.objectname;
    drawerUpperRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(drawerUpperRect);

    // 下抽屉
    const drawerLowerRect = new fabric.Rect({
        left: left + padding,
        top: outtop + height / 2 + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    drawerLowerRect.objectname = cabInfo.objectname;
    drawerLowerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(drawerLowerRect);

    // 计算矩形的中心位置
    const centerX = left + width / 2;
    const centerY = outtop + outheight / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    // const group = new fabric.Group(
    // [cabinetRect, drawerLine, drawerUpperRect, drawerLowerRect, text],
    // {
    //     left: cabInfo.x, // 设置组的位置
    //     top: cabInfo.y,
    //     angle:  0 // 设置旋转
    // }
    // );
    // // 为组对象设置自定义属性
    // group.cabinettype = cabInfo.cabinettype;
    // group.objectname = cabInfo.objectname;
    // group.scale = cabInfo.scale;
    // group.depth = cabInfo.depth;
    // group.kitchen = cabInfo.kitchen;
    // group.id = cabInfo.id;

    //canvas.add(group);
    return null;
}
//3DB
const drawLower3DB = (canvas, cabInfo) => {

    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    const toeWidth = 4.5 * cabInfo.scale;
    const drawerToeLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerToeLine);

    const top = cabinetRect.top;
    const height = cabinetRect.height - toeWidth;


    // 1/3部分画一条直线
    const drawerLine1 = new fabric.Line(
        [left, outtop + height / 3, left + width, outtop + height / 3],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine1);
    // 1/3部分画一条直线
    const drawerLine2 = new fabric.Line(
        [left, outtop + height * 2 / 3, left + width, outtop + height * 2 / 3],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine2);

    // （距离边框 3 像素）
    const padding = 5;

    // 上抽屉
    const drawerUpperRect = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height / 3 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    drawerUpperRect.objectname = cabInfo.objectname;
    drawerUpperRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(drawerUpperRect);
    // 中抽屉
    const drawerMiddleRect = new fabric.Rect({
        left: left + padding,
        top: outtop + height / 3 + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height * 1 / 3 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    drawerMiddleRect.objectname = cabInfo.objectname;
    drawerMiddleRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(drawerMiddleRect);

    // 下抽屉
    const drawerLowerRect = new fabric.Rect({
        left: left + padding,
        top: outtop + height * 2 / 3 + padding,
        fill: 'transparent',
        width: width - padding * 2,
        height: height / 3 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    drawerLowerRect.objectname = cabInfo.objectname;
    drawerLowerRect.widthcabinet = cabInfo.widthcabinet;
    canvas.add(drawerLowerRect);

    // 计算矩形的中心位置
    const centerX = left + width / 2;
    const centerY = outtop + outheight / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    // const group = new fabric.Group(
    // [cabinetRect, drawerLine1, drawerUpperRect, drawerLowerRect, text],
    // {
    //     left: cabInfo.x, // 设置组的位置
    //     top: cabInfo.y,
    //     angle:  0 // 设置旋转
    // }
    // );
    // // 为组对象设置自定义属性
    // group.cabinettype = cabInfo.cabinettype;
    // group.objectname = cabInfo.objectname;
    // group.scale = cabInfo.scale;
    // group.depth = cabInfo.depth;
    // group.kitchen = cabInfo.kitchen;
    // group.id = cabInfo.id;

    //canvas.add(group);
    return null;
}
// BBC柜子

const drawBLS = (canvas, cabInfo) => {
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const top = cabinetRect.top;
    const height = cabinetRect.height;
    //角线
    const toeWidth = 4.5 * cabInfo.scale;
    const drawerLine = new fabric.Line(
        [left, top + height - toeWidth, left + width, top + height - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine);
    // const top = cabinetRect.top;
    const innerheight = cabinetRect.height - toeWidth;

    // （距离边框 3 像素）
    const padding = 5;
    let leftRectX = 0;
    let leftRectWidth = cabInfo.width - 24 * cabInfo.scale - padding * 2;
    if (cabInfo.cabinettype === 'BLS') {
        // 小矩形在左边
        leftRectX = Math.round(cabInfo.x * 100) / 100 + 24 * cabInfo.scale + padding;

    } else {
        leftRectX = Math.round(cabInfo.x * 100) / 100 + padding;
    }


    // 小矩形
    const leftRect = new fabric.Rect({
        left: leftRectX,
        top: Math.round(cabInfo.y * 100) / 100 + padding,
        fill: 'transparent',
        width: leftRectWidth,
        height: Math.round(innerheight * 100) / 100 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    canvas.add(leftRect);

    // 计算矩形的中心位置
    const centerX = Math.round(cabInfo.x * 100) / 100 + Math.round(cabInfo.width * 100) / 100 / 2;
    const centerY = Math.round(cabInfo.y * 100) / 100 + Math.round(innerheight * 100) / 100 / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    // const group = new fabric.Group(
    // [cabinetRect,  text],
    // {
    //     left: cabInfo.x, // 设置组的位置
    //     top: cabInfo.y,
    //     angle:  0 // 设置旋转
    // }
    // );
    // // 为组对象设置自定义属性
    // group.cabinettype = cabInfo.cabinettype;
    // group.objectname = cabInfo.objectname;
    // group.scale = cabInfo.scale;
    // group.depth = cabInfo.depth;
    // group.kitchen = cabInfo.kitchen;
    // group.id = cabInfo.id;

    //canvas.add(group);
    return null;
}
// WP柜子
// 双门高柜
const drawWP = (canvas, cabInfo) => {

    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    //角线
    const toeWidth = 4.5 * cabInfo.scale;
    const drawerLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine);

    // 获取大矩形的中心点和宽高
    const top = outtop;
    const height = Math.round((outheight - toeWidth) * 100) / 100;
    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [Math.round((left + width / 2) * 100) / 100, top, Math.round((left + width / 2) * 100) / 100, top + height],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(verticalLine);
    // 绘制水平分割线
    const horizontalLine = new fabric.Line(
        [left, top + height / 2, left + width, top + height / 2],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(horizontalLine);
    // 左右小矩形的内边距（距离边框 3 像素）
    const padding = 5;
    // 得到被分割的四个矩形的高度和宽度
    const littleRectHeight = height / 2;
    const littleRectWidth = width / 2;

    // 在分割的矩形内绘制两个小矩形
    const leftRect1 = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect1.objectname = cabInfo.objectname;
    leftRect1.widthcabinet = cabInfo.widthcabinet;
    const leftRect2 = new fabric.Rect({
        left: left + padding,
        top: top + littleRectHeight / 2 + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect2.objectname = cabInfo.objectname;
    leftRect2.widthcabinet = cabInfo.widthcabinet;
    const rightRect1 = new fabric.Rect({
        left: left + littleRectWidth + padding,
        top: top + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    rightRect1.objectname = cabInfo.objectname;
    rightRect1.widthcabinet = cabInfo.widthcabinet;
    const rightRect2 = new fabric.Rect({
        left: left + littleRectWidth + padding,
        top: top + littleRectHeight / 2 + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    rightRect2.objectname = cabInfo.objectname;
    rightRect2.widthcabinet = cabInfo.widthcabinet;
    // 在分割的矩形内绘制两个小矩形
    const leftRect3 = new fabric.Rect({
        left: left + padding,
        top: top + littleRectHeight + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect3.objectname = cabInfo.objectname;
    leftRect3.widthcabinet = cabInfo.widthcabinet;
    const leftRect4 = new fabric.Rect({
        left: left + padding,
        top: top + littleRectHeight + littleRectHeight / 2 + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect4.objectname = cabInfo.objectname;
    leftRect4.widthcabinet = cabInfo.widthcabinet;
    const rightRect3 = new fabric.Rect({
        left: left + littleRectWidth + padding,
        top: top + littleRectHeight + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    rightRect3.objectname = cabInfo.objectname;
    rightRect3.widthcabinet = cabInfo.widthcabinet;
    const rightRect4 = new fabric.Rect({
        left: left + littleRectWidth + padding,
        top: top + littleRectHeight + littleRectHeight / 2 + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    rightRect4.objectname = cabInfo.objectname;
    rightRect4.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftRect1, leftRect2, leftRect3, leftRect4, rightRect1, rightRect2, rightRect3, rightRect4);
    // 计算矩形的中心位置
    const centerX = left + width / 2;
    const centerY = outtop + outheight / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);

    return null;
}

// 单门高柜
const drawWPSingle = (canvas, cabInfo) => {

    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round(cabInfo.width * 100) / 100 || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    cabinetRect.objectname = cabInfo.objectname;
    cabinetRect.widthcabinet = cabInfo.widthcabinet;
    // 添加大矩形到画布
    canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高

    const left = cabinetRect.left;
    const width = cabinetRect.width;
    const outtop = cabinetRect.top;
    const outheight = cabinetRect.height;

    //角线
    const toeWidth = 4.5 * cabInfo.scale;
    const drawerLine = new fabric.Line(
        [left, outtop + outheight - toeWidth, left + width, outtop + outheight - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(drawerLine);

    // 获取大矩形的中心点和宽高
    const top = outtop;
    const height = Math.round((outheight - toeWidth) * 100) / 100;

    // 绘制水平分割线
    const horizontalLine = new fabric.Line(
        [left, top + height / 2, left + width, top + height / 2],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    canvas.add(horizontalLine);
    // 左右小矩形的内边距（距离边框 3 像素）
    const padding = 5;
    // 得到被分割的四个矩形的高度和宽度
    const littleRectHeight = height / 2;
    const littleRectWidth = width;

    // 在分割的矩形内绘制两个小矩形
    const leftRect1 = new fabric.Rect({
        left: left + padding,
        top: top + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect1.objectname = cabInfo.objectname;
    leftRect1.widthcabinet = cabInfo.widthcabinet;
    const leftRect2 = new fabric.Rect({
        left: left + padding,
        top: top + littleRectHeight / 2 + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect2.objectname = cabInfo.objectname;
    leftRect2.widthcabinet = cabInfo.widthcabinet;
    // 在分割的矩形内绘制两个小矩形
    const leftRect3 = new fabric.Rect({
        left: left + padding,
        top: top + littleRectHeight + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect3.objectname = cabInfo.objectname;
    leftRect3.widthcabinet = cabInfo.widthcabinet;
    const leftRect4 = new fabric.Rect({
        left: left + padding,
        top: top + littleRectHeight + littleRectHeight / 2 + padding,
        fill: 'transparent',
        width: littleRectWidth - padding * 2,
        height: littleRectHeight / 2 - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    leftRect4.objectname = cabInfo.objectname;
    leftRect4.widthcabinet = cabInfo.widthcabinet;
    canvas.add(leftRect1, leftRect2, leftRect3, leftRect4);
    // 计算矩形的中心位置
    const centerX = left + width / 2;
    const centerY = outtop + outheight / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);
    return null;
}
// WBC
const drawUpperWBCR = (canvas, cabInfo) => {
    // BF
    const bfLeft = 3 * cabInfo.scale;
    const cabinetRect = new fabric.Rect({
        left: Math.round((cabInfo.x + bfLeft) * 100) / 100,
        top: Math.round((cabInfo.y) * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round((cabInfo.width - bfLeft) * 100) / 100 || 100,
        height: Math.round((cabInfo.height) * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });

    // 添加大矩形到画布
    // canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高
    const { left, top, width, height } = cabinetRect;

    const innerheight = cabinetRect.height;

    //门宽度
    const doorWidth = cabInfo.width - cabInfo.depth * cabInfo.scale;
    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [left + width - doorWidth, top, left + width - doorWidth, top + innerheight],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    // canvas.add(verticalLine);
    // 门的内边距（距离边框 3 像素）
    const padding = 5;
    // 门
    const leftInnerRect = new fabric.Rect({
        left: verticalLine.left + padding,
        top: verticalLine.top + padding,
        fill: 'transparent',
        width: doorWidth - padding * 2,
        height: verticalLine.height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    // canvas.add(leftInnerRect);

    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    const centerY = cabinetRect.top + cabinetRect.height / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    // canvas.add( text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    const group = new fabric.Group(
        [cabinetRect, verticalLine, leftInnerRect, text],
        {
            left: cabinetRect.left, // 设置组的位置
            top: cabinetRect.top,
            angle: 0 // 设置旋转
        }
    );
    // 为组对象设置自定义属性
    group.cabinettype = cabInfo.cabinettype;
    group.objectname = cabInfo.objectname;
    // group.width = cabInfo.width;
    group.scale = cabInfo.scale;
    group.depth = cabInfo.depth;
    group.kitchen = cabInfo.kitchen;
    group.id = cabInfo.id;
    group.widthcabinet = cabInfo.widthcabinet;
    canvas.add(group);
    return group;
}

const drawUpperWBCL = (canvas, cabInfo) => {
    // BF
    const bfLeft = 3 * cabInfo.scale;
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round((cabInfo.width - bfLeft) * 100) / 100 || 100,
        height: Math.round((cabInfo.height) * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });

    // 添加大矩形到画布
    // 获取大矩形的中心点和宽高
    const { left, top, width, height } = cabinetRect;

    const innerheight = cabinetRect.height;

    //门宽度
    const doorWidth = cabInfo.width - cabInfo.depth * cabInfo.scale;
    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [left + doorWidth, top, left + doorWidth, top + innerheight],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    //canvas.add(verticalLine);
    // 门的内边距（距离边框 3 像素）
    const padding = 5;
    // 门
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: verticalLine.top + padding,
        fill: 'transparent',
        width: doorWidth - padding * 2,
        height: verticalLine.height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    //canvas.add(leftInnerRect);

    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    const centerY = cabinetRect.top + cabinetRect.height / 2;


    // canvas.add( text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    const group = new fabric.Group(
        [cabinetRect, verticalLine, leftInnerRect],
        {
            left: cabInfo.x, // 设置组的位置
            top: cabInfo.y,
            angle: 0,// 设置旋转
            selectable: false,  // 确保矩形不可选择
            //    lockMovementX: true, // 锁定水平方向移动
            //    lockMovementY: true, // 锁定垂直方向移动
            //    lockScalingX: true, // 禁止修改宽度
            //    lockScalingY: true, // 禁止修改高度
        }
    );
    // 为组对象设置自定义属性
    group.cabinettype = cabInfo.cabinettype;
    group.objectname = cabInfo.objectname;
    group.scale = cabInfo.scale;
    group.depth = cabInfo.depth;
    group.kitchen = cabInfo.kitchen;
    group.id = cabInfo.id;
    group.widthcabinet = cabInfo.widthcabinet;
    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false,     // 文本不可选择
        clipTo: function (ctx) {
            // 限制文本绘制范围，不影响矩形位置
            ctx.rect(
                -cabinetRect.width / 2, // 相对于文本中心的左边界
                -cabinetRect.height / 2, // 相对于文本中心的上边界
                cabinetRect.width,       // 矩形宽度
                cabinetRect.height       // 矩形高度
            );
        },
    });
    canvas.add(group, text);
    return group;
}
// BBC
const drawLowerBBCR = (canvas, cabInfo) => {
    // BF
    const bfLeft = 3 * cabInfo.scale;
    const cabinetRect = new fabric.Rect({
        left: Math.round((cabInfo.x + bfLeft) * 100) / 100,
        top: Math.round((cabInfo.y) * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round((cabInfo.width - bfLeft) * 100) / 100 || 100,
        height: Math.round((cabInfo.height) * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });

    // 添加大矩形到画布
    // canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高
    const { left, top, width, height } = cabinetRect;

    //角线
    const toeWidth = 4.5 * cabInfo.scale;
    const drawerLine = new fabric.Line(
        [left, top + height - toeWidth, left + width, top + height - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    // canvas.add(drawerLine);
    // const top = cabinetRect.top;
    const innerheight = cabinetRect.height - toeWidth;

    //门宽度
    const doorWidth = cabInfo.width - cabInfo.depth * cabInfo.scale;
    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [left + width - doorWidth, top, left + width - doorWidth, top + innerheight],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    // canvas.add(verticalLine);
    // 门的内边距（距离边框 3 像素）
    const padding = 5;
    // 门
    const leftInnerRect = new fabric.Rect({
        left: verticalLine.left + padding,
        top: verticalLine.top + padding,
        fill: 'transparent',
        width: doorWidth - padding * 2,
        height: verticalLine.height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    // canvas.add(leftInnerRect);

    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    const centerY = cabinetRect.top + cabinetRect.height / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    // canvas.add( text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    const group = new fabric.Group(
        [cabinetRect, drawerLine, verticalLine, leftInnerRect, text],
        {
            left: cabinetRect.left, // 设置组的位置
            top: cabinetRect.top,
            angle: 0 // 设置旋转
        }
    );
    // 为组对象设置自定义属性
    group.cabinettype = cabInfo.cabinettype;
    group.objectname = cabInfo.objectname;
    // group.width = cabInfo.width;
    group.scale = cabInfo.scale;
    group.depth = cabInfo.depth;
    group.kitchen = cabInfo.kitchen;
    group.id = cabInfo.id;
    group.widthcabinet = cabInfo.widthcabinet;
    canvas.add(group);
    return group;
}

const drawLowerBBCL = (canvas, cabInfo) => {
    // BF
    const bfLeft = 3 * cabInfo.scale;
    const cabinetRect = new fabric.Rect({
        left: Math.round(cabInfo.x * 100) / 100,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: Math.round((cabInfo.width - bfLeft) * 100) / 100 || 100,
        height: Math.round((cabInfo.height) * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });

    // 添加大矩形到画布
    //canvas.add(cabinetRect);
    // 获取大矩形的中心点和宽高
    const { left, top, width, height } = cabinetRect;

    //角线
    const toeWidth = 4.5 * cabInfo.scale;
    const drawerLine = new fabric.Line(
        [left, top + height - toeWidth, left + width, top + height - toeWidth],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    //canvas.add(drawerLine);
    // const top = cabinetRect.top;
    const innerheight = cabinetRect.height - toeWidth;

    //门宽度
    const doorWidth = cabInfo.width - cabInfo.depth * cabInfo.scale;
    // 绘制垂直分割线
    const verticalLine = new fabric.Line(
        [left + doorWidth, top, left + doorWidth, top + innerheight],
        {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
        }
    );
    //canvas.add(verticalLine);
    // 门的内边距（距离边框 3 像素）
    const padding = 5;
    // 门
    const leftInnerRect = new fabric.Rect({
        left: left + padding,
        top: verticalLine.top + padding,
        fill: 'transparent',
        width: doorWidth - padding * 2,
        height: verticalLine.height - padding * 2,
        stroke: 'gray',
        strokeWidth: 0.5,
        selectable: false
    });
    //canvas.add(leftInnerRect);

    // 计算矩形的中心位置
    const centerX = cabinetRect.left + cabinetRect.width / 2;
    const centerY = cabinetRect.top + cabinetRect.height / 2;

    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    // canvas.add( text);
    // 将矩形和文本对象组合成一个组
    // 将所有形状添加到组
    const group = new fabric.Group(
        [cabinetRect, drawerLine, verticalLine, leftInnerRect, text],
        {
            left: cabInfo.x, // 设置组的位置
            top: cabInfo.y,
            angle: 0 // 设置旋转
        }
    );
    // 为组对象设置自定义属性
    group.cabinettype = cabInfo.cabinettype;
    group.objectname = cabInfo.objectname;
    group.scale = cabInfo.scale;
    group.depth = cabInfo.depth;
    group.kitchen = cabInfo.kitchen;
    group.id = cabInfo.id;
    group.widthcabinet = cabInfo.widthcabinet;
    canvas.add(group);
    return group;
}

const drawBBCD = (canvas, cabInfo) => {
    let leftPosition = cabInfo.x;
    let wfbfLeftPosition = cabInfo.x;
    let rectName = '';
    if (cabInfo.cabinettype === 'BBCLD') {
        wfbfLeftPosition = cabInfo.x + cabInfo.width - 3 * cabInfo.scale;
        rectName = "BF3";
    } else if (cabInfo.cabinettype === 'BBCRD') {
        leftPosition = cabInfo.x + 3 * cabInfo.scale;
        rectName = "BF3";
    } else if (cabInfo.cabinettype === 'WBCLD') {
        wfbfLeftPosition = cabInfo.x + cabInfo.width - 3 * cabInfo.scale;
        rectName = "WF03";
    } else if (cabInfo.cabinettype === 'WBCRD') {
        leftPosition = cabInfo.x + 3 * cabInfo.scale;
        rectName = "WF03";
    }
    // 白色block块
    const cabinetRectBlock = new fabric.Rect({
        left: leftPosition,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFFFF',
        width: Math.round((cabInfo.width - 3 * cabInfo.scale) * 100) / 100 || 100,
        height: Math.round((cabInfo.height) * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });
    canvas.add(cabinetRectBlock);
    // WF03/BF3
    const cabinetRect = new fabric.Rect({
        left: wfbfLeftPosition,
        top: Math.round(cabInfo.y * 100) / 100,
        fill: cabInfo.fill || '#FFFBF0',
        width: 3 * cabInfo.scale || 100,
        height: Math.round(cabInfo.height * 100) / 100 || 20,
        angle: 0,
        stroke: 'black', // 边框颜色
        strokeWidth: 0.5, // 边框宽度
        selectable: false  // 确保矩形不可选择
    });

    // 添加大矩形到画布
    canvas.add(cabinetRect);

    // 计算矩形的中心位置
    const centerX = Math.round(cabinetRect.left * 100) / 100 + Math.round(cabinetRect.width * 100) / 100 / 2;
    const centerY = Math.round(cabinetRect.top * 100) / 100 + Math.round(cabinetRect.height * 100) / 100 / 2;

    // 创建文本对象
    const text = new fabric.Text(rectName || 'Cabinet', {
        left: centerX,        // 文本的中心位置
        top: centerY,
        fontSize: 18,         // 字体大小
        originX: 'center',    // 设置原点为中心
        originY: 'center',    // 设置原点为中心
        fontFamily: 'Arial',  // 字体
        fill: 'blue',         // 字体颜色
        selectable: false     // 文本不可选择
    });
    canvas.add(text);

    return null;
}

export const drawBLSRotate = (canvas, cabInfo, angle, flag) => {
    let cabInfoHeight = cabInfo.depth;
    let cabInfoWidth = cabInfo.width;
    let cabX = cabInfo.x;
    let cabY = cabInfo.y;
    let pathData = null;
    let cabInfoMove = true;
    if (parseFloat(cabInfo.rotation) === 180) {
        cabX = cabInfo.x - cabInfo.width;
    } else if (parseFloat(cabInfo.rotation) === 270) {
        cabX = cabInfo.x - (cabInfo.width - cabInfo.depth);
        cabY = cabInfo.y - cabInfo.width;
    }
    if (flag === "addFlag") {
        cabInfoMove = false;
    }
    const gapSize = cabInfoWidth - cabInfoHeight;
    if (angle === 90) {
        pathData = `
       M 0 0                             
        L ${cabInfoWidth - gapSize} 0          // 横向到缺口左侧
    L ${cabInfoWidth - gapSize} ${gapSize} // 向下缺口高度
    L ${cabInfoWidth} ${gapSize}           // 向右缺口宽度到右上角
    L ${cabInfoWidth} ${cabInfoWidth}      // 纵向到底部
    L 0 ${cabInfoWidth}                    // 横向到左下角
    Z`;

    } else if (angle === 180) {
        pathData = `
        M 0 0                             
        L ${cabInfoWidth} 0          // 横向到缺口左侧
    L ${cabInfoWidth} ${cabInfoHeight} // 向下缺口高度
    L ${cabInfoWidth - gapSize} ${cabInfoHeight}           // 向右缺口宽度到右上角
    L ${cabInfoWidth - gapSize} ${cabInfoWidth}      // 纵向到底部
    L 0 ${cabInfoWidth}                    // 横向到左下角
    Z`;
    } else if (angle === 270) {
        pathData = `
       M 0 0                             
        L ${cabInfoWidth} 0          // 横向到缺口左侧
    L ${cabInfoWidth} ${cabInfoWidth} // 向下缺口高度
    L ${gapSize} ${cabInfoWidth}           // 向右缺口宽度到右上角
    L ${gapSize} ${cabInfoHeight}      // 纵向到底部
    L 0 ${cabInfoHeight}                    // 横向到左下角
    Z`;
    } else {
        pathData = `
        M ${cabInfoWidth} 0                             // 起点：右上角
        V ${cabInfoWidth}                               // 绘制右边到右下角
        H 0                                            // 绘制底边到左下角
        V ${cabInfoWidth - cabInfoHeight}  // 绘制左边到缺口下方
        H ${cabInfoWidth - cabInfoHeight}              // 绘制缺口底边
        V 0                                            // 绘制缺口右边回到起点
        Z                                              // 闭合路径
     `;
    }

    // 创建带缺口的路径
    const path = new fabric.Path(pathData, {
        fill: cabInfo.fill || '#FFFBF0',  // 填充颜色
        left: Math.round(cabX * 100) / 100,      // 矩形起始位置的 X 坐标
        top: Math.round(cabY * 100) / 100, // 矩形起始位置的 Y 坐标
        stroke: 'black',                 // 边框颜色
        strokeWidth: 0.5,                // 边框宽度
        strokeLineJoin: 'round',         // 确保路径的边缘连接是平滑的
        selectable: false  // 确保矩形不可选择
    });
    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: Math.round(cabX + cabInfoWidth / 2),  // 文本居中
        top: Math.round(cabY + cabInfoWidth / 2),    // 文本居中
        fontSize: 14,
        originX: 'center',  // 设置文本原点为中心
        originY: 'center',
        fontFamily: 'Arial', // 使用清晰的字体
        fill: 'blue',         // 设置字体颜色为蓝色
        angle: 0,             // 将文本旋转 90 度
        selectable: false    // 确保文本不可选择
    });
    // 添加路径到画布
    //canvas.add(path, text);
    const group = new fabric.Group([path, text], {
        left: Math.round(path.left * 100) / 100,
        top: Math.round(path.top * 100) / 100,
        width: Math.round(cabInfoWidth * 100) / 100,
        height: Math.round(cabInfoWidth * 100) / 100,
        //    angle: cabInfo.rotation, // 可旋转角度
        selectable: true,  // 确保矩形不可选择
        lockMovementX: cabInfoMove, // 锁定水平方向移动
        lockMovementY: cabInfoMove, // 锁定垂直方向移动
        lockScalingX: true, // 禁止修改宽度
        lockScalingY: true, // 禁止修改高度
    });
    // 为组对象设置自定义属性
    //group.top = path.top + (cabInfoWidth - cabInfoHeight)+ cabInfoWidth / 2;
    group.width = Math.round(cabInfoWidth * 100) / 100;
    group.height = Math.round(cabInfoWidth * 100) / 100;
    group.cabinettype = cabInfo.cabinettype;
    //group.height = cabInfo.height;
    group.objectType = cabInfo.objectType;
    group.objectname = cabInfo.objectname;
    group.rotation = angle;
    group.relatedId = cabInfo.relatedId;
    group.relatedId2 = cabInfo.relatedId2;
    group.color = cabInfo.color;
    group.scale = cabInfo.scale;
    group.depth = cabInfo.depth;
    group.kitchen = cabInfo.kitchen;
    group.id = cabInfo.id;
    group.flag = flag;
    group.widthcabinet = cabInfo.widthcabinet;
    canvas.add(group);

    return group;
}

export const drawSBDRotate = (canvas, cabInfo, angle, flag) => {
    //TODO
    let cabInfoHeight = cabInfo.depth;
    let cabInfoWidth = cabInfo.width;
    let cabX = cabInfo.x;
    let cabY = cabInfo.y;
    let pathData = null;
    let cabInfoMove = true;
    if (flag === "addFlag") {
        cabInfoMove = false;
    }
    if (parseFloat(cabInfo.rotation) === 180) {
        cabX = cabInfo.x - cabInfo.width;
    } else if (parseFloat(cabInfo.rotation) === 270) {
        cabX = cabInfo.x - (cabInfo.width - cabInfo.depth);
        cabY = cabInfo.y - cabInfo.width;
    }
    const gapSize = cabInfoWidth - cabInfoHeight;
    if (angle === 90) {
        pathData = `
            M 0 0 
            L ${cabInfoHeight} 0            // 起点：右上角
            L ${cabInfoWidth} ${gapSize}                                         
            L ${cabInfoWidth} ${cabInfoWidth}                               
            L 0 ${cabInfoWidth}                                           
            Z                            // 闭合路径
        `;

    } else if (angle === 180) {
        pathData = `
            M 0 0 
            L ${cabInfoWidth} 0            // 起点：右上角
            L ${cabInfoWidth} ${cabInfoHeight}                                         
            L ${cabInfoHeight} ${cabInfoWidth}                               
            L  0  ${cabInfoWidth}                                         
            Z                            // 闭合路径
        `;
    } else if (angle === 270) {
        pathData = `
            M 0 0 
            L ${cabInfoWidth} 0            // 起点：右上角
            L ${cabInfoWidth} ${cabInfoWidth}                                         
            L ${gapSize} ${cabInfoWidth}                               
            L  0  ${cabInfoHeight}                                         
            Z                            // 闭合路径
        `;                            // 闭合路径

    } else {
        pathData = `
            M ${gapSize} 0 
            L ${cabInfoWidth} 0            // 起点：右上角
            L ${cabInfoWidth} ${cabInfoWidth}                                         
            L 0 ${cabInfoWidth}                               
            L 0 ${gapSize}                                           
            Z                            // 闭合路径
        `;
    }

    // 创建带缺口的路径
    const path = new fabric.Path(pathData, {
        fill: cabInfo.fill || '#FFFBF0',  // 填充颜色
        left: Math.round(cabX * 100) / 100,      // 矩形起始位置的 X 坐标
        top: Math.round(cabY * 100) / 100, // 矩形起始位置的 Y 坐标
        stroke: 'black',                 // 边框颜色
        strokeWidth: 0.5,                // 边框宽度
        strokeLineJoin: 'round',         // 确保路径的边缘连接是平滑的
        selectable: false  // 确保矩形不可选择
    });
    // 创建文本对象
    const text = new fabric.Text(cabInfo.objectname || 'Cabinet', {
        left: Math.round(cabX + cabInfoWidth / 2),  // 文本居中
        top: Math.round(cabY + cabInfoWidth / 2),    // 文本居中
        fontSize: 14,
        originX: 'center',  // 设置文本原点为中心
        originY: 'center',
        fontFamily: 'Arial', // 使用清晰的字体
        fill: 'blue',         // 设置字体颜色为蓝色
        angle: 0,             // 将文本旋转 90 度
        selectable: false    // 确保文本不可选择
    });
    // 添加路径到画布
    //canvas.add(path, text);
    const group = new fabric.Group([path, text], {
        left: Math.round(path.left * 100) / 100,
        top: Math.round(path.top * 100) / 100,
        width: Math.round(cabInfoWidth * 100) / 100,
        height: Math.round(cabInfoWidth * 100) / 100,
        //    angle: cabInfo.rotation, // 可旋转角度
        selectable: true,  // 确保矩形不可选择
        lockMovementX: cabInfoMove, // 锁定水平方向移动
        lockMovementY: cabInfoMove, // 锁定垂直方向移动
        lockScalingX: true, // 禁止修改宽度
        lockScalingY: true, // 禁止修改高度
    });
    // 为组对象设置自定义属性
    //group.top = path.top + (cabInfoWidth - cabInfoHeight)+ cabInfoWidth / 2;
    group.width = Math.round(cabInfoWidth * 100) / 100;
    group.height = Math.round(cabInfoWidth * 100) / 100;
    group.cabinettype = cabInfo.cabinettype;
    //group.height = cabInfo.height;
    group.objectType = cabInfo.objectType;
    group.objectname = cabInfo.objectname;
    group.rotation = angle;
    group.relatedId = cabInfo.relatedId;
    group.relatedId2 = cabInfo.relatedId2;
    group.color = cabInfo.color;
    group.scale = cabInfo.scale;
    group.depth = cabInfo.depth;
    group.kitchen = cabInfo.kitchen;
    group.id = cabInfo.id;
    group.flag = flag;
    group.widthcabinet = cabInfo.widthcabinet;
    canvas.add(group);

    return group;
}


export const positionMod = (x, y, rotation, width, depth, height, cabinettype, type) => {
    let subObjX = x;
    let subObjY = y;

    if (cabinettype === "BLS" || cabinettype === "WLS") {
        if (rotation === 0) {
            subObjY = y + width - depth;
        } else if (rotation === 90) {

        } else if (rotation === 180) {
            subObjX = x + width;
        } else if (rotation === 270) {
            subObjY = y + width;
            subObjX = x + width - depth;
        }
    } else if (cabinettype === "SBD" || cabinettype === "WDC") {
        if (rotation === 0) {
            subObjY = y + width - depth;
        } else if (rotation === 90) {

        } else if (rotation === 180) {
            subObjX = x + width;
        } else if (rotation === 270) {
            subObjY = y + width;
            subObjX = x + width - depth;
        }
    } else {
        if (rotation === 0) {

        } else if (rotation === 90) {

        } else if (rotation === 180) {
            subObjX = x + width;
        } else if (rotation === 270) {
            subObjY = y + height;
        }
    }
    if (type === "islandiner") {
        if (rotation === 180) {
            subObjX = x;
        }
    }


    return { left: subObjX, top: subObjY };
}