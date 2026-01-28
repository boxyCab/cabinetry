// src/components/drawWall.js
import fabric from '../utils/fabricConfig';
import { fraction } from 'mathjs';

export const drawWall = (canvas, shapeData, kitchenShapeType) => {
  const wallObjects = [];
  console.log(shapeData);
  shapeData.forEach((item) => {
    // 0 初期化，1：有90度，2：有270度，
    // let movingWidthFlag = 0;
    // if(item.rotation === 90 ) {
    //   if(movingWidthFlag === 0) {
    //     movingWidthFlag = 1;
    //   } else if (movingWidthFlag === 2) {
    //     // 保持不变
    //   }
    // } else if(item.rotation === 270) {
    //    movingWidthFlag = 2;
    // }
    let wallwidth = 0;
    let wallheight = 0;

    if (parseFloat(item.rotation) === 0 || parseFloat(item.rotation) === 180) {
      wallwidth = item.width;
      wallheight = item.height;
    } else if (parseFloat(item.rotation) === 90 || parseFloat(item.rotation) === 270) {
      wallwidth = item.height;
      wallheight = item.width;
    }
    const wall = new fabric.Rect({
      left: Math.round(item.x * 100) / 100,
      top: Math.round(item.y * 100) / 100,
      fill: item.fill || 'gray',
      width: Math.round(wallwidth * 100) / 100,
      height: Math.round(wallheight * 100) / 100,
      angle: 0,
      selectable: false,
      evented: false
    });

    const group = new fabric.Group([wall], {
      left: Math.round(item.x * 100) / 100,
      top: Math.round(item.y * 100) / 100,
      angle: 0,
      selectable: false,
      evented: false
    });
    group.width = wall.width;
    group.height = wall.height;
    group.objectType = item.objectType;
    group.objectname = item.objectname;
    group.scale = item.scale;
    group.depth = item.depth;
    group.id = item.id;

    canvas.add(group);
    wallObjects.push(wall);
    // 增加墙体标尺
    let rulerX = item.x;
    let rulerY = item.y;
    if (item.rotation === 0) {
      rulerY = rulerY + 30;
    } else if (item.rotation === 90) {
      rulerX = rulerX - 10;
    } else if (item.rotation === 270) {
      rulerX = rulerX + 30;
    }
    let wallWidth_ad = Math.round(item.width * 100) / 100;
    if (kitchenShapeType === "L" && item.rotation === 0) {
      wallWidth_ad = item.width - 20;
    } else if (kitchenShapeType === "U" && item.rotation === 0) {
      wallWidth_ad = item.width - 40;
    }
    let itemRuler = {
      x: rulerX,
      y: rulerY,
      width: wallWidth_ad, // 墙体宽度
      rotation: item.rotation,
      scale: item.scale || 1,   // 缩放比例   
    }
    drawWallruler(canvas, itemRuler, kitchenShapeType);
  });
  //console.log(wallObjects);
  return wallObjects;
};

// 设置墙体属性的函数
export const setWallProperties = (canvas, walls, eventstatus) => {
  if (!eventstatus) {
    walls.map(wall => {
      wall.set('selectable', false);
    });
  } else {
    walls.map(wall => {
      wall.set({
        selectable: true, // 设置为可编辑
        hasControls: true, // 显示缩放和旋转控件
        lockMovementX: false, // 允许在 X 轴上移动
        lockMovementY: false, // 允许在 Y 轴上移动
      });

      wall.set({
        hasRotatingPoint: true // 启用旋转控制点
      });
      if (parseFloat(wall.angle) < 90) {
        console.log("rotation < 90:" + wall.angle);
        wall.setControlsVisibility({
          mt: false, // 上中
          mb: false, // 下中
          ml: true, // 左中
          mr: true, // 右中
          tl: false, // 左上
          tr: false, // 右上
          bl: false, // 左下
          br: false  // 右下
        });
      } else {
        wall.setControlsVisibility({
          mt: false, // 上中
          mb: false, // 下中
          ml: true, // 左中
          mr: true, // 右中
          tl: false, // 左上
          tr: false, // 右上
          bl: false, // 左下
          br: false  // 右下
        });
      }
    });
  }


};

