// src/components/drawDoor.js
import fabric from '../utils/fabricConfig';

export const drawDoor = (canvas, shapeData) => {
  const doorObjects = [];
  console.log(shapeData);
    shapeData.forEach((item) => {
      let doorwidth = 0;
      let doorheight = 0;
      let doorY = item.y;
      let doorX = item.x;
    if(parseFloat(item.rotation)===0 || parseFloat(item.rotation)===180) {
      doorwidth = item.width;
      doorheight = item.depth;
      if (parseFloat(item.rotation)===180) {
        doorX = doorX - item.width
      }
    } else if(parseFloat(item.rotation)===90 || parseFloat(item.rotation)===270) {
      doorwidth = item.depth;
      doorheight = item.width;
      if (parseFloat(item.rotation)===270) {
        doorY = doorY - item.width
      }
    } 
      const door = new fabric.Rect({
        left: Math.round(doorX),
        top: Math.round(doorY),
        fill: item.fill || 'white',
        width: Math.round(doorwidth) ,
      height: Math.round(doorheight) ,
        // angle: item.rotation || 0,
        selectable: false,  // 确保矩形可选择
        stroke: 'gray',    // 边框颜色为灰色
        strokeWidth: 1     // 边框宽度为 1 像素（可根据需要调整）
      });
    //   door.set({
    //     hasRotatingPoint: true,   // Enable rotation control
    //     lockRotation: false,      // Allow free rotation (default behavior)
    //     rotatingPointOffset: 20,  // Distance from the object where the rotation handle appears
    //     angle: 0                  // Initial angle (optional)
    //   });
    //   // Move the object back to its original position after rotation
    // if (parseFloat(item.rotation)>180) {
    //     // 设置旋转中心为左上角
    //     door.set({  originX: 'left',  originY: 'center'});
    //     door.rotate(parseFloat(item.rotation));
    //     door.set({
    //       left: Math.round(parseFloat(item.x+15)) ,  // Re-adjust to move back
    //       center: Math.round(parseFloat(item.y+10)) ,   // Re-adjust to move back
    //       originX: 'left',
    //       originY: 'center'
    //     });
    //   } else {
    //     // 设置旋转中心为左上角
    //     door.set({  originX: 'left',  originY: 'top'});
    //     door.rotate(parseFloat(item.rotation));
    //     door.set({
    //       left: Math.round(parseFloat(item.x)) ,  // Re-adjust to move back
    //       top: Math.round(parseFloat(item.y)) ,   // Re-adjust to move back
    //       originX: 'left',
    //       originY: 'top'
    //     });
    //   }
      door.id = item.id;
      canvas.add(door);
      doorObjects.push(door);
    });
    console.log(doorObjects);
    return doorObjects;
 };

 export const drawElevationDoor = (canvas, shapeData) => {
  console.log(shapeData);
    shapeData.forEach((item) => {
      const door = new fabric.Rect({
        left: Math.round(item.x),
        top: Math.round(item.y),
        fill: item.fill || 'white',
        width: Math.round(item.width) || 100,
        height: Math.round(item.height) || 20,
        angle:  0,
        selectable: false,  // 确保矩形可选择
        stroke: 'gray',    // 边框颜色为灰色
        strokeWidth: 1     // 边框宽度为 1 像素（可根据需要调整）
      });
     
      canvas.add(door);
      // 添加 door 矩形到画布
canvas.add(door);

// 计算 door 的坐标和尺寸
const { left, top, width, height } = door;

// 左边线
const leftLine = new fabric.Line(
  [left + 5, top + 5, left + 5, top + height ],
  {
    stroke: 'gray',
    strokeWidth: 1,
    selectable: false
  }
);

// 上边线
const topLine = new fabric.Line(
  [left + 5, top + 5, left + width - 5, top + 5],
  {
    stroke: 'gray',
    strokeWidth: 1,
    selectable: false
  }
);

// 右边线
const rightLine = new fabric.Line(
  [left + width - 5, top + 5, left + width - 5, top + height],
  {
    stroke: 'gray',
    strokeWidth: 1,
    selectable: false
  }
);


// 顶部两个顶角的连线
const topCornersLine1 = new fabric.Line(
  [left, top, left + 5, top + 5],
  {
    stroke: 'gray',
    strokeWidth: 1,
    selectable: false
  }
);

const topCornersLine2 = new fabric.Line(
  [left + width, top , left + width - 5, top + 5],
  {
    stroke: 'gray',
    strokeWidth: 1,
    selectable: false
  }
);

// 添加所有对象到画布
canvas.add(leftLine, topLine, rightLine, topCornersLine1, topCornersLine2);
    });
    //console.log(doorObjects);
    return null;
 };