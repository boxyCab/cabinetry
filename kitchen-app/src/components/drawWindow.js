// src/components/drawWindow.js
import fabric from '../utils/fabricConfig';

export const drawWindow = (canvas, shapeData) => {
  const windowObjects = [];
  console.log(shapeData);
    shapeData.forEach((item) => {
      let windowwidth = 0;
      let windowheight = 0;
      let windowY = item.y;
      let windowX = item.x;

    if(parseFloat(item.rotation)===0 ) {
      windowwidth = item.width;
      windowheight = item.depth;
    } else if (parseFloat(item.rotation)===180){
       windowwidth = item.width;
       windowheight = item.depth;
       windowX = windowX - item.width ; // Adjust x position for 180 rotation
    } else if(parseFloat(item.rotation)===90 ) {
      windowwidth = item.depth;
      windowheight = item.width;
    } else if (parseFloat(item.rotation)===270) {
      windowwidth = item.depth;
      windowheight = item.width;
      windowY = windowY - item.width ; // Adjust y position for 270 rotation
    }
      const window = new fabric.Rect({
        left: Math.round(windowX),
        top: Math.round(windowY),
        fill: item.fill || 'white',
        width: Math.round(windowwidth) ,
      height: Math.round(windowheight) ,
        angle:  0,
        selectable: false,  // 确保矩形可选择
        stroke: 'gray',    // 边框颜色为灰色
        strokeWidth: 1     // 边框宽度为 1 像素（可根据需要调整）
      });
      // window.set({
      //   hasRotatingPoint: true,   // Enable rotation control
      //   lockRotation: false,      // Allow free rotation (default behavior)
      //   rotatingPointOffset: 20,  // Distance from the object where the rotation handle appears
      //   angle: 0                  // Initial angle (optional)
      // });
      // Move the object back to its original position after rotation
    // if (parseFloat(item.rotation)>180) {
    //     // 设置旋转中心为左上角
    //     window.set({  originX: 'left',  originY: 'center'});
    //     window.rotate(parseFloat(item.rotation));
    //     window.set({
    //       left: Math.round(parseFloat(item.x+15)) ,  // Re-adjust to move back
    //       center: Math.round(parseFloat(item.y+10)) ,   // Re-adjust to move back
    //       originX: 'left',
    //       originY: 'center'
    //     });
    //   } else {
    //     // 设置旋转中心为左上角
    //     window.set({  originX: 'left',  originY: 'top'});
    //     window.rotate(parseFloat(item.rotation));
    //     window.set({
    //       left: Math.round(parseFloat(item.x)) ,  // Re-adjust to move back
    //       top: Math.round(parseFloat(item.y)) ,   // Re-adjust to move back
    //       originX: 'left',
    //       originY: 'top'
    //     });
    //   }

      let startX = 0;
      let startY = 0;
      let endX = 0;
      let endY = 0;
      if (item.rotation === 0 || item.rotation === 180) {
        startX = Math.round(windowX);
        startY = Math.round(windowY + item.depth / 2);
        endX = Math.round(windowX + item.width);
        endY = Math.round(windowY + item.depth / 2);
      } else {
        startX = Math.round(windowX + item.depth / 2 );
        startY = Math.round(windowY);
        endX = Math.round(windowX + item.depth / 2 );
        endY = Math.round(windowY + item.width);
      }
      // console.log("startX:"+startX);
      // console.log("startY:"+startY);
      // console.log("endX:"+endX);
      // console.log("endY:"+endY);
      // 绘制 一条线
      const line = new fabric.Line([startX, startY, endX, endY], {
        stroke: "gray",
        strokeWidth: 1,
        selectable: false // 不可选
      });
    // // 将矩形和文本对象组合成一个组
    // const group = new fabric.Group([window, line], {
    //     left: window.left,
    //     top: window.top,
    //     width: window.width,
    //     height: window.depth,
    //     angle: window.angle, // 可旋转角度
    // });
    // // 为组对象设置自定义属性

    // group.objectname = window.objectname;
    // group.scale = window.scale;
    // group.depth = window.depth;
    // group.kitchen = window.kitchen;
    // group.id = window.id;

      //canvas.add(window, line);
      // 将矩形和文本对象组合成一个组
      const group = new fabric.Group([window, line], {
        left: window.left,
        top: window.top,
        width: window.width,
        height: window.height,
        angle: window.angle, // 可旋转角度
      });
      // 为组对象设置自定义属性
      group.cabinettype = item.cabinettype;
      group.objectname = item.objectname;
      group.scale = item.scale;
      group.depth = item.depth;
      group.kitchen = item.kitchen;
      group.id = item.id;
        // 组合成一个对象
      canvas.add(group);
    });
    console.log(windowObjects);
    
    return windowObjects;
 };


 export const drawElevationWindow = (canvas, shapeData) => {

  console.log(shapeData);
    shapeData.forEach((item) => {
      const outerRect  = new fabric.Rect({
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

      canvas.add(outerRect);
      // 计算小矩形的位置和尺寸（内边距为 5 像素）
      const innerPadding = 5;

      const innerRect  = new fabric.Rect({
        left: Math.round(item.x) + innerPadding,
        top: Math.round(item.y) + innerPadding,
        fill: 'transparent', // 内部小矩形透明
        width: Math.round(item.width) - innerPadding * 2,
        height: Math.round(item.height) - innerPadding * 2,
        selectable: false,
        stroke: 'gray',
        strokeWidth: 1
      });
      
      // 添加到画布
      canvas.add(innerRect);
      
      // 获取四个角点的坐标
      const outerCorners = [
        { x: outerRect.left, y: outerRect.top },
        { x: outerRect.left + outerRect.width, y: outerRect.top },
        { x: outerRect.left, y: outerRect.top + outerRect.height },
        { x: outerRect.left + outerRect.width, y: outerRect.top + outerRect.height }
      ];
      
      const innerCorners = [
        { x: innerRect.left, y: innerRect.top },
        { x: innerRect.left + innerRect.width, y: innerRect.top },
        { x: innerRect.left, y: innerRect.top + innerRect.height },
        { x: innerRect.left + innerRect.width, y: innerRect.top + innerRect.height }
      ];
      
      // 绘制连接线
      for (let i = 0; i < 4; i++) {
        const line = new fabric.Line(
          [outerCorners[i].x, outerCorners[i].y, innerCorners[i].x, innerCorners[i].y],
          {
            stroke: 'gray',
            strokeWidth: 1,
            selectable: false
          }
        );
        canvas.add(line);
      }
  
    });
    
    return null;
 };