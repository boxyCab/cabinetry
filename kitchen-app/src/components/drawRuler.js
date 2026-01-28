// src/components/drawRuler.js
import fabric from '../utils/fabricConfig';
import { fraction } from 'mathjs';

export const drawRuler = (canvas, shapeData, kitchenShapeType, canvaswallsObject) => {
  const wallObjects = [];
  console.log(shapeData);
  // 最后一个短线需要添加  TODO
  shapeData.forEach((itemList) => {
    let itemRulerWall = { point: [], coordinates: '', wordDirection: '', scale: 1 };
    let itemRulerIslandinner = { point: [], coordinates: '', wordDirection: '', scale: 1 };
    let itemRulerIslandOuter = { point: [], coordinates: '', wordDirection: '', scale: 1 };
    let islandinner = false;
    let islandouter = false;
    let isWall = false;
    let adj_heightIn = 0;
    let adj_heightOut = 0;
    let wallid = itemList.find(item => item.wallid)?.wallid;
    if (wallid === undefined) return;
    // 使用 find 方法获取 wallid 等于 tempwalli 的对象
    const wallObject = canvaswallsObject.find(item => item.wallid === wallid);
    if (wallObject.objectType === 'island' || wallObject.objectType === 'peninsula') {
      if (wallObject.rotation === 0 || wallObject.rotation === 180) {
        itemRulerIslandinner.coordinates = 'Y';
        itemRulerIslandOuter.coordinates = 'Y';
      } else if (wallObject.rotation === 90 || wallObject.rotation === 270) {
        itemRulerIslandinner.coordinates = 'X';
        itemRulerIslandOuter.coordinates = 'X';

      }
    } else {
      if (wallObject.rotation === 0 || wallObject.rotation === 180) {
        itemRulerWall.coordinates = 'Y';
      } else if (wallObject.rotation === 90 || wallObject.rotation === 270) {
        itemRulerWall.coordinates = 'X';
      }
    }

    let filterItemList = itemList.filter(item => item.cabinettype !== "SP");
    filterItemList.forEach((item) => {
      if (item.objectType === 'islandiner') {
        islandinner = true;
        itemRulerIslandinner.scale = item.scale || 1;
        adj_heightIn = item.depth;
        if (item.rotation === 0) {
          itemRulerIslandinner.wordDirection = 'M';
          itemRulerIslandinner.point.push(item.x);
          itemRulerIslandinner.point.push(item.x + item.width);
        } else if (item.rotation === 180) {
          itemRulerIslandinner.wordDirection = 'P';
          itemRulerIslandinner.point.push(item.x);
          itemRulerIslandinner.point.push(item.x - item.width);
        } else if (item.rotation === 90) {
          itemRulerIslandinner.wordDirection = 'P';
          itemRulerIslandinner.point.push(item.y);
          itemRulerIslandinner.point.push(item.y + item.width);
        } else if (item.rotation === 270) {
          itemRulerIslandinner.wordDirection = 'M';
          itemRulerIslandinner.point.push(item.y);
          itemRulerIslandinner.point.push(item.y - item.width);
        }
      } else if (item.objectType === 'islandouter') {
        islandouter = true;
        itemRulerIslandOuter.scale = item.scale || 1;
        adj_heightOut = item.depth;
        if (item.rotation === 0) {
          itemRulerIslandOuter.wordDirection = 'M';
          itemRulerIslandOuter.point.push(item.x);
          itemRulerIslandOuter.point.push(item.x + item.width);
        } else if (item.rotation === 180) {
          itemRulerIslandOuter.wordDirection = 'P';
          itemRulerIslandOuter.point.push(item.x);
          itemRulerIslandOuter.point.push(item.x - item.width);
        } else if (item.rotation === 90 && wallObject.rotation === item.rotation) {
          itemRulerIslandOuter.wordDirection = 'P';
          itemRulerIslandOuter.point.push(item.y);
          itemRulerIslandOuter.point.push(item.y + item.width);

        } else if (item.rotation === 90 && wallObject.rotation !== item.rotation) {
          itemRulerIslandOuter.wordDirection = 'P';
          itemRulerIslandOuter.point.push(item.y);
          itemRulerIslandOuter.point.push(item.y + item.width);
        } else if (item.rotation === 270 && wallObject.rotation === item.rotation) {
          itemRulerIslandOuter.wordDirection = 'M';
          itemRulerIslandOuter.point.push(item.y);
          itemRulerIslandOuter.point.push(item.y - item.width);
        } else if (item.rotation === 270 && wallObject.rotation !== item.rotation) {
          itemRulerIslandOuter.wordDirection = 'M';
          itemRulerIslandOuter.point.push(item.y);
          itemRulerIslandOuter.point.push(item.y + item.width);
        }
      } else {
        isWall = true;
        itemRulerWall.scale = item.scale || 1;
        if (item.rotation === 0) {
          itemRulerWall.wordDirection = 'P';
          itemRulerWall.point.push(item.x);
          itemRulerWall.point.push(item.x + item.width);
        } else if (item.rotation === 180) {
          itemRulerWall.wordDirection = 'M';
          itemRulerWall.point.push(item.x);
          itemRulerWall.point.push(item.x - item.width);
        } else if (item.rotation === 90) {
          itemRulerWall.wordDirection = 'M';
          itemRulerWall.point.push(item.y);
          itemRulerWall.point.push(item.y + item.width);
        } else if (item.rotation === 270) {
          itemRulerWall.wordDirection = 'P';
          itemRulerWall.point.push(item.y);
          itemRulerWall.point.push(item.y - item.width);
        }
      }
    });
    // 得到一个
    // 去掉重复值 + 排序
    itemRulerWall.point = [...new Set(itemRulerWall.point)].sort((a, b) => a - b);
    itemRulerIslandinner.point = [...new Set(itemRulerIslandinner.point)].sort((a, b) => a - b);
    itemRulerIslandOuter.point = [...new Set(itemRulerIslandOuter.point)].sort((a, b) => a - b);
    let wallWidthCab_ad = Math.round(wallObject.widthcabinet * 100) / 100;
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    let startXIslandIn = 0;
    let startYIslandIn = 0;
    let endXIslandIn = 0;
    let endYIslandIn = 0;
    let startXIslandOut = 0;
    let startYIslandOut = 0;
    let endXIslandOut = 0;
    let endYIslandOut = 0;
    let wallWidth_ad = Math.round(wallObject.width * 100) / 100;
    if (wallObject.objectType === 'island' || wallObject.objectType === 'peninsula') {
      if (islandinner) {
        if (wallObject.rotation === 180) {
          wallWidth_ad = wallObject.width;
          startXIslandIn = wallObject.x;
          endXIslandIn = startXIslandIn + wallObject.width;
          startYIslandIn = wallObject.y + adj_heightIn + 20;
          endYIslandIn = startYIslandIn;
        } else if (wallObject.rotation === 270) { // 270
          wallWidth_ad = wallObject.width;
          startXIslandIn = wallObject.x - adj_heightIn - 20;
          endXIslandIn = startXIslandIn;
          startYIslandIn = wallObject.y;
          endYIslandIn = startYIslandIn - wallObject.width;
        } else if (wallObject.rotation === 90) { // 
          wallWidth_ad = wallObject.width;
          startXIslandIn = wallObject.x + adj_heightIn + 20;
          endXIslandIn = startXIslandIn;
          startYIslandIn = wallObject.y;
          endYIslandIn = startYIslandIn + wallObject.width;
        } else if (wallObject.rotation === 0) { // 
          wallWidth_ad = wallObject.width;
          startXIslandIn = wallObject.x;
          endXIslandIn = startXIslandIn + wallObject.width;
          startYIslandIn = wallObject.y - adj_heightIn - 20;
          endYIslandIn = startYIslandIn;
        }
      }
      if (islandouter) {
        if (wallObject.rotation === 180) {
          wallWidth_ad = wallObject.width;
          startXIslandOut = wallObject.x;
          endXIslandOut = startXIslandOut + wallObject.width
          startYIslandOut = wallObject.y - adj_heightOut - 20;
          endYIslandOut = startYIslandOut;
        } else if (wallObject.rotation === 270) {// 270
          wallWidth_ad = wallObject.width;
          startXIslandOut = wallObject.x + adj_heightOut + 20;
          endXIslandOut = startXIslandOut;
          startYIslandOut = wallObject.y;
          endYIslandOut = startYIslandOut - wallObject.width;
        } else if (wallObject.rotation === 90) { // 
          wallWidth_ad = wallObject.width;
          startXIslandOut = wallObject.x - adj_heightOut - 20;
          endXIslandOut = startXIslandOut;
          startYIslandOut = wallObject.y;
          endYIslandOut = startYIslandOut + wallObject.width;
        } else if (wallObject.rotation === 0) { // 
          wallWidth_ad = wallObject.width;
          startXIslandOut = wallObject.x;
          endXIslandOut = startXIslandOut + wallObject.width
          startYIslandOut = wallObject.y - adj_heightOut - 20;
          endYIslandOut = startYIslandOut;
        }
      }
      // if (wallObject.rotation === 180) {
      //     wallWidth_ad = wallObject.width ;
      //     startX = wallObject.x ;
      //     endX = startX + wallObject.width 
      //     startY = wallObject.y + 50;
      //     endY = startY ;
      // } else { // 270
      //   wallWidth_ad = wallObject.width ;
      //   startX = wallObject.x ;
      //   endX = startX + wallObject.width 
      //   startY = wallObject.y - 50;
      //   endY = startY ;
      // }    

    } else {
      if (kitchenShapeType === "I") {
        wallWidth_ad = wallObject.width;
        startX = wallObject.x;
        endX = startX + wallObject.width
        startY = wallObject.y + 70;
        endY = startY;
      } else if (kitchenShapeType === "II") {
        if (wallObject.rotation === 0) {
          wallWidth_ad = wallObject.width;
          startX = wallObject.x;
          endX = startX + wallObject.width
          startY = wallObject.y + 70;
          endY = startY;
        } else {
          wallWidth_ad = wallObject.width;
          startX = wallObject.x;
          endX = startX + wallObject.width
          startY = wallObject.y - 50;
          endY = startY;
        }
      } else if (kitchenShapeType === "L") {
        if (wallObject.rotation === 0) {
          wallWidth_ad = wallObject.width - 20;
          startX = wallObject.x + 20;
          endX = startX + wallWidth_ad;
          startY = wallObject.y + 70;
          endY = startY;
        } else {
          wallWidth_ad = wallObject.width;
          startX = wallObject.x - 45;
          endX = startX;
          startY = wallObject.y;
          endY = startY + wallObject.width;
        }
      } else if (kitchenShapeType === "U") {
        if (wallObject.rotation === 0) {
          wallWidth_ad = wallObject.width - 20;
          startX = wallObject.x + 20;
          endX = startX + wallWidth_ad - 20;
          startY = wallObject.y + 70;
          endY = startY;
        } else if (wallObject.rotation === 90) {
          wallWidth_ad = wallObject.width;
          startX = wallObject.x - 45;
          endX = startX;
          startY = wallObject.y;
          endY = startY + wallObject.width;
        } else {
          wallWidth_ad = wallObject.width;
          startX = wallObject.x + 70;
          endX = startX;
          startY = wallObject.y;
          endY = startY + wallObject.width;
        }
      } else {
        // other
      }
    }
    // -------------------------------
    // 2. 绘制主线
    // -------------------------------
    // -------------------------------
    // 3. 计算方向角（用于垂直线）
    // -------------------------------

    if (startX) {
      const mainLine = new fabric.Line([startX, startY, endX, endY], {
        stroke: 'blue',
        strokeWidth: 1,
        // lockMovementX: false, // 锁定水平方向移动
        // lockMovementY: false, // 锁定垂直方向移动
        // lockScalingX: true, // 禁止修改宽度
        // lockScalingY: true, // 禁止修改高度
        selectable: false,
        evented: false
      });
      canvas.add(mainLine);
    } else {
      if (startXIslandIn) {
        const mainLine = new fabric.Line([startXIslandIn, startYIslandIn, endXIslandIn, endYIslandIn], {
          stroke: 'blue',
          strokeWidth: 1,
          // lockMovementX: false, // 锁定水平方向移动
          // lockMovementY: false, // 锁定垂直方向移动
          // lockScalingX: true, // 禁止修改宽度
          // lockScalingY: true, // 禁止修改高度
          selectable: false,
          evented: false
        });
        canvas.add(mainLine);
      }
      if (startXIslandOut) {
        const mainLine = new fabric.Line([startXIslandOut, startYIslandOut, endXIslandOut, endYIslandOut], {
          stroke: 'blue',
          strokeWidth: 1,
          // lockMovementX: false, // 锁定水平方向移动
          // lockMovementY: false, // 锁定垂直方向移动
          // lockScalingX: true, // 禁止修改宽度
          // lockScalingY: true, // 禁止修改高度
          selectable: false,
          evented: false
        });
        canvas.add(mainLine);
      }
    }



    // -------------------------------
    // 4. 辅助函数：画垂直短线
    // -------------------------------
    // function drawPerpendicularMark(px, py, length, orientation) {
    //   const half = length / 2;
    //   let x1, y1, x2, y2;

    //   if (orientation === 'vertical') {
    //     // 主线垂直 → 标尺水平
    //     x1 = px - half;
    //     y1 = py;
    //     x2 = px + half;
    //     y2 = py;
    //   } else {
    //     // 主线水平 → 标尺垂直
    //     x1 = px;
    //     y1 = py - half;
    //     x2 = px;
    //     y2 = py + half;
    //   }

    //   const mark = new fabric.Line([x1, y1, x2, y2], {
    //     stroke: 'red',
    //     strokeWidth: 1.5,
    //     selectable: false
    //   });
    //   canvas.add(mark);
    // }
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
        // lockMovementX: false, // 锁定水平方向移动
        // lockMovementY: false, // 锁定垂直方向移动
        // lockScalingX: true, // 禁止修改宽度
        // lockScalingY: true, // 禁止修改高度
        selectable: false,
        evented: false
      });
      canvas.add(mark);
    }

    /**
     * 在每个线段中间标注长度文字
     */
    function drawLengthLabel(px, py, length, orientation, wordDirection) {
      if (length < 0.01) return;
      // 向外偏移一点，避免文字压在线上
      let offset = 10;
      if (wordDirection === 'M') {
        offset = -20;
      } else if (wordDirection === 'P') {
        offset = 20;
      }

      let textX = px;
      let textY = py;

      if (orientation === 'vertical') {
        textX = px + offset; // 右移一点
      } else {
        textY = py + offset; // 上移一点
      }
      const displayText = Number.isInteger(length)
        ? length.toString()
        : length.toFixed(2);
      const textD = formatFraction(displayText);

      const text = new fabric.Text(textD + ' \'\'', {
        left: textX,
        top: textY,
        fontSize: 12,
        fill: 'blue',
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center',
        lockScalingX: true, // 禁止修改宽度
        lockScalingY: true, // 禁止修改高度
      });

      canvas.add(text);
    }
    // -------------------------------
    // 5. 绘制起点、终点、分段点的标尺线
    // -------------------------------
    const markLength = 12;

    if (itemRulerWall.coordinates === 'X') {
      const fullPoints = [startY, ...itemRulerWall.point, endY].sort((a, b) => a - b);;
      // 主线是垂直方向 → point 是 Y 坐标
      drawPerpendicularMark(startX, startY, markLength, 'vertical');
      drawPerpendicularMark(endX, endY, markLength, 'vertical');

      for (let i = 0; i < fullPoints.length; i++) {
        const y = fullPoints[i];

        // 在标记点位置画刻度线（不画首尾）
        if (i > 0 && i < fullPoints.length - 1) {
          drawPerpendicularMark(startX, y, markLength, 'vertical');
        }

        // 计算上一段长度并标注文字
        if (i > 0) {
          const prevY = fullPoints[i - 1];
          const segmentLength = Math.round(
            (Math.abs(y - prevY) * 100 / (100 * itemRulerWall.scale)) * 100
          ) / 100;

          // 在两点之间添加长度文字
          drawLengthLabel(startX, (y + prevY) / 2, segmentLength, 'vertical', itemRulerWall.wordDirection);
        }
      }
    } else if (itemRulerWall.coordinates === 'Y') {
      const fullPoints = [startX, ...itemRulerWall.point, endX].sort((a, b) => a - b);;
      // 主线是垂直方向 → point 是 Y 坐标
      drawPerpendicularMark(startX, startY, markLength, 'horizontal');
      drawPerpendicularMark(endX, endY, markLength, 'horizontal');

      for (let i = 0; i < fullPoints.length; i++) {
        const x = fullPoints[i];

        // 在标记点位置画刻度线（不画首尾）
        if (i > 0 && i < fullPoints.length - 1) {
          drawPerpendicularMark(x, startY, markLength, 'horizontal');
        }

        // 计算上一段长度并标注文字
        if (i > 0) {
          const prevX = fullPoints[i - 1];
          const segmentLength = Math.round(
            (Math.abs(x - prevX) * 100 / (100 * itemRulerWall.scale)) * 100
          ) / 100;


          // 在两点之间添加长度文字
          drawLengthLabel((x + prevX) / 2, startY, segmentLength, 'horizontal', itemRulerWall.wordDirection);
        }
      }
    }

    if (itemRulerIslandinner.coordinates === 'X') {
      // 主线是垂直方向 → point 是 Y 坐标

      const fullPoints = [startYIslandIn, ...itemRulerIslandinner.point, endYIslandIn].sort((a, b) => a - b);;
      // 主线是垂直方向 → point 是 Y 坐标
      drawPerpendicularMark(startXIslandIn, startYIslandIn, markLength, 'vertical');
      drawPerpendicularMark(endXIslandIn, endYIslandIn, markLength, 'vertical');

      for (let i = 0; i < fullPoints.length; i++) {
        const y = fullPoints[i];

        // 在标记点位置画刻度线（不画首尾）
        if (i > 0 && i < fullPoints.length - 1) {
          drawPerpendicularMark(startXIslandIn, y, markLength, 'vertical');
        }

        // 计算上一段长度并标注文字
        if (i > 0) {
          const prevY = fullPoints[i - 1];
          const segmentLength = Math.round(
            (Math.abs(y - prevY) * 100 / (100 * itemRulerIslandinner.scale)) * 100
          ) / 100;

          // 在两点之间添加长度文字
          drawLengthLabel(startXIslandIn, (y + prevY) / 2, segmentLength, 'vertical', itemRulerIslandinner.wordDirection);
        }
      }
      // itemRulerIslandinner.point.forEach(y => {
      //   if (y > Math.min(startYIslandIn, endYIslandIn) && y < Math.max(startYIslandIn, endYIslandIn)) {
      //     drawPerpendicularMark(startXIslandIn, y, markLength, 'vertical');
      //   }
      // });
    } else if (itemRulerIslandinner.coordinates === 'Y') {
      const fullPoints = [startXIslandIn, ...itemRulerIslandinner.point, endXIslandIn].sort((a, b) => a - b);;
      // 主线是垂直方向 → point 是 Y 坐标
      drawPerpendicularMark(startXIslandIn, startYIslandIn, markLength, 'horizontal');
      drawPerpendicularMark(endXIslandIn, endYIslandIn, markLength, 'horizontal');

      for (let i = 0; i < fullPoints.length; i++) {
        const x = fullPoints[i];

        // 在标记点位置画刻度线（不画首尾）
        if (i > 0 && i < fullPoints.length - 1) {
          drawPerpendicularMark(x, startYIslandIn, markLength, 'horizontal');
        }

        // 计算上一段长度并标注文字
        if (i > 0) {
          const prevX = fullPoints[i - 1];
          const segmentLength = Math.round(
            (Math.abs(x - prevX) * 100 / (100 * itemRulerIslandinner.scale)) * 100
          ) / 100;


          // 在两点之间添加长度文字
          drawLengthLabel((x + prevX) / 2, startYIslandIn, segmentLength, 'horizontal', itemRulerIslandinner.wordDirection);
        }
      }
      // itemRulerIslandinner.point.forEach(x => {
      //   if (x > Math.min(startXIslandIn, endXIslandIn) && x < Math.max(startXIslandIn, endXIslandIn)) {
      //     drawPerpendicularMark(x, startYIslandIn, markLength, 'horizontal');
      //   }
      // });
    }

    if (islandouter) {
      if (itemRulerIslandOuter.coordinates === 'X') {

        const fullPoints = [startYIslandIn, ...itemRulerIslandOuter.point, endYIslandIn].sort((a, b) => a - b);;
        // 主线是垂直方向 → point 是 Y 坐标
        drawPerpendicularMark(startXIslandOut, startYIslandOut, markLength, 'vertical');
        drawPerpendicularMark(endXIslandOut, endYIslandOut, markLength, 'vertical');

        for (let i = 0; i < fullPoints.length; i++) {
          const y = fullPoints[i];

          // 在标记点位置画刻度线（不画首尾）
          if (i > 0 && i < fullPoints.length - 1) {
            drawPerpendicularMark(startXIslandOut, y, markLength, 'vertical');
          }

          // 计算上一段长度并标注文字
          if (i > 0) {
            const prevY = fullPoints[i - 1];
            const segmentLength = Math.round(
              (Math.abs(y - prevY) * 100 / (100 * itemRulerIslandOuter.scale)) * 100
            ) / 100;

            // 在两点之间添加长度文字
            drawLengthLabel(startXIslandOut, (y + prevY) / 2, segmentLength, 'vertical', itemRulerIslandOuter.wordDirection);
          }
        }
        // itemRulerIslandOuter.point.forEach(y => {
        //   if (y > Math.min(startYIslandOut, endYIslandOut) && y < Math.max(startYIslandOut, endYIslandOut)) {
        //     drawPerpendicularMark(startXIslandOut, y, markLength, 'vertical');
        //   }
        // });
      } else if (itemRulerIslandOuter.coordinates === 'Y') {
        // 主线是水平方向 → point 是 X 坐标

        const fullPoints = [startXIslandOut, ...itemRulerIslandOuter.point, endXIslandOut].sort((a, b) => a - b);;
        // 主线是垂直方向 → point 是 Y 坐标
        drawPerpendicularMark(startXIslandOut, startYIslandOut, markLength, 'horizontal');
        drawPerpendicularMark(endXIslandOut, endYIslandOut, markLength, 'horizontal');

        for (let i = 0; i < fullPoints.length; i++) {
          const x = fullPoints[i];

          // 在标记点位置画刻度线（不画首尾）
          if (i > 0 && i < fullPoints.length - 1) {
            drawPerpendicularMark(x, startYIslandOut, markLength, 'horizontal');
          }

          // 计算上一段长度并标注文字
          if (i > 0) {
            const prevX = fullPoints[i - 1];
            const segmentLength = Math.round(
              (Math.abs(x - prevX) * 100 / (100 * itemRulerIslandOuter.scale)) * 100
            ) / 100;


            // 在两点之间添加长度文字
            drawLengthLabel((x + prevX) / 2, startYIslandOut, segmentLength, 'horizontal', itemRulerIslandOuter.wordDirection);
          }
        }
        // itemRulerIslandOuter.point.forEach(x => {
        //   if (x > Math.min(startXIslandOut, endXIslandOut) && x < Math.max(startXIslandOut, endXIslandOut)) {
        //     drawPerpendicularMark(x, startYIslandOut, markLength, 'horizontal');
        //   }
        // });
      }
    }


  });
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
//增加标尺
// let rulerX = item.x;
// let rulerY = item.y;
// let itemWidth_ad = Math.round(item.width * 100) / 100;
// if (item.objectType === 'lower' || item.objectType === 'upper' || item.objectType === 'high' || 
//   item.objectType === 'Range' || item.objectType === 'Hood' || item.objectType === 'Refrigerator' ||
//   item.objectType === 'DishWasher' ) {
//     if (item.rotation === 0) {
//       rulerY = rulerY + item.height + 50;
//       itemWidth_ad = Math.round(item.width * 100) / 100;
//     } else if (item.rotation === 90) { 
//       rulerX = rulerX - 50;
//       itemWidth_ad = Math.round(item.height * 100) / 100;
//     } else if (item.rotation === 270) { 
//       rulerX = rulerX + item.height+ 50;
//       itemWidth_ad = Math.round(item.height * 100) / 100;
//     } else if (item.rotation === 180) { 
//       rulerY = rulerY - 50;
//       itemWidth_ad = Math.round(item.width * 100) / 100;
//     }
// } else if (item.objectType === 'islandiner' ) {
//   if (item.rotation === 0) {
//     // nothing
//   } else if (item.rotation === 90) { 
//     // nothing
//   } else if (item.rotation === 180) { 
//     rulerY = rulerY + item.height + 50;
//       itemWidth_ad = Math.round(item.width * 100) / 100;
//   } else if (item.rotation === 270) {
//     rulerX = rulerX - 50;
//     itemWidth_ad = Math.round(item.height * 100) / 100;
//   }
// } else if ( item.objectType === 'islandouter') {
//   if (item.rotation === 0) {
//     rulerY = rulerY - 50;
//     itemWidth_ad = Math.round(item.width * 100) / 100;
//   } else if (item.rotation === 90) { 
//     rulerX = rulerX + item.height+ 50;
//       itemWidth_ad = Math.round(item.height * 100) / 100;
//   } else if (item.rotation === 180) { 
//       // nothing
//   } else if (item.rotation === 270) {
//     // nothing
//   }
// }
// let itemRuler = {
//   x: rulerX,
//   y: rulerY,
//   width: itemWidth_ad, // 墙体宽度
//   withCabinet: item.withCabinet,
//   rotation: item.rotation,
//   scale: item.scale || 1,   // 缩放比例   
//   }
// drawOneRuler(canvas, itemRuler, kitchenShapeType);
export const drawOneRuler = (canvas, item, kitchenShapeType) => {

  let startX = item.x;
  let startY = item.y;
  let endX = item.x + item.width;
  let endY = item.y;
  if (item.rotation === 90 || item.rotation === 270) {
    endX = item.x;
    endY = item.y + item.width;
  }
  // 创建尺寸线
  const mainLine = new fabric.Line([startX, startY, endX, endY], {
    stroke: 'blue',
    strokeWidth: 1,
    selectable: false,
    evented: false,
  });
  const shortLine = 6;
  if (item.rotation === 180) {

  }
  // 创建起点的短斜线
  // 0/180度
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
  const text = new fabric.Text(item.withCabinet.toString(), {
    fontSize: 16,
    fill: 'blue',
    left: textLeft,
    top: textTop,
    originX: 'center',
    originY: 'center',
    selectable: false,
    evented: false,
  });
  // 添加到画布
  canvas.add(mainLine, shortLine1, shortLine2, text);

};
const drawWallruler = (canvas, item, kitchenShapeType) => {
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


}
export const drawElevationRuler = (canvas, item) => {

};


