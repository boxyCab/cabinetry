import fabric from '../utils/fabricConfig';
import store, { updateCabinet, selectKitchenShapeType } from './../store';
const DrawApplianceSet = (canvas, shapeData, canvasflg, dispatch, cabinetObject) => {
    const drawAppliance = (canvas, applianceInfo, id, canvasflg) => {
        let applianceWidth = 0;
        let applianceHeight = 0;
        let cabX = applianceInfo.x;
        let cabY = applianceInfo.y;

        if (parseFloat(applianceInfo.rotation) === 0) {
            applianceWidth = applianceInfo.width;
            applianceHeight = applianceInfo.depth;
        } else if (parseFloat(applianceInfo.rotation) === 180) {
            applianceWidth = applianceInfo.width;
            applianceHeight = applianceInfo.depth;
            cabX = applianceInfo.x - applianceInfo.width;
        } else if (parseFloat(applianceInfo.rotation) === 90) {
            applianceWidth = applianceInfo.depth;
            applianceHeight = applianceInfo.width;
        } else if (parseFloat(applianceInfo.rotation) === 270) {
            applianceWidth = applianceInfo.depth;
            applianceHeight = applianceInfo.width;
            cabY = applianceInfo.y - applianceInfo.width;
        }
        const appRect = new fabric.Rect({
            left: Math.round(cabX * 100) / 100,
            top: Math.round(cabY * 100) / 100,
            fill: applianceInfo.fill || '#E1E1FF',
            width: Math.round(applianceWidth * 100) / 100 || 100,
            height: Math.round(applianceHeight * 100) / 100 || 20,
            angle: 0,
            stroke: 'black', // 边框颜色
            strokeWidth: 0.5, // 边框宽度

            selectable: false  // 确保矩形可选择
        });
        // 创建文本对象
        const text = new fabric.Text(applianceInfo.objectname || 'Appliance', {
            left: Math.round((cabX + applianceWidth / 2) * 100) / 100,  // 文本居中
            top: Math.round((cabY + applianceHeight / 2) * 100) / 100,    // 文本居中
            fontSize: 14,
            originX: 'center',  // 设置文本原点为中心
            originY: 'center',
            fontFamily: 'Arial', // 使用清晰的字体
            fill: 'blue',         // 设置字体颜色为蓝色
            angle: applianceInfo.rotation,             // 将文本旋转 90 度
            selectable: false    // 确保文本不可选择
        });
        // canvas.add(appRect, text); // 同时添加矩形和文本
        // 将矩形和文本对象组合成一个组
        let lockXO = true;
        let lockYO = true;
        if (applianceInfo.rotation === 90 || applianceInfo.rotation === 270) {
            lockYO = false;
        } else if (applianceInfo.rotation === 0 || applianceInfo.rotation === 180) {
            lockXO = false;
        }

        const group = new fabric.Group([appRect, text], {
            left: Math.round(cabX * 100) / 100,
            top: Math.round(cabY * 100) / 100,
            width: Math.round(appRect.width * 100) / 100,
            height: Math.round(appRect.height * 100) / 100,
            angle: appRect.angle, // 可旋转角度
            selectable: true, // 矩形可选
            lockMovementX: lockXO, // 锁定水平方向移动
            lockMovementY: lockYO, // 锁定垂直方向移动
            lockScalingX: true, // 禁止修改宽度
            lockScalingY: true, // 禁止修改高度

        });
        // 为组对象设置自定义属性
        group.width = appRect.width;
        group.height = appRect.height;
        group.wallid = applianceInfo.wallid;
        group.cabinettype = applianceInfo.cabinettype;
        //group.height = cabInfo.height;
        group.objectType = applianceInfo.objectType;
        group.rotation = applianceInfo.rotation;
        group.relatedId = applianceInfo.relatedId;
        group.objectname = applianceInfo.objectname;
        group.scale = applianceInfo.scale;
        group.depth = applianceInfo.depth;
        group.kitchen = applianceInfo.kitchen;
        group.id = applianceInfo.id;
        group.widthcabinet = applianceInfo.widthcabinet;
        group.flag = "init";
        canvas.add(group);
        if (!group._hasMovedEvent) {
            group.on("modified", function () {
                group.flag = "moveFlag";   // 在对象上打标记
                console.log("Object moved, rect.flag =", group.flag);
                // const cabinetObject = selectCabinetObject(store.getState());
                let canvasObjectStore = cabinetObject.canvasObjectList;
                let cabinetListStore = cabinetObject.cabinetObjectList;
                let newWallList = cabinetObject.canvasWallList;
                let kitchenShapeType = selectKitchenShapeType(store.getState());
                let objectX = group.left;
                let objectY = group.top;

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
                } else {
                    wallAdjust = wallXS_adjust;
                }
                if (group.rotation === 0) {
                    objectStartPosition = (group.left - wallcabMove.x - wallAdjust) / group.scale;
                } else if (group.rotation === 90) {
                    objectStartPosition = (group.top - (wallcabMove.y)) / group.scale;
                } else if (group.rotation === 180) {
                    objectX = objectX + group.width;
                    objectStartPosition = (wallcabMove.x + wallcabMove.width - group.left - group.width) / group.scale;
                } else if (group.rotation === 270) {
                    objectY = objectY + group.height;
                    // objectStartPosition = (wallcabMove.y - group.top - group.height)/group.scale;
                    objectStartPosition = (wallcabMove.y + wallcabMove.width - group.top - group.height) / group.scale;
                }
                let updatedCanvasObjectstmp = canvasObjectStore.map(item => {
                    if (item.id === group.id) {
                        return {
                            ...item,
                            x: objectX,
                            y: objectY,
                            // rotation: group.rotation,
                            flag: "moveFlag",
                            updateFlg: 2
                        };
                    }
                    return item;
                });
                let updatedCabinettmp = cabinetListStore.map(item => {
                    if (item.name === group.cabinettype) {
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
                dispatch(updateCabinet(updateCabinetTMP));
            });
            group._hasMovedEvent = true; // 打个标记，避免重复绑定
        }
        // 组合成一个对象
        return {
            id: id, // 给对象一个编号
            appliance: appRect,
            label: text
        };
    };
    return shapeData.map((item, index) => drawAppliance(canvas, item, index, canvasflg));


};
export const drawElevationAppliance = (canvas, applianceInfolist) => {
    applianceInfolist.map(applianceInfo => {
        const appRect = new fabric.Rect({
            left: Math.round(applianceInfo.x * 100) / 100,
            top: Math.round(applianceInfo.y * 100) / 100,
            fill: applianceInfo.fill || '#E1E1FF',
            width: Math.round(applianceInfo.width * 100) / 100 || 100,
            height: Math.round(applianceInfo.height * 100) / 100 || 20,
            angle: 0,
            stroke: 'black', // 边框颜色
            strokeWidth: 0.5, // 边框宽度
            selectable: false  // 确保矩形可选择
        });
        // 创建文本对象
        const text = new fabric.Text(applianceInfo.objectname || 'Appliance', {
            left: Math.round((applianceInfo.x + applianceInfo.width / 2) * 100) / 100,  // 文本居中
            top: Math.round((applianceInfo.y + applianceInfo.height / 2) * 100) / 100,    // 文本居中
            fontSize: 18,
            originX: 'center',  // 设置文本原点为中心
            originY: 'center',
            fontFamily: 'Arial', // 使用清晰的字体
            fill: 'blue',         // 设置字体颜色为蓝色
            selectable: false    // 确保文本不可选择
        });
        //canvas.add(appRect, text); // 同时添加矩形和文本

        // 将矩形和文本对象组合成一个组
        const group = new fabric.Group([appRect, text], {
            left: appRect.left,
            top: appRect.top,
            width: appRect.width,
            height: appRect.height,
            angle: 0, // 可旋转角度
            selectable: false    // 确保文本不可选择
        });
        // 为组对象设置自定义属性
        group.cabinettype = applianceInfo.cabinettype;
        group.objectname = applianceInfo.objectname;
        group.scale = applianceInfo.scale;
        group.depth = applianceInfo.depth;
        group.kitchen = applianceInfo.kitchen;
        group.id = applianceInfo.id;
        group.widthcabinet = applianceInfo.widthcabinet;
        // 组合成一个对象
        canvas.add(group);


    })
};

export default DrawApplianceSet;