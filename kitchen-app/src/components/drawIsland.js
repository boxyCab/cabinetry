// drawIsland.js
import fabric from '../utils/fabricConfig';
import { bringToFrontSafe } from '../utils/fabricConfig';
export const drawIsland = (canvas, islandInfo) => {
  // 创建一条虚线
  if (islandInfo === undefined ) return;
  console.log(islandInfo);
  let islandEndX = islandInfo.x;
  let islandEndY = islandInfo.y;
  if (islandInfo.rotation ===  180) {
    islandEndX = islandInfo.x+islandInfo.width;
  } else if (islandInfo.rotation ===  90) {
     islandEndY = islandInfo.y+islandInfo.width;
  } else {
    islandEndY = islandInfo.y-islandInfo.width;
  }
  const line = new fabric.Line([islandInfo.x, islandInfo.y, islandEndX, islandEndY], {
    stroke: islandInfo.color,
    strokeWidth: 2,
    strokeDashArray: [5, 5], // 设置虚线样式
    selectable: false // 不可选
  });
 
  // 将线条添加到 Fabric Canvas
  line.id = islandInfo.id;
  canvas.add(line);
  bringToFrontSafe(canvas, line);
};