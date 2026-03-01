// CanvasContext.js
import React, { createContext, useState, useContext, useRef } from 'react';
import fabric from './utils/fabricConfig';
import { drawCabinet, drawEvelationCabinet } from './components/drawCabinets';
import { useDispatch, } from 'react-redux';
import { useSnackbar } from "./components/GlobalSnackbar";
import { MessageInfo } from './common/MessageInfo';
import store, {
  updateSubmitData, selectCabinetObject, selectKitchenId, selectConstruction1, selectConstruction2, selectConstruction3,
  selectKitchenShapeType, updateCabinet
} from './store';
import { saveHistory } from './management/historyManager';
import cloneDeep from 'lodash/cloneDeep';
const CanvasContext = createContext();


export const CanvasProvider = ({ children }) => {
  // 使用一个字典对象存储多个 fabric.Canvas 实例
  const canvasesRef = useRef({}); // 用 ref 保存 canvases，避免状态更新时的重渲染
  const dispatch = useDispatch();
  const showSnackbar = useSnackbar();
  // 清理 canvas 的辅助函数
  const cleanupCanvas = (canvas, canvasId) => {
    if (!canvas || canvas.__disposed) {
      console.log('Canvas is invalid or already disposed, skipping cleanup');
      return;
    }
    try {
      canvas.off();
      canvas.getObjects().forEach(obj => canvas.remove(obj));
      if (typeof canvas.dispose === 'function') {
        canvas.dispose();
      }
      canvas.__disposed = true;
      canvasesRef.current[canvasId] = null; // 从存储中移除已清理的 canvas
    } catch (error) {
      console.error('Error cleaning up canvas:', error);
    }
  };

  const createCanvas = (canvasId, canvasRef, width = 1300, height = 1200) => {
    console.log('Creating canvas - canvasId:', canvasId);
    console.log('Creating canvas - canvasRef:', canvasRef?.current);

    if (!canvasId || !canvasRef?.current || canvasRef.current.tagName !== 'CANVAS') {
      console.error('Invalid canvasId or canvasRef: must be a <canvas> element');
      return null;
    }

    const existingCanvas = canvasesRef.current[canvasId];
    if (existingCanvas && !existingCanvas.__disposed) {
      console.warn(`Canvas with ID ${canvasId} already exists. Use recreateCanvas to replace it.`);
      return existingCanvas;
    }
    /**
     * 绑定鼠标滚轮缩放事件
     */
    const bindMouseWheelZoom = (canvas, initWidth, initHeight) => {
      canvas.on("mouse:wheel", (opt) => {
        const delta = opt.e.deltaY; // 滚轮方向
        let zoom = canvas.getZoom();


        const zoomFactor = 0.98; // 控制缩放速度
        zoom *= delta > 0 ? zoomFactor : 1 / zoomFactor;
        zoom = Math.min(Math.max(zoom, 0.5), 3);

        // zoom *= zoomFactor ** delta;

        // // 限制缩放范围
        // if (zoom > 3) zoom = 3;
        // if (zoom < 0.5) zoom = 0.5;

        // 围绕鼠标位置缩放，更自然
        canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);

        // ⚠️ 修改 DOM 尺寸，保证容器出现滚动条
        // canvas.setWidth(initWidth * zoom);
        // canvas.setHeight(initHeight * zoom);

        canvas.renderAll();
        opt.e.preventDefault();
        // opt.e.stopPropagation();
      });
    };
    try {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width,
        height,
        selectionBorderColor: '#808080',
        selectionColor: 'rgba(128, 128, 128, 0.3)',
        enableRetinaScaling: true,
        selection: true,
        subTargetCheck: true,
      });

      if (!fabricCanvas) {
        throw new Error('Fabric.js canvas initialization returned undefined');
      }
      fabricCanvas.upperCanvasEl.style.pointerEvents = 'auto'; // 确保可点击
      fabricCanvas.upperCanvasEl.oncontextmenu = function (e) {
        e.preventDefault();
        e.stopPropagation();
      };
      console.log('New canvas instance created:', fabricCanvas instanceof fabric.Canvas);
      canvasesRef.current[canvasId] = fabricCanvas;
      // 绑定滚轮缩放
      bindMouseWheelZoom(fabricCanvas, width, height);

      return fabricCanvas;
    } catch (error) {
      console.error(`Failed to create canvas for ${canvasId}: ${error.message}`);
      return null;
    }
  };

  const recreateCanvas = (canvasId, canvasRef, width = 1300, height = 1300) => {
    console.log('Recreating canvas:', canvasId);

    if (!canvasId || !canvasRef?.current || canvasRef.current.tagName !== 'CANVAS') {
      console.error('Invalid canvasId or canvasRef');
      return { success: false, canvas: null };
    }

    const oldCanvas = canvasesRef.current[canvasId];
    if (oldCanvas) {
      delete canvasesRef.current[canvasId];
      try {
        cleanupCanvas(oldCanvas);
      } catch (e) {
        console.warn('Error disposing old canvas:', e);
      }
    }

    const newCanvas = createCanvas(canvasId, canvasRef, width, height);
    return { success: !!newCanvas, canvas: newCanvas };
  };

  // 绘制柜子
  const drawCabinetTop = (canvasId, cabInfo) => {
    const canvas = getCanvas(canvasId); // 使用 getCanvas 获取 fabric.Canvas 实例
    if (canvas) {
      drawCabinet(canvas, cabInfo, 0, "addFlag");
      saveAddCabinetPre(canvasId, cabInfo);

    }
  };

  // 绘制柜子
  const drawCabinetEleva = (canvasId, cabInfo) => {
    const canvas = getCanvas(canvasId); // 使用 getCanvas 获取 fabric.Canvas 实例
    if (canvas) {
      drawEvelationCabinet(canvas, cabInfo, 1);

    }
  };

  // 获取指定 canvasId 的 fabric.Canvas 实例
  const getCanvas = (canvasId) => {
    const canvas = canvasesRef.current[canvasId];
    if (canvas) {
      if (canvas.__disposed) {
        delete canvasesRef.current[canvasId]; // 主动清理无效引用
        return null;
      }
      return canvas;
    }
    return null;
  };

  // 示例：遍历所有墙体，找到柜子所属的墙体
  const findCabinetWall = (cabinet, walls) => {
    const wallret = [];
    for (let index = 0; index < walls.length; index++) {
      const wall = walls[index];

      if (doesCabinetBelongToWall(cabinet, wall, index)) {
        wallret.push(wall);
      }
    }
    return wallret; // 未找到
  };
  const doesCabinetBelongToWall = (cabinet, wall, index) => {
    // let wallLeft = wall.x;
    // let wallRight = wall.x + wall.width;
    // let wallTop = wall.y;
    let wallBottom = 0;
    // 获取柜子的边界
    let cabinetLeft = cabinet.x;
    let cabinetRight = cabinet.x + cabinet.width;
    let cabinetTop = cabinet.y;
    let cabinetBottom = cabinet.y + cabinet.depth;

    if (wall.objectType === "wall") {
      if (cabinet.rotation === 180) {
        cabinetRight = cabinet.x - cabinet.width
      } else if (cabinet.rotation === 90) {
        cabinetRight = cabinet.x + cabinet.depth;
        cabinetBottom = cabinet.y + cabinet.width;
      } else if (cabinet.rotation === 270) {
        cabinetRight = cabinet.x + cabinet.depth;
        cabinetBottom = cabinet.y - cabinet.width;
      }
      // 获取墙体的边界
      if (index === 0) {
        if (wall.rotation === 90) {
          wallBottom = wall.x + wall.height;
        } else if (wall.rotation === 0) {
          wallBottom = wall.y;
        }
      } else if (index === 1) {
        if (wall.rotation === 0) {
          wallBottom = wall.y;
        } else if (wall.rotation === 180) {
          wallBottom = wall.y + 20;
        }
      } else if (index === 2 && wall.rotation === 270) {
        wallBottom = wall.x;
      } else if (index === 3 && wall.rotation === 0) {
        wallBottom = wall.y + wall.height;
      }
    } else if (wall.objectType === "island" || wall.objectType === "peninsula") {
      if (wall.rotation === 180) {
        wallBottom = wall.y;
      } else if (wall.rotation === 270) {
        wallBottom = wall.x;
        cabinetRight = cabinet.x + cabinet.depth;
        cabinetBottom = cabinet.y - cabinet.width;
      } else if (wall.rotation === 0) {
        wallBottom = wall.y;
      } else if (wall.rotation === 90) {
        wallBottom = wall.x;
        if (cabinet.rotation === 270) {
          cabinetRight = cabinet.x + cabinet.depth;
          cabinetBottom = cabinet.y + cabinet.width
        } else if (cabinet.rotation === 90) {
          cabinetRight = cabinet.x + cabinet.depth;
          cabinetBottom = cabinet.y + cabinet.width;
        }
      }
    }
    if (cabinet.cabinettype === "BLS" || cabinet.cabinettype === "SBD" || cabinet.cabinettype === "WDC" || cabinet.cabinettype === "WLS") {
      if (cabinet.rotation === 90) {
        cabinetRight = cabinet.x + cabinet.width;
        cabinetBottom = cabinet.y + cabinet.width;
      } else if (cabinet.rotation === 270) {
        cabinetRight = cabinet.x + cabinet.depth;
        cabinetBottom = cabinet.y - cabinet.width;
      } else if (cabinet.rotation === 180) {
        cabinetBottom = cabinet.y + cabinet.width;
      } else {
        cabinetRight = cabinet.x + cabinet.width
        cabinetBottom = cabinet.y + cabinet.depth;
      }
    } else if (cabinet.cabinettype === "BBC" || cabinet.cabinettype === "WBC") {
      if (cabinet.rotation === 90) {
        cabinetRight = cabinet.x + cabinet.depth;
        cabinetBottom = cabinet.y + cabinet.width;
      } else if (cabinet.rotation === 270) {
        cabinetRight = cabinet.x + cabinet.depth;
        cabinetBottom = cabinet.y - cabinet.width;
      } else if (cabinet.rotation === 180) {
        cabinetRight = cabinet.x - cabinet.width;
      } else {
        cabinetRight = cabinet.x + cabinet.width;
      }
    }
    // 判断柜子的边是否落在墙体的边上
    const isTopAligned = Math.abs(cabinetTop - wallBottom) <= 1.1;
    const isBottomAligned = Math.abs(cabinetBottom - wallBottom) <= 1.1;
    const isLeftAligned = Math.abs(cabinetLeft - wallBottom) <= 1.1;
    const isRightAligned = Math.abs(cabinetRight - wallBottom) <= 1.1;

    if (wall.objectType === "wall") {
      if (isTopAligned || isBottomAligned || isLeftAligned || isRightAligned) {
        if (cabinet.rotation === wall.rotation) {
          return true;
        } else if (cabinet.cabinettype === "BLS" || cabinet.cabinettype === "SBD" ||
          cabinet.cabinettype === "WDC" || cabinet.cabinettype === "WLS" ||
          cabinet.cabinettype === "BBC" || cabinet.cabinettype === "WBC" ||
          cabinet.cabinettype === "BBCL" || cabinet.cabinettype === "BBCR" ||
          cabinet.cabinettype === "WBCL" || cabinet.cabinettype === "WBCR") {
          return true;
        } else {
          return false;
        }
      } else {
        return false; // 如果柜子和墙体的边不对齐，则认为柜子不属于该墙体
      }
    } else if (wall.objectType === "island" || wall.objectType === "peninsula") {
      if (isTopAligned || isBottomAligned || isLeftAligned || isRightAligned) {
        // 如果柜子和墙体的边对齐，则认为柜子属于该墙体
        return true;
      } else {
        return false; // 如果柜子和墙体的边不对齐，则认为柜子不属于该墙体
      }
    } else {
      return false; // 如果柜子和墙体的边不对齐，则认为柜子不属于该墙体
    }





  };
  //
  const saveSubmitData = (cabinetObjecttmp, kitchenId, canvasId, kitchenShapeType, cabConstruction) => {
    let canvasObjectStore = [...cabinetObjecttmp.canvasObjectList];
    let cabinetListStore = [...cabinetObjecttmp.cabinetObjectList];
    let canvasWallListStore = cabinetObjecttmp.canvasWallList;
    let hasError = false; // 错误标志
    const fabricCanvas = getCanvas(canvasId);
    const cabConstruction1 = selectConstruction1(store.getState());
    const cabConstruction2 = selectConstruction2(store.getState());
    const cabConstruction3 = selectConstruction3(store.getState());

    let wallXS_adjust = 0;
    if (kitchenShapeType === "L") {
      wallXS_adjust = 20;
    } else if (kitchenShapeType === "U") {
      wallXS_adjust = 20;
    }
    // 先获取所有分组对象（这里只有一个分组）
    const groups = fabricCanvas.getObjects().filter(obj => obj instanceof fabric.Group);
    const allSubObjects = [];
    const allCabObjects = [];
    // 从canvas里面copy一个空对象
    let canvasobjectEmptyBase = canvasObjectStore.find(
      obj => obj.cabinettype && obj.cabinettype.startsWith('B')
    );
    let cabinetObjectEmptBase = null;
    if (canvasobjectEmptyBase) {
      cabinetObjectEmptBase = cabinetListStore.find(item => item.id === canvasobjectEmptyBase.relatedId);
    }
    let canvasobjectEmptyUpper = canvasObjectStore.find(
      obj => obj.cabinettype && obj.cabinettype.startsWith('W')
    );
    let cabinetObjectEmptUpper = null;
    if (canvasobjectEmptyUpper) {
      cabinetObjectEmptUpper = cabinetListStore.find(item => item.id === canvasobjectEmptyUpper.relatedId);
    }
    const newWallList = canvasWallListStore.map((wall, index) => ({
      index: index,
      id: wall.wallid,
      x: wall.x,
      y: wall.y,
      width: wall.width,
      height: wall.height,
      rotation: wall.rotation,
      objectname: wall.objectname,
      objectType: wall.objectType,
    }));
    let sortedGroups = null;
    sortedGroups = groups.sort((a, b) => {
      // 先比较 left 属性
      if (a.left !== b.left) {
        return a.left - b.left;
      }
      // 如果 left 属性相同，再比较 top 属性
      return a.top - b.top;
    });
    try {
      sortedGroups.forEach(subObj => {
        let objectStartPosition = -100;
        if (subObj.flag === 'modifyFiller') {
          const targetId = subObj.id;
          let newX = subObj.left;
          let newY = subObj.top;
          if (subObj.rotation === 180) {
            newX = subObj.left + subObj.width;
          }
          if (subObj.rotation === 270) {
            newY = subObj.top + subObj.height;
          }
          // 更新 Redux 和后端数据
          const matchingCanvas = canvasObjectStore.filter(cabinet => cabinet.id === subObj.id);
          if (matchingCanvas.length > 0) {
            let relatedId = matchingCanvas[0].relatedId;
            // 更新 canvasObjectStore
            canvasObjectStore = canvasObjectStore.map(item =>
              item.id === subObj.id
                ? {
                  ...item,
                  x: newX,
                  y: newY,
                  widthcabinet: parseFloat(subObj.widthcabinet),
                  heightcabinet: parseFloat(subObj.heightcabinet),
                  depthcabinet: parseFloat(subObj.depthcabinet),
                  updateFlg: 2,
                }
                : item
            );

            // 更新 cabinetListStore
            cabinetListStore = cabinetListStore.map(item =>
              item.id === relatedId
                ? {
                  ...item,
                  width: parseFloat(subObj.widthcabinet),
                  height: parseFloat(subObj.heightcabinet),
                  depth: parseFloat(subObj.depthcabinet),
                  updateFlg: 2,
                }
                : item
            );
          }
          return;
        }
        if (subObj.flag === "moveFlag") {
          // TODO 如果是移动了位置，需要更新柜子位置
          let canvasObjectStoreMove = cabinetObjecttmp.canvasObjectList;
          let cabinetListStoreMove = cabinetObjecttmp.cabinetObjectList;
          let newWallListMove = cabinetObjecttmp.canvasWallList;
          // let kitchenShapeType = selectKitchenShapeType(store.getState());
          let objectX = subObj.left;
          let objectY = subObj.top;

          let wallXS_adjust = 0;
          if (kitchenShapeType === "L") {
            wallXS_adjust = 20;
          } else if (kitchenShapeType === "U") {
            wallXS_adjust = 20;
          }
          let moveCanvasObject = canvasObjectStoreMove.find(item => item.id === subObj.id);
          let wallcabMove = newWallListMove.find(item => item.wallid === moveCanvasObject.wallid);
          let objectStartPosition = 0;
          let wallAdjust = 0;
          if (wallcabMove.objectType === "island" || wallcabMove.objectType === "peninsula") {
            if (subObj.rotation === 0) {
              if (subObj.objectType === "islandouter") {
                objectStartPosition = (wallcabMove.x + wallcabMove.width - subObj.left - subObj.width) / subObj.scale;
              } else {
                objectStartPosition = (subObj.left - (wallcabMove.x)) / subObj.scale;
              }
            } else if (subObj.rotation === 90) {
              if (subObj.objectType === 'islandouter') {
                objectStartPosition = (wallcabMove.y - subObj.top - subObj.height) / subObj.scale;
              } else {
                objectStartPosition = (subObj.top - (wallcabMove.y)) / subObj.scale;
              }
            } else if (subObj.rotation === 180) {
              if (subObj.objectType === "islandouter") {
                objectStartPosition = (wallcabMove.x + wallcabMove.width - subObj.left - subObj.width) / subObj.scale;
              } else {
                objectStartPosition = (wallcabMove.x + wallcabMove.width - subObj.left - subObj.width) / subObj.scale;
              }
            } else if (subObj.rotation === 270) {
              if (subObj.objectType === 'islandouter') {
                objectStartPosition = (subObj.top - wallcabMove.y) / subObj.scale;
              } else {
                objectStartPosition = (wallcabMove.y - subObj.top - subObj.height) / subObj.scale;
              }
            }
          } else {
            wallAdjust = wallXS_adjust;
            if (subObj.rotation === 0) {
              objectStartPosition = (subObj.left - wallcabMove.x - wallAdjust) / subObj.scale;
            } else if (subObj.rotation === 90) {
              objectStartPosition = (subObj.top - (wallcabMove.y)) / subObj.scale;
            } else if (subObj.rotation === 180) {
              objectX = objectX + subObj.width;
              objectStartPosition = (wallcabMove.x + wallcabMove.width - subObj.left - subObj.width) / subObj.scale;
            } else if (subObj.rotation === 270) {
              objectY = objectY + subObj.height;
              objectStartPosition = (wallcabMove.y + wallcabMove.width - subObj.top - subObj.height) / subObj.scale;
            }
          }

          // 更新 canvasObjectStore
          canvasObjectStore = canvasObjectStore.map(item =>
            item.id === subObj.id
              ? {
                ...item,
                x: objectX,
                y: objectY,
                flag: "moveFlag",
                updateFlg: 2,
              }
              : item
          );

          // 更新 cabinetListStore
          cabinetListStore = cabinetListStore.map(item =>
            item.id === subObj.relatedId
              ? {
                ...item,
                startposition: objectStartPosition,
                updateFlg: 2,
              }
              : item
          );
          // 标记此对象的变动已处理
          subObj.flag = "init";
          return;
        }
        if (subObj.flag !== "addFlag") {
          return;
        }
        let changedCanvasObj = null;
        let changedCabinetObj = null;
        let relatedIdT = null;
        let objectTypeT = "lower";
        let objectTypeBBCD = "lower";
        let canvasobjectEmpty = canvasobjectEmptyBase;
        let cabinetObjectEmpt = cabinetObjectEmptBase;
        // if (subObj.objectname.startsWith('WP')) {
        //   objectTypeT = "high";
        // } else if (subObj.objectname.startsWith('W')) {
        //   objectTypeT = "upper";
        //   canvasobjectEmpty = canvasobjectEmptyUpper;
        //   cabinetObjectEmpt = cabinetObjectEmptUpper;
        // }

        if (subObj.objectname.startsWith('WP') || subObj.objectname.startsWith('POC') || 
          subObj.objectname.startsWith('SOP')|| subObj.objectname.startsWith('COP')|| 
          subObj.objectname.startsWith('DOP')) {
          objectTypeT = "high";
        } else if (subObj.objectname.startsWith('WF')) {
          let heightT = subObj.objectname.slice(4);        
          if (heightT >= 96) {
            objectTypeT = "high";
          } else {
            objectTypeT = "upper";
            canvasobjectEmpty = canvasobjectEmptyUpper;
            cabinetObjectEmpt = cabinetObjectEmptUpper;
          }
        }else if (subObj.objectname.startsWith('W')|| subObj.objectname.startsWith('WOC') || subObj.objectname.startsWith('PNW')) {
          objectTypeT = "upper";
          canvasobjectEmpty = canvasobjectEmptyUpper;
          cabinetObjectEmpt = cabinetObjectEmptUpper;
        }  else if (subObj.objectname.startsWith('PNB')|| subObj.objectname.startsWith('PNI') ) {
          let heightT = 0;
          if (subObj.objectname.startsWith('PNB') || subObj.objectname.startsWith('PNI') ) {
              heightT = parseInt(subObj.objectname.slice(3), 10);
            } else {
              heightT = parseInt(subObj.objectname.slice(4), 10);
            }
            if (heightT >= 96) {
              objectTypeT = "high";
            }
        } else if (subObj.objectname.startsWith('SP')) {
          let heightT = parseInt(subObj.objectname.slice(4), 10);
          if (heightT >= 96) {
            objectTypeT = "high";
          } else {
            let depthT = parseInt(subObj.objectname.slice(2,4), 10);
            if (depthT === 12) {
              objectTypeT = "upper";
              canvasobjectEmpty = canvasobjectEmptyUpper;
              cabinetObjectEmpt = cabinetObjectEmptUpper;
            }
          }
        } else if (subObj.objectname.startsWith('RRP')) {
          let heightT = parseInt(subObj.objectname.slice(5), 10);
          if (heightT >= 96) {
            objectTypeT = "high";
          }
        }

        let subObjWidth = subObj.width;
        let subObjX = subObj.left;
        let subObjY = subObj.top;
        // 
        if (subObj.rotation === 90 || subObj.rotation === 270) {
          subObjWidth = subObj.height;
        }
        //
        if (subObj.cabinettype === "BLS" || subObj.cabinettype === "WLS") {
          if (subObj.rotation === 0) {
            subObjY = subObjY + subObj.width - subObj.depth;
          } else if (subObj.rotation === 270) {
            subObjY = subObjY + subObj.width;
            subObjX = subObjX + subObj.width - subObj.depth;
          } else if (subObj.rotation === 180) {
            subObjX = subObj.left + subObj.width;
          }
        } else if (subObj.cabinettype === "SBD" || subObj.cabinettype === "WDC") {
          if (subObj.rotation === 0) {
            subObjY = subObjY + subObj.width - subObj.depth;
          } else if (subObj.rotation === 270) {
            subObjY = subObjY + subObj.width;
            subObjX = subObjX + subObj.width - subObj.depth;
          } else if (subObj.rotation === 180) {
            subObjX = subObj.left + subObj.width;
          }
        } else {
          if (subObj.rotation === 180) {
            subObjX = subObj.left + subObjWidth;
          } else if (subObj.rotation === 270) {
            subObjY = subObj.top + subObjWidth;
          }
        }
        if (subObj.id) {
          let matchObj = canvasObjectStore.filter(canvas => canvas.id === subObj.id);
          if (matchObj.length > 0) {
            changedCanvasObj = { ...matchObj[0] }; // 浅拷贝解除只读限制
            changedCanvasObj.x = subObjX;
            changedCanvasObj.y = subObjY;
            changedCanvasObj.width = subObjWidth;
            changedCanvasObj.rotation = subObj.rotation;
            relatedIdT = subObj.relatedId;
            changedCanvasObj.objectType = objectTypeT;

          }
        } else {
          //let subObjHeight = subObj.height;
          let subObjId = subObj?.id ?? null;
          relatedIdT = subObj?.relatedId ?? 90000 + Math.floor(Math.random() * 10000);
          changedCanvasObj = {
            id: subObjId,
            objectType: objectTypeT,
            x: subObjX,
            y: subObjY,
            width: subObjWidth,
            height: subObj.height,
            rotation: subObj.rotation,
            color: "#FFFBF0",
            relatedId: relatedIdT, // 对应的cabinet的id，现在还未确定id 
            kitchenid: kitchenId,
            objectname: subObj.objectname,
            cabinettype: subObj.cabinettype,
            depth: subObj.depth,
            scale: subObj.scale,
            construction: cabConstruction,
            data: null,
            wallid: null,
            updateFlg: 3,
            widthcabinet: parseFloat(subObj.widthcabinet),
            heightcabinet: parseFloat(subObj.heightcabinet),
            depthcabinet: parseFloat(subObj.depthcabinet),
          };
        }
        let wall = findCabinetWall(changedCanvasObj, newWallList);
        let wallcorner = null;
        let walladjacent = null;
        if (wall.length > 0) {
          if (subObj.cabinettype.startsWith("BBC", 0) || subObj.cabinettype.startsWith("WBC", 0) ||
            subObj.cabinettype.startsWith("BBCL", 0) || subObj.cabinettype.startsWith("WBCL", 0) ||
            subObj.cabinettype.startsWith("BBCR", 0) || subObj.cabinettype.startsWith("WBCR", 0)) {
            if (wall.length !== 2) {
              // coner wall必须是两个
              //throw "coner wall必须是两个";
              let errorMes = 'The corner cabinet must be against both walls at the same time';
              console.error(errorMes);
              hasError = true;
              showSnackbar(errorMes, "error");
            } else {
              if (wall[0].rotation === subObj.rotation) {
                wallcorner = wall[0];
                walladjacent = wall[1];

              } else if (wall[1].rotation === subObj.rotation) {
                wallcorner = wall[1];
                walladjacent = wall[0];
              } else {

              }

              changedCanvasObj.wallid = wall ? wallcorner.id : null;
            }

          } else if (subObj.cabinettype.startsWith("BLS", 0) || subObj.cabinettype.startsWith("SBD", 0) || subObj.cabinettype.startsWith("WDC", 0) || subObj.cabinettype.startsWith("WLS", 0)) {
            if (wall.length !== 2) {
              // coner wall必须是两个
              let errorMes = 'The corner cabinet must be against both walls at the same time';
              console.error(errorMes);
              hasError = true;
              showSnackbar(errorMes, "error");
            } else {
              if (wall[0].rotation === subObj.rotation) {
                wallcorner = wall[0];
                walladjacent = wall[1];

              } else if (wall[1].rotation === subObj.rotation) {
                wallcorner = wall[1];
                walladjacent = wall[0];
              }
              changedCanvasObj.wallid = wall ? wallcorner.id : null;
            }
          } else {
            changedCanvasObj.wallid = wall ? wall[0].id : null;
            wallcorner = wall[0];
          }

        } else {
          let errorMes = 'Please place the cabinet close to the wall';
          console.error(errorMes);
          hasError = true;
          showSnackbar(errorMes, "error");
        }
        if (wallcorner != null) {
          if (wallcorner.objectType === "island" || wallcorner.objectType === "peninsula") {
            let pos = geObjFromIsland(wallcorner, changedCanvasObj, subObj);
            objectTypeT = pos.objectType;
            objectStartPosition = pos.objectStartPosition;
            // if ( wallcorner.rotation === changedCanvasObj.rotation) {
            //   changedCanvasObj.objectType = "islandiner";
            //   objectTypeT = "islandiner";
            //   objectTypeBBCD = "lower";
            // } else  {
            //     changedCanvasObj.objectType = "islandouter";
            //     objectTypeT = "islandouter";
            //     objectTypeBBCD = "lower";
            //   if (wallcorner.objectType === "peninsula") {  
            //     if (changedCanvasObj.rotation === 270) { 
            //       subObjY = subObj.top ;
            //       changedCanvasObj.y = subObjY;
            //     } else if (changedCanvasObj.rotation === 90) { 
            //     } else if (changedCanvasObj.rotation === 180) { 
            //     } else if (changedCanvasObj.rotation === 0) { 
            //     }  
            //   }
            // }                
            // if (subObj.rotation === 0 ) {
            //   if ( objectTypeT === "islandouter" ) {
            //     objectStartPosition =  (wallcorner.x+ wallcorner.width- subObj.left-subObj.width)/subObj.scale;
            //   } else {
            //     objectStartPosition =  (subObj.left - (wallcorner.x ))/subObj.scale;
            //   }
            // } else if (subObj.rotation === 90 ) {
            //   if (objectTypeT === 'islandouter') {
            //       objectStartPosition = (wallcorner.y - subObj.top - subObj.height)/subObj.scale;
            //     } else {
            //       objectStartPosition = (subObj.top - (wallcorner.y ))/subObj.scale;
            //     }
            // } else if (subObj.rotation === 180 ) {
            //     if ( objectTypeT === "islandouter" ) {
            //       objectStartPosition =  (wallcorner.x+ wallcorner.width- subObj.left-subObj.width)/subObj.scale;
            //     } else {
            //       objectStartPosition = ( wallcorner.x + wallcorner.width- subObj.left - subObj.width)/subObj.scale;  
            //     } 
            // } else if (subObj.rotation === 270 ) {
            //   if (objectTypeT === 'islandouter') {
            //     objectStartPosition = ( subObj.top - wallcorner.y)/subObj.scale;
            //   } else {
            //     objectStartPosition = (wallcorner.y - subObj.top - subObj.height)/subObj.scale;
            //   }
            // }
          } else {
            if (subObj.rotation === 0) {
              if (subObj.cabinettype === "BLS" || subObj.cabinettype === "SBD" || subObj.cabinettype === "WDC" || subObj.cabinettype === "WLS") {
                let buttomPosition = subObj.top + subObj.width;
                if (Math.abs(buttomPosition - wallcorner.y) <= 1) {
                  objectStartPosition = (subObj.left - wallcorner.x - wallXS_adjust) / subObj.scale;
                } else {
                  // error
                  let errorMes = 'The starting position corresponding to the cabinet has not been obtained.';
                  console.error(errorMes);
                  hasError = true;
                  showSnackbar(errorMes, "error");
                }
              } else {
                let buttomPosition = subObj.top + subObj.depth;
                if (Math.abs(buttomPosition - wallcorner.y) <= 1) {
                  objectStartPosition = (subObj.left - wallcorner.x - wallXS_adjust) / subObj.scale;
                } else {
                  // error
                  let errorMes = 'The starting position corresponding to the cabinet has not been obtained.';
                  console.error(errorMes);
                  hasError = true;
                  showSnackbar(errorMes, "error");
                }
              }
            } else if (subObj.rotation === 90) {
              let buttomPosition = subObj.left;
              if (Math.abs(buttomPosition - newWallList[1].x - wallXS_adjust) <= 1) {
                objectStartPosition = (subObj.top - newWallList[0].y) / subObj.scale;
              } else {
                // error
                let errorMes = 'The starting position corresponding to the cabinet has not been obtained.';
                console.error(errorMes);
                hasError = true;
                showSnackbar(errorMes, "error");
              }

            } else if (subObj.rotation === 180) {
              let buttomPosition = subObj.top;
              if (Math.abs(buttomPosition - wallcorner.y - 20) <= 1) {
                objectStartPosition = (wallcorner.x + wallcorner.width - subObj.left - subObj.width) / subObj.scale;
              } else {
                // error
                let errorMes = 'The starting position corresponding to the cabinet has not been obtained.';
                console.error(errorMes);
                hasError = true;
                showSnackbar(errorMes, "error");
              }
            } else if (subObj.rotation === 270) {
              // 取得cabinet buttom
              if (subObj.cabinettype === "BLS" || subObj.cabinettype === "SBD" || subObj.cabinettype === "WDC" || subObj.cabinettype === "WLS") {
                let buttomPosition = subObj.left + subObj.width;
                if (Math.abs(buttomPosition - wallcorner.x) <= 1) {
                  objectStartPosition = (wallcorner.y + wallcorner.width - subObj.top - subObj.height) / subObj.scale;
                } else {
                  // error
                  let errorMes = 'The starting position corresponding to the cabinet has not been obtained.';
                  console.error(errorMes);
                  hasError = true;
                  showSnackbar(errorMes, "error");

                }
              } else {
                let buttomPosition = subObj.left + subObj.depth;
                if (Math.abs(buttomPosition - wallcorner.x) <= 1) {
                  objectStartPosition = (wallcorner.y + wallcorner.width - subObj.top - subObj.height) / subObj.scale;
                } else {
                  // error
                  let errorMes = 'The starting position corresponding to the cabinet has not been obtained.';
                  console.error(errorMes);
                  hasError = true;
                  showSnackbar(errorMes, "error");

                }
              }
            }
          }
        }
        if (subObj.id) {
        } else {
          changedCanvasObj = { ...canvasobjectEmpty, ...changedCanvasObj };
        }
        allSubObjects.push(changedCanvasObj);  // 添加到 allSubObjects 数组 
        let heightObj = 34.5;
        if (objectTypeT === "lower" || objectTypeT === "islandiner" || objectTypeT === "islandouter") {
          heightObj = 34.5;
        } else if (objectTypeT === "upper" || objectTypeT === "high") {
          heightObj = subObj.objectname.slice(-2);
        }
        let objectnameT = subObj.objectname;
        let cabinettypeT = subObj.cabinettype;
        let walladjacentlength = null;
        let BBCDstartposition = 0;
        let angleD = 0;
        let widthBBCD = 0;
        let nameBBCD = null;
        const randomInt = Math.floor(Math.random() * 100) + 1;
        let wallWidthAjustX = 0;
        if (kitchenShapeType == "L") {
          wallWidthAjustX = 20;
        } else if (kitchenShapeType == "U") {
          wallWidthAjustX = 40;
        }
        // BBC
        if (subObj.cabinettype === "BBC" || subObj.cabinettype === "BBCL" || subObj.cabinettype === "BBCR" ||
          subObj.cabinettype === "WBC" || subObj.cabinettype === "WBCL" || subObj.cabinettype === "WBCR") {
          if (walladjacent == null) {
            console.error('No corresponding wall found.');
            hasError = true;
            showSnackbar('No corresponding wall found.', "error");
          } else {
            if (objectStartPosition === -100) {
              // initial
            } else if (objectStartPosition >= -0.2 && objectStartPosition <= 0.2) {
              if (typeof objectnameT === 'string' && !objectnameT.endsWith('L')) {
                objectnameT += 'L';
              }
              if (typeof subObj.cabinettype === 'string' && !subObj.cabinettype.endsWith('L')) {
                cabinettypeT = subObj.cabinettype + "L";
              } else {
                cabinettypeT = subObj.cabinettype;
              }
              if (typeof changedCanvasObj.objectname === 'string' && !changedCanvasObj.objectname.endsWith('L')) {
                changedCanvasObj.objectname += 'L';
              }
              if (typeof changedCanvasObj.cabinettype === 'string' && !changedCanvasObj.cabinettype.endsWith('L')) {
                changedCanvasObj.cabinettype += 'L';
              }
            } else {
              if (typeof objectnameT === 'string' && !objectnameT.endsWith('R')) {
                objectnameT += 'R';
              }

              if (typeof subObj.cabinettype === 'string' && !subObj.cabinettype.endsWith('L')) {
                cabinettypeT = subObj.cabinettype + "R";
              } else {
                cabinettypeT = subObj.cabinettype;
              }
              if (typeof changedCanvasObj.objectname === 'string' && !changedCanvasObj.objectname.endsWith('R')) {
                changedCanvasObj.objectname += 'R';
              }
              if (typeof changedCanvasObj.cabinettype === 'string' && !changedCanvasObj.cabinettype.endsWith('R')) {
                changedCanvasObj.cabinettype += 'R';
              }
            }
            angleD = getRotation(subObj.rotation, cabinettypeT);
            widthBBCD = Math.round((subObj.depth) / subObj.scale * 100) / 100 + 3;

            objectTypeBBCD = getTypeFromIslandWall(walladjacent, angleD, objectnameT);

            if (walladjacent.objectType === "wall" && walladjacent.rotation === 0) {
              walladjacentlength = walladjacent.width - wallWidthAjustX;
            } else {
              walladjacentlength = walladjacent.width;
            }

            // if (objectTypeBBCD === "lower") {
            if (cabinettypeT == "BBC" || cabinettypeT == "BBCL" || cabinettypeT == "BBCR") {
              if (objectStartPosition >= -0.2 && objectStartPosition <= 0.2) {
                BBCDstartposition = walladjacentlength / subObj.scale - 27;
              }
            } else {
              if (objectStartPosition >= -0.2 && objectStartPosition <= 0.2) {
                BBCDstartposition = walladjacentlength / subObj.scale - 15;
              }
            }
            // } else {
            //   BBCDstartposition = getPositionFromIsland(walladjacent, subObj, objectTypeBBCD);
            // } 
          }

          nameBBCD = objectnameT;
        } else if (subObj.cabinettype === "BLS" || subObj.cabinettype === "SBD" || subObj.cabinettype === "WDC" || subObj.cabinettype === "WLS") {
          if (walladjacent == null) {
            console.error('No corresponding wall found.');
            hasError = true;
            showSnackbar('No corresponding wall found.', "error");
          } else {
            if (subObj.rotation === 90) {
              angleD = 0;
            } else if (subObj.rotation === 270) {
              angleD = 180;
            } else if (subObj.rotation === 0) {
              angleD = 270;
            } else if (subObj.rotation === 180) {
              angleD = 90;
            }
            widthBBCD = Math.round(subObj.width / subObj.scale * 100) / 100;
            nameBBCD = subObj.objectname;
            objectTypeBBCD = getTypeFromIslandWall(walladjacent, angleD, nameBBCD);

            if (walladjacent.objectType === "wall" && walladjacent.rotation === 0) {
              walladjacentlength = walladjacent.width - wallWidthAjustX;
            } else {
              walladjacentlength = walladjacent.width;
            }
            if (subObj.cabinettype === "BLS" || subObj.cabinettype === "SBD") {
              if (objectStartPosition >= -0.2 && objectStartPosition <= 0.2) {
                BBCDstartposition = walladjacentlength / subObj.scale - subObj.widthcabinet;
              }
            } else {
              if (objectStartPosition >= -0.2 && objectStartPosition <= 0.2) {
                BBCDstartposition = walladjacentlength / subObj.scale - subObj.widthcabinet;
              }
            }
          }

        }
        if (subObj.id) {
          let matchObj = cabinetListStore.filter(cabinet => cabinet.id === subObj.relatedId);
          if (matchObj.length > 0) {
            let baseObj = { ...matchObj[0] }; // 浅拷贝，解除只读限制
            let constructionO = null;
            if (objectTypeT === "upper") {
              constructionO = cabConstruction1;
            } else if (objectTypeT === "lower") {
              constructionO = cabConstruction2;
            } else if (objectTypeT === "islandiner" || objectTypeT === "islandouter") {
              constructionO = cabConstruction3;
            }

            baseObj.startposition = Math.round(objectStartPosition * 100) / 100;
            baseObj.name = objectnameT;
            baseObj.wallid = wallcorner?.id ?? null;
            baseObj.rotation = subObj.rotation;
            baseObj.cabinettype = cabinettypeT;
            baseObj.type = objectTypeT;
            baseObj.construction = constructionO;
            allCabObjects.push(baseObj);
          }
          let matchObj2 = null;
          if (subObj.relatedId2 != null) {
            matchObj2 = cabinetListStore.filter(cabinet => cabinet.id === subObj.relatedId2);
            if (matchObj2.length > 0) {
              let baseObj = { ...matchObj2[0] }; // 浅拷贝，解除只读限制
              let constructionBBCD = null;
              if (objectTypeBBCD === "upper") {
                constructionBBCD = cabConstruction1;
              } else if (objectTypeBBCD === "lower") {
                constructionBBCD = cabConstruction2;
              } else if (objectTypeBBCD === "islandiner" || objectTypeBBCD === "islandouter") {
                constructionBBCD = cabConstruction3;
              }

              baseObj.startposition =
                BBCDstartposition != null && !Number.isNaN(BBCDstartposition)
                  ? BBCDstartposition
                  : 0;
              baseObj.name = nameBBCD;
              baseObj.rotation = angleD;
              baseObj.width = widthBBCD;
              baseObj.wallid = walladjacent?.id ?? null;
              baseObj.cabinettype = cabinettypeT + "D";
              baseObj.type = objectTypeBBCD;
              baseObj.construction = constructionBBCD;
              allCabObjects.push(baseObj);
            }
          }
        } else {
          changedCabinetObj = {
            id: relatedIdT,
            kitchenid: kitchenId,
            length: 0,
            type: objectTypeT,
            width: Math.round(subObjWidth / subObj.scale * 100) / 100,
            height: Math.round(heightObj * 100) / 100,
            name: objectnameT,
            cabinettype: cabinettypeT,
            depth: Math.round(subObj.depth / subObj.scale * 100) / 100,
            wallid: wallcorner?.id ?? null,
            startposition: Math.round(objectStartPosition * 100) / 100,
            rotation: subObj.rotation,
            updateFlg: 3,
            cornerKey: objectnameT + randomInt
          };
          changedCabinetObj = { ...(cabinetObjectEmpt ?? {}), ...changedCabinetObj };
          allCabObjects.push(changedCabinetObj);
          let cabObjBBCD = {
            id: relatedIdT,
            kitchenid: kitchenId,
            type: objectTypeT,
            width: widthBBCD,
            height: Math.round(heightObj * 100) / 100,
            name: nameBBCD,
            cabinettype: cabinettypeT + "D",
            depth: Math.round(subObj.depth / subObj.scale * 100) / 100,
            wallid: walladjacent?.id ?? null,  // 相邻的wallid
            startposition: (BBCDstartposition != null && !Number.isNaN(BBCDstartposition)) ? BBCDstartposition : 0,
            rotation: angleD,
            updateFlg: 3,
            cornerKey: objectnameT + randomInt
          };
          cabObjBBCD = { ...(cabinetObjectEmpt ?? {}), ...cabObjBBCD };
          allCabObjects.push(cabObjBBCD);
        }
      });
    } catch (error) {
      console.error('interError:', error);
      hasError = true;
      // showSnackbar('interError.', "error");s
      return;
    }
    const mergedListCanvasObject = [
      // 先把 allSubObjects 放进去（优先级高）
      ...allSubObjects,
      // 再把 canvasObjectStore 中 “还没出现过 id” 的对象补上
      ...canvasObjectStore.filter(
        obj => !allSubObjects.some(sub => sub.id === obj.id)
      )
    ];;

    const mergedListCabinetObject = [
      // 先把 allSubObjects 放进去（优先级高）
      ...allCabObjects,
      // 再把 canvasObjectStore 中 “还没出现过 id” 的对象补上
      ...cabinetListStore.filter(
        obj => !allCabObjects.some(sub => sub.id === obj.id)
      )
    ];;

    let canvasIdI = 1;
    if (canvasId === "canvas2") {
      canvasIdI = 2;
    }
    let data = {
      kitchenId: kitchenId,
      canvasId: canvasIdI,
      cabinetObjectDtoList: mergedListCanvasObject,
      cabinetDtoList: mergedListCabinetObject
    };
    dispatch(updateSubmitData(data));
    const currentCabinetObject = selectCabinetObject(store.getState());
    let updateCabinetTMP = {
      ...currentCabinetObject,
      updateFlag: 1,
      canvasObjectList: mergedListCanvasObject,
      cabinetObjectList: mergedListCabinetObject,
    };
    dispatch(updateCabinet(updateCabinetTMP))

    saveHistory(getCanvas(canvasId), updateCabinetTMP);
    if (hasError) {
      return;
    } else {
      return data;
    }
  }


  const saveAddCabinetPre = (canvasId, cabInfo) => {
    const kitchenId = selectKitchenId(store.getState());
    const currentCabinetObject = selectCabinetObject(store.getState());
    let kitchenShapeType = selectKitchenShapeType(store.getState());
    // 取得当前的object
    let canvasObjectStore = currentCabinetObject.canvasObjectList;
    let cabinetListStore = currentCabinetObject.cabinetObjectList;
    let canvasWallListStore = currentCabinetObject.canvasWallList;
    let canvasobjectEmptyBase = canvasObjectStore.find(
      obj => obj.cabinettype && obj.cabinettype.startsWith('B')
    );
    let cabinetObjectEmptBase = null;
    if (canvasobjectEmptyBase) {
      cabinetObjectEmptBase = cabinetListStore.find(item => item.id === canvasobjectEmptyBase.relatedId);
    }

    let canvasobjectEmptyUpper = canvasObjectStore.find(
      obj => obj.cabinettype && obj.cabinettype.startsWith('W')
    );
    let cabinetObjectEmptUpper = null;
    if (canvasobjectEmptyUpper) {
      cabinetObjectEmptUpper = cabinetListStore.find(item => item.id === canvasobjectEmptyUpper.relatedId);
    }
    const newWallList = canvasWallListStore.map((wall, index) => ({
      index: index,
      id: wall.wallid,
      x: wall.x,
      y: wall.y,
      width: wall.width,
      height: wall.height,
      rotation: wall.rotation,
      objectname: wall.objectname,
      objectType: wall.objectType,
    }));
    const fabricCanvas = getCanvas(canvasId);
    // 先获取所有分组对象（这里只有一个分组）
    const groups = fabricCanvas.getObjects().filter(obj => obj instanceof fabric.Group);
    saveAddCabinet(kitchenId, currentCabinetObject, kitchenShapeType,
      canvasObjectStore, cabinetListStore,
      canvasobjectEmptyBase, cabinetObjectEmptBase,
      canvasobjectEmptyUpper, cabinetObjectEmptUpper, newWallList, groups, cabInfo);

  }
  const saveAddCabinet = (kitchenId, currentCabinetObject, kitchenShapeType,
    canvasObjectStore, cabinetListStore,
    canvasobjectEmptyBase, cabinetObjectEmptBase,
    canvasobjectEmptyUpper, cabinetObjectEmptUpper, newWallList, groups, cabInfo) => {
    const cabConstruction1 = selectConstruction1(store.getState());
    const cabConstruction2 = selectConstruction2(store.getState());
    const cabConstruction3 = selectConstruction3(store.getState());
    const allSubObjects = [];
    const allCabObjects = [];
    let objectStartPosition = 0;
    let sortedGroups = null;
    sortedGroups = groups.sort((a, b) => {
      if (a.left !== b.left) {
        return a.left - b.left;
      }
      return a.top - b.top;
    });
    sortedGroups.forEach(subObj => {
      if (subObj.flag === 'addFlag' && cabInfo.id === subObj.id) {
        let relatedIdT = 90000 + Math.floor(Math.random() * 10000);
        let relatedIdTBBC = 90000 + Math.floor(Math.random() * 10000);

        let objectTypeT = "lower";
        let canvasobjectEmpty = canvasobjectEmptyBase;
        let cabinetObjectEmpt = cabinetObjectEmptBase;
        if (subObj.objectname.startsWith('WP') || subObj.objectname.startsWith('POC') || 
          subObj.objectname.startsWith('SOP')|| subObj.objectname.startsWith('COP')|| 
          subObj.objectname.startsWith('DOP')) {
          objectTypeT = "high";
        } else if (subObj.objectname.startsWith('WF')) {
          let heightT = parseInt(subObj.objectname.slice(4), 10);
          if (heightT >= 96) {
            objectTypeT = "high";
          } else {
            objectTypeT = "upper";
          }
        }else if (subObj.objectname.startsWith('W')|| subObj.objectname.startsWith('WOC') || subObj.objectname.startsWith('PNW')) {
          objectTypeT = "upper";
          canvasobjectEmpty = canvasobjectEmptyUpper;
          cabinetObjectEmpt = cabinetObjectEmptUpper;
        }  else if (subObj.objectname.startsWith('PNB')|| subObj.objectname.startsWith('PNI') ) {
          let heightT = 0;
          if (subObj.objectname.startsWith('PNB') || subObj.objectname.startsWith('PNI') ) {
              heightT = parseInt(subObj.objectname.slice(3), 10);
            } else {
              heightT = parseInt(subObj.objectname.slice(4), 10);
            }
            if (heightT >= 96) {
              objectTypeT = "high";
            }
        } else if (subObj.objectname.startsWith('SP')) {
          let heightT = parseInt(subObj.objectname.slice(4), 10);
          if (heightT >= 96) {
            objectTypeT = "high";
          } else {
            let depthT = parseInt(subObj.objectname.slice(2,4), 10);
            if (depthT === 12) {
              objectTypeT = "upper";
            }
          }
        } else if (subObj.objectname.startsWith('RRP')) {
          let heightT = parseInt(subObj.objectname.slice(5), 10);
          if (heightT >= 96) {
            objectTypeT = "high";
          }
        }
        let subObjWidth = subObj.width;
        let subObjX = subObj.left;
        let subObjY = subObj.top;
        if (subObj.cabinettype === "BLS" || subObj.cabinettype === "WLS" ||
          subObj.cabinettype === "SBD" || subObj.cabinettype === "WDC") {
          subObjY = subObj.top + subObjWidth - subObj.depth;
        }
        let heightObj = 34.5;
        if (objectTypeT === "lower" || objectTypeT === "islandiner" || objectTypeT === "islandouter") {
          heightObj = 34.5;
        } else if (objectTypeT === "upper" || objectTypeT === "high") {
          if (subObj.cabinettype === "WP" ) {
            if (subObj.objectname.length === 7) {
              heightObj = subObj.objectname.slice(-3);
            } else {
              heightObj = subObj.objectname.slice(-2);
            }
          } else if (subObj.cabinettype === "POC" || subObj.cabinettype == "SOP"|| subObj.cabinettype == "COP"|| subObj.cabinettype == "DOP") {
            if (subObj.objectname.length === 8) {
              heightObj = subObj.objectname.slice(-3);
            } else {
              heightObj = subObj.objectname.slice(-2);
            }
          } else if (subObj.objectname.startsWith('PNB') || subObj.objectname.startsWith('PNI')  || subObj.objectname.startsWith('PNW')) {
              heightObj = subObj.objectname.slice(3);
          } else if (subObj.objectname.startsWith('WF')  ) {
              heightObj = subObj.objectname.slice(4);
          }  else if (subObj.objectname.startsWith('SP')) {
             heightObj = subObj.objectname.slice(4);
          } else if (subObj.objectname.startsWith('RRP')) {
            heightObj = subObj.objectname.slice(5);
          } else {
            heightObj = subObj.objectname.slice(-2);
          }
        }
        const canvasRandomId = Math.floor(10000 + Math.random() * 90000);
        let obj = {
          id: canvasRandomId,
          objectType: objectTypeT,
          x: subObjX,
          y: subObjY,
          width: subObjWidth,
          height: Math.round(heightObj * subObj.scale * 100) / 100,
          rotation: subObj.rotation,
          color: "#FFFBF0",
          relatedId: relatedIdT, // 对应的cabinet的id，现在还未确定id 
          kitchenid: kitchenId,
          objectname: subObj.objectname,
          cabinettype: subObj.cabinettype,
          depth: subObj.depth,
          scale: subObj.scale,
          // construction: cabConstruction,
          data: null,
          wallid: null,
          updateFlg: 3,   //ADD
          flag: "addFlag",
          widthcabinet: parseFloat(subObj.widthcabinet),
          heightcabinet: parseFloat(subObj.heightcabinet),
          depthcabinet: parseFloat(subObj.depthcabinet),
        };
        subObj.id = canvasRandomId;
        subObj.relatedId = relatedIdT;
        // subObj.flag = "init"; // 标记新增已处理

        if (subObj.cabinettype === "BLS" || subObj.cabinettype === "WLS") {
          obj.y = subObjY + subObj.width - subObj.depth;
          obj.relatedId2 = relatedIdTBBC;
          subObj.relatedId2 = relatedIdTBBC;
        } else if (subObj.cabinettype === "SBD" || subObj.cabinettype === "WDC") {
          obj.y = subObjY + subObj.width - subObj.depth;
          obj.relatedId2 = relatedIdTBBC;
          subObj.relatedId2 = relatedIdTBBC;
        } else if (subObj.cabinettype === "BBC" || subObj.cabinettype === "WBC") {
          obj.relatedId2 = relatedIdTBBC;
          subObj.relatedId2 = relatedIdTBBC;
        }
        obj = { ...canvasobjectEmpty, ...obj };
        allSubObjects.push(obj);  // 添加到 allSubObjects 数组            

        // 
        let cabConstructionLow = null;
        if (objectTypeT === "lower") {
          cabConstructionLow = cabConstruction2;
        } else if (objectTypeT === "upper") {
          cabConstructionLow = cabConstruction1;
        } else if (objectTypeT === "islandiner" || objectTypeT === "islandouter") {
          cabConstructionLow = cabConstruction3;
        }
        const randomInt = Math.floor(Math.random() * 100) + 1;
        let cabObj = {
          id: relatedIdT,
          kitchenid: kitchenId,
          length: 0,
          type: objectTypeT,
          width: Math.round(subObjWidth / subObj.scale * 100) / 100,
          height: Math.round(heightObj * 100) / 100,
          name: subObj.objectname,
          cabinettype: subObj.cabinettype,
          depth: Math.round(subObj.depth / subObj.scale * 100) / 100,
          wallid: null,
          startposition: Math.round(objectStartPosition * 100) / 100,
          rotation: subObj.rotation,
          updateFlg: 3,
          construction: cabConstructionLow,
          cornerKey: subObj.objectname + randomInt
        };
        cabObj = { ...(cabinetObjectEmpt ?? {}), ...cabObj };
        let widthBBCD = 0;
        let flagBBCD = false;
        if (subObj.cabinettype === "BBC" || subObj.cabinettype === "BBCL" || subObj.cabinettype === "BBCR" ||
          subObj.cabinettype === "WBC" || subObj.cabinettype === "WBCL" || subObj.cabinettype === "WBCR") {
          // 通过object的left，top，确定相邻的wallid
          widthBBCD = Math.round((subObj.depth) / subObj.scale * 100) / 100 + 3;
          flagBBCD = true;
        } else if (subObj.cabinettype === "BLS" || subObj.cabinettype === "SBD" || subObj.cabinettype === "WDC" || subObj.cabinettype === "WLS") {
          widthBBCD = Math.round((subObj.width) / subObj.scale * 100) / 100;
          flagBBCD = true;
        }
        if (flagBBCD) {
          let cabObjBBCD = {
            id: relatedIdTBBC,
            kitchenid: kitchenId,
            type: objectTypeT,
            width: widthBBCD,
            height: Math.round(heightObj * 100) / 100,
            name: subObj.objectname,
            cabinettype: subObj.cabinettype + "D",
            depth: Math.round(subObj.depth / subObj.scale * 100) / 100,
            wallid: null,  // 相邻的wallid
            startposition: 0,
            rotation: 90,
            updateFlg: 3,
            construction: cabConstructionLow,
            cornerKey: subObj.objectname + randomInt
          };
          cabObjBBCD = { ...(cabinetObjectEmpt ?? {}), ...cabObjBBCD };
          allCabObjects.push(cabObjBBCD);
        }
        allCabObjects.push(cabObj);
      }
    });
    const mergedListCanvasObject = [
      // 先把 allSubObjects 放进去（优先级高）
      ...allSubObjects,
      // 再把 canvasObjectStore 中 “还没出现过 id” 的对象补上
      ...canvasObjectStore.filter(
        obj => !allSubObjects.some(sub => sub.id === obj.id)
      )
    ];;

    const mergedListCabinetObject = [
      // 先把 allSubObjects 放进去（优先级高）
      ...allCabObjects,
      // 再把 canvasObjectStore 中 “还没出现过 id” 的对象补上
      ...cabinetListStore.filter(
        obj => !allCabObjects.some(sub => sub.id === obj.id)
      )
    ];;
    let updateCabinetTMP = {
      ...currentCabinetObject,
      updateFlag: 1,
      canvasObjectList: mergedListCanvasObject,
      cabinetObjectList: mergedListCabinetObject,
    };
    dispatch(updateCabinet(updateCabinetTMP))
  }
  const getPositionFromIsland = (wallcorner, subObj, objectTypeT) => {
    let objectStartPosition;
    if (subObj.rotation === 0) {
      if (objectTypeT === "islandouter") {
        objectStartPosition = (wallcorner.x + wallcorner.width - subObj.left - subObj.width) / subObj.scale;
      } else {
        objectStartPosition = (subObj.left - (wallcorner.x)) / subObj.scale;
      }
    } else if (subObj.rotation === 90) {
      if (objectTypeT === 'islandouter') {
        objectStartPosition = (wallcorner.y - subObj.top - subObj.height) / subObj.scale;
      } else {
        objectStartPosition = (subObj.top - (wallcorner.y)) / subObj.scale;
      }
    } else if (subObj.rotation === 180) {
      if (objectTypeT === "islandouter") {
        objectStartPosition = (wallcorner.x + wallcorner.width - subObj.left - subObj.width) / subObj.scale;
      } else {
        objectStartPosition = (wallcorner.x + wallcorner.width - subObj.left - subObj.width) / subObj.scale;
      }
    } else if (subObj.rotation === 270) {
      if (objectTypeT === 'islandouter') {
        objectStartPosition = (subObj.top - wallcorner.y) / subObj.scale;
      } else {
        objectStartPosition = (wallcorner.y - subObj.top - subObj.height) / subObj.scale;
      }
    }
    return objectStartPosition;
  }
  const getTypeFromIslandWall = (wallcorner, rotation, name) => {
    if (wallcorner.objectType === "island" || wallcorner.objectType === "peninsula") {
      if (wallcorner.rotation === rotation) {
        return "islandiner";
      } else {
        return "islandouter";
      }
    } else {
      if (name.startsWith('W')) {
        return "upper";
      } else {
        return "lower";
      }

    }
  }
  const getRotation = (rotation, cabinettype) => {
    let angleD = 0;
    if (rotation === 90) {
      if (cabinettype === "WBCL" || cabinettype === "BBCL" || cabinettype === "WBC" || cabinettype === "BBC") {
        angleD = 180;
      } else if (cabinettype === "WBCR" || cabinettype === "BBCR") {
        angleD = 0;
      }
    } else if (rotation === 270) {
      if (cabinettype === "WBCL" || cabinettype === "BBCL" || cabinettype === "WBC" || cabinettype === "BBC") {
        angleD = 0;
      } else if (cabinettype === "WBCR" || cabinettype === "BBCR") {
        angleD = 180;
      }

    } else if (rotation === 0) {
      if (cabinettype === "WBCL" || cabinettype === "BBCL" || cabinettype === "WBC" || cabinettype === "BBC") {
        angleD = 90;
      } else if (cabinettype === "WBCR" || cabinettype === "BBCR") {
        angleD = 270;
      }
    } else if (rotation === 180) {
      if (cabinettype === "WBCL" || cabinettype === "BBCL" || cabinettype === "WBC" || cabinettype === "BBC") {
        angleD = 270;
      } else if (cabinettype === "WBCR" || cabinettype === "BBCR") {
        angleD = 90;
      }
    }
    return angleD;
  }
  const geObjFromIsland = (wallcorner, changedCanvasObj, subObj) => {
    let objectTypeT = "lower";
    if (wallcorner.rotation === changedCanvasObj.rotation) {
      changedCanvasObj.objectType = "islandiner";
      objectTypeT = "islandiner";
    } else {
      changedCanvasObj.objectType = "islandouter";
      objectTypeT = "islandouter";
      if (wallcorner.objectType === "peninsula") {
        if (changedCanvasObj.rotation === 270) {
          changedCanvasObj.y = subObj.top;
        } else if (changedCanvasObj.rotation === 90) {
        } else if (changedCanvasObj.rotation === 180) {
        } else if (changedCanvasObj.rotation === 0) {
        }
      }
    }
    let pos = getPositionFromIsland(wallcorner, subObj, objectTypeT);
    return { objectStartPosition: pos, objectType: objectTypeT };
  }
  return (
    <CanvasContext.Provider value={{
      createCanvas, drawCabinetTop, drawCabinetEleva, getCanvas,
      recreateCanvas, cleanupCanvas, saveSubmitData
    }}>
      {children}
    </CanvasContext.Provider>
  );
};

// 自定义 hook，用来消费 CanvasContext
export const useCanvas = () => useContext(CanvasContext);