// 增加一面墙体
export const addWallItem = (canvas, item) => {
  const wall = new fabric.Rect({
    left: Math.round(item.x * 100) / 100,
    top: Math.round(item.y * 100) / 100,
    fill: item.fill || 'gray',
    width: Math.round(item.width * 100) / 100 || 100,
    height: Math.round(item.height * 100) / 100 || 20,
    angle: item.angle || 0,
    selectable: false  // 确保矩形可选择
  });
  wall.set({
    hasRotatingPoint: true,   // Enable rotation control
    lockRotation: false,      // Allow free rotation (default behavior)
    rotatingPointOffset: 20,  // Distance from the object where the rotation handle appears
    angle: 0                  // Initial angle (optional)
  });
  wall.id = item.id;
  canvas.add(wall);
  return wall;
};
export const drawWallruler = (canvas, item, kitchenShapeType) => {

  console.log(item);
  // 起点和终点
  let startX = item.x;
  let startY = item.y;
  let endX = item.x + item.width;
  let endY = item.y;
  let width = Math.round(item.width / item.scale * 100) / 100;
  if (item.rotation === 0) {
    if (kitchenShapeType === "L") {
      startX = item.x + 20;
      endX = item.x + item.width + 20;
    } else if (kitchenShapeType === "U") {
      startX = item.x + 20;
      endX = item.x + item.width + 20;
    } else {
      // endX = endX + 20;
    }
  } else if (item.rotation === 90 || item.rotation === 270) {
    endX = item.x;
    endY = item.y + item.width;
  } else if (item.rotation === 180) {
    startY = item.y - 10;
    endY = item.y - 10;
  }

  // 创建尺寸线
  const mainLine = new fabric.Line([startX, startY, endX, endY], {
    stroke: 'blue',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });

  const shortLine = 6;
  /**
       * 画垂直/水平刻度线
       */
  function drawPerpendicularMark(px, py, length, orientation) {
    const half = length / 2;
    let x1, y1, x2, y2;

    if (orientation === 'vertical') {
      // 主线垂直 → 标尺水平
      x1 = px - half;
      y1 = py;
      x2 = px + half;
      y2 = py;
    } else {
      // 主线水平 → 标尺垂直
      x1 = px;
      y1 = py - half;
      x2 = px;
      y2 = py + half;
    }

    const mark = new fabric.Line([x1, y1, x2, y2], {
      stroke: 'blue',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    canvas.add(mark);
  }
  drawPerpendicularMark(startX, startY, 12, (item.rotation === 0 || item.rotation === 180) ? 'horizontal' : 'vertical');
  drawPerpendicularMark(endX, endY, 12, (item.rotation === 0 || item.rotation === 180) ? 'horizontal' : 'vertical');
  // const shortLine1 = new fabric.Line(
  //   [startX + shortLine, startY - shortLine, startX - shortLine, startY + shortLine],
  //   {
  //     stroke: 'blue',
  //     strokeWidth: 1,
  //   }
  // );

  //   // 创建终点的短斜线
  //   const shortLine2 = new fabric.Line(
  //     [endX + shortLine, endY - shortLine, endX - shortLine, endY + shortLine],
  //     {
  //       stroke: 'blue',
  //       strokeWidth: 1,
  //     }
  //   );
  // 添加标注文字
  let textLeft = (startX + endX) / 2;
  let textTop = startY + 20;
  if (item.rotation === 90) {
    textLeft = startX - 20;
    textTop = (startY + endY) / 2;
  } else if (item.rotation === 270) {
    textLeft = startX + 20;
    textTop = (startY + endY) / 2;
  } else if (item.rotation === 180) {
    textTop = startY - 20;
  }
  const displayText = Number.isInteger(width)
    ? width.toString()
    : width.toFixed(2);
  const textD = formatFraction(displayText);
  const text = new fabric.Text(textD, {
    fontSize: 16,
    fill: 'blue',
    left: textLeft,
    top: textTop,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false
  });
  // 添加到画布
  canvas.add(mainLine, text);
}
export const drawElevationWall = (canvas, item) => {
  const wallObjects = [];
  console.log(item);
  // 起点和终点
  const startX = item.x;
  const startY = item.y;
  const endX = item.x + item.width;
  const endY = item.y;
  const width = Math.round(item.width / item.scale * 100) / 100;


  // 创建尺寸线
  const mainLine = new fabric.Line([startX, startY, endX, endY], {
    stroke: 'blue',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });

  const shortLine = 6;

  // 创建起点的短斜线
  const shortLine1 = new fabric.Line(
    [startX + shortLine, startY - shortLine, startX - shortLine, startY + shortLine],
    {
      stroke: 'blue',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    }
  );

  // 创建终点的短斜线
  const shortLine2 = new fabric.Line(
    [endX + shortLine, endY - shortLine, endX - shortLine, endY + shortLine],
    {
      stroke: 'blue',
      strokeWidth: 1,
      selectable: false,
      evented: false,
    }
  );
  const displayText = Number.isInteger(width)
    ? width.toString()
    : width.toFixed(2);
  const textD = formatFraction(displayText);
  // 添加标注文字
  const text = new fabric.Text(textD, {
    fontSize: 16,
    fill: 'blue',
    left: (startX + endX) / 2,
    top: startY + 20,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false
  });

  // 添加到画布
  // 标注高度的时候，scale使用的是9
  let scaleY = 9;
  canvas.add(mainLine, shortLine1, shortLine2, text);
  let itemRuler = {
    x: item.x - 20,
    y: item.y - item.ceilingHeight * scaleY,
    width: item.ceilingHeight * scaleY, // 墙体宽度
    rotation: 90,
    scale: scaleY || 1,   // 缩放比例   
  }
  drawWallruler(canvas, itemRuler, 0);
  return wallObjects;
};

function decimalToFraction(decimal) {
  const f = fraction(decimal);
  return `${f.n}/${f.d}`;
}
function formatFraction(decimal) {
  const intPart = Math.floor(decimal);
  const fracPart = decimal - intPart;
  if (fracPart === 0) return intPart.toString();

  const frac = decimalToFraction(fracPart);
  return intPart ? `${intPart} ${frac}` : frac;
}


