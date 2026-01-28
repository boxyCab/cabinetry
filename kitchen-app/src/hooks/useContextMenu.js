// hooks/useContextMenu.js
import React, {  useCallback  } from 'react';
import store, { updateCabinet, selectCabinetObject,selectConstruction1,  } from './../store'; 
import { useSnackbar } from "../components/GlobalSnackbar";
import  { MessageInfo } from './../common/MessageInfo';
import { useDispatch, useSelector } from 'react-redux';
import { drawCabinetset, drawBLSRotate, drawSBDRotate } from '../components/drawCabinets';
import fabric from '../utils/fabricConfig';
import { useCanvas } from './../CanvasContext';

export const useContextMenu = (canvasRef, cabinetObjectCabs, cabinetCanvasInfo, setCabinetCanvasInfo) => {
  // 管理上下文菜单的状态
  const {getCanvas  } = useCanvas();
  const [contextMenu, setContextMenu] = React.useState(null);
  const [cabinetGroup, setCabinetGroup] = React.useState(null);
  const construction1 = useSelector(selectConstruction1);  
  const showSnackbar = useSnackbar();
  const dispatch = useDispatch();
  const cabinetObject = useSelector(selectCabinetObject);
  const [cabinetIdMax, setCabinetIdMax] = React.useState(0);
  // 处理右键事件
  const handleContextMenu = useCallback((event) => {
    event.preventDefault();
    console.log('Right click event triggered');
    const { clientX, clientY } = event;
    console.log('Mouse position:', { clientX, clientY });
  setContextMenu({ mouseX: clientX, mouseY: clientY });
  console.log('Context menu state:', { mouseX: clientX, mouseY: clientY });
  if (!canvasRef.current) {
    console.log('Canvas ref is not available');
    return;
  }

    const canvas = canvasRef.current;
    
    // Get canvas element and its position
    const canvasElement = canvas.getElement();
    if (!canvasElement) return;
    const rect = canvasElement.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const pointer = { x, y };
    // Find the target object at the mouse position
    const target = canvas.findTarget(pointer, false) || canvas.getActiveObject();
    
    // const target = canvas.getActiveObject() || canvas.findTargetAt(pointer.x, pointer.y);
    if (target) {
      if (target.flag === "addFlag") {
        let widthT = target.width;
        let heightT = target.height;
        if (target.rotation === 90 || target.rotation === 270) {
          widthT = target.height;
          heightT = target.width;
        }
        // 从cabinetMenu中选择的图形可以旋转
        setCabinetGroup([{text:"Rotate 90 degrees", 
          objs:[{text:target.objectname,x:target.left, y:target.to, width:widthT, }], 
          data:target,scale: target.scale, height:heightT, target:target, rotate:90, width:widthT},
          {text:"Rotate 180 degrees", 
            objs:[{text:target.objectname,x:target.left, y:target.to, width:widthT, }], 
            data:target,scale: target.scale, height:heightT, target:target, rotate:180, width:widthT},
            {text:"Rotate 270 degrees", 
              objs:[{text:target.objectname,x:target.left, y:target.to, width:widthT, }], 
              data:target,scale: target.scale, height:heightT, target:target, rotate:270, width:widthT},
              {text:"Keep the initial state", 
                objs:[{text:target.objectname,x:target.left, y:target.to, width:widthT, }], 
                data:target,scale: target.scale, height:heightT, target:target, rotate:0, width:widthT}]);
        return;
      }
    //   // Get the position of the target
    //   const targetLeft = target.left;
    //   const targetTop = target.top;
    //   const targetCabinettype = target.cabinettype;
      
    //   let obj_width = target.width /target.scale;
    //   let obj_option = [];
    //   let width_2db =[27,30,33,36];
    //   let width_3db =[12,15,18,21,24,27,30,33,36];
    //   let width_b =[9,12,15,18,21,24,27,30,33,36,42];

    //   if (construction1.startsWith("bc1")) {
    //     width_2db =[24, 27,30,33,36];
    //   }

    //   if  (targetCabinettype === "B" || targetCabinettype === "2DB" || targetCabinettype === "3DB") {
    //     // 根据长度右键提示可替换柜子
    //     if (targetCabinettype === "B" ) {
    //       if (width_2db.includes(obj_width)) {
    //         obj_option.push({text:"Replace with 2DB", 
    //           objs:[{text:"2DB"+obj_width,x:targetLeft, y:targetTop, width:obj_width, }], 
    //           data:target,scale: target.scale, depth:target.depth, target:target, cabinettype : "2DB"});
    //       }
    //       if (width_3db.includes(obj_width)) {
    //         obj_option.push({text:"Replace with 3DB", 
    //           objs:[{text:"3DB"+obj_width,x:targetLeft, y:targetTop, width:obj_width, }], 
    //           data:target,scale: target.scale, depth:target.depth, target:target, cabinettype : "3DB"});
    //       }
    //     } else if (targetCabinettype === "2DB") {
    //       if (width_b.includes(obj_width)) {
    //         obj_option.push({text:"Replace with Base", 
    //           objs:[{text:"B"+obj_width,x:targetLeft, y:targetTop, width:obj_width, }], 
    //           data:target,scale: target.scale, depth:target.depth, target:target, cabinettype : "B"});
    //       }
    //       if (width_3db.includes(obj_width)) {
    //         obj_option.push({text:"Replace with 3DB", 
    //           objs:[{text:"3DB"+obj_width,x:targetLeft, y:targetTop, width:obj_width, }], 
    //           data:target,scale: target.scale, depth:target.depth, target:target, cabinettype : "3DB"});
    //       }
    //     } else {
    //       if (width_b.includes(obj_width)) {
    //         obj_option.push({text:"Replace with Base", 
    //           objs:[{text:"B"+obj_width,x:targetLeft, y:targetTop, width:obj_width, }], 
    //           data:target,scale: target.scale, depth:target.depth, target:target, cabinettype : "B"});
    //       }
    //       if (width_2db.includes(obj_width)) {
    //         obj_option.push({text:"Replace with 2DB", 
    //           objs:[{text:"2DB"+obj_width,x:targetLeft, y:targetTop, width:obj_width, }], 
    //           data:target,scale: target.scale, depth:target.depth, target:target, cabinettype : "2DB"});
    //       }
    //     }
    //     setCabinetGroup(obj_option);
    //  } else {
    //   setCabinetGroup([]);
    //  }
    } else {
      setCabinetGroup([]);
    }
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
  }, [canvasRef, setContextMenu, setCabinetGroup, construction1]);

  // 关闭菜单
  const handleCloseMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // 处理菜单选项点击
  const handleOption = useCallback(
    (option, canvasId) => {
      let canvas = getCanvas(canvasId);
      if (!option || !canvas) {
        console.error("Invalid option or canvas:", option, canvas);
        showSnackbar(MessageInfo.interError, "error");
        return;
      }
      const cabArray = option.objs || [];
      // rotation
      if ( option.rotate != undefined) {
        let target = option.target;
        if (target) {
            if (target.cabinettype == "BLS" || target.cabinettype === 'WLS') {
              let cabinetT = {"rotation": 0, "width": target.width, "depth": target.depth, "height": target.height,
                "cabinettype": target.cabinettype, "color":target.color, "x":target.left, "y":target.top, "objectname":target.objectname,
                "scale" : target.scale,
              "widthcabinet": target.widthcabinet , "id": target.id, "relatedId": target.relatedId, "relatedId2": target.relatedId2};
              let changedObj = drawBLSRotate(canvas, cabinetT, option.rotate, "addFlag");
              const cabinetObject = selectCabinetObject(store.getState());
              let canvasObjectStore = cabinetObject.canvasObjectList;
              let updatedCanvasObjectstmp = canvasObjectStore.map(item => {
                if (item.id === target.id) {
                  let mod = positionMod(changedObj.left, changedObj.top, changedObj.rotation, changedObj.width, changedObj.depth, changedObj.height, changedObj.cabinettype); 
                  
                  return {
                        ...item,
                         x: mod.left ,
                        y: mod.top ,
                        rotation: option.rotate,
                        // width :changedObj.width,
                        // height : changedObj.height
                    };
                }
                return item;
              });             
              let updateCabinetTMP = {
                  ...cabinetObject,
                  updateFlag: 1,
                  canvasObjectList:updatedCanvasObjectstmp, 
              };
              dispatch(updateCabinet(updateCabinetTMP));
    
                // 从canvas中移除对象
                canvas.remove(target);
                canvas.renderAll(); // 刷新画布以显示更改
                handleCloseMenu(null);
                return;
            } else if (target.cabinettype === 'SBD' || target.cabinettype === 'WDC')  { 
               let cabinetT = {"rotation": 0, "width": target.width, "depth": target.depth, "height": target.height,
                "cabinettype": target.cabinettype, "color":target.color, "x":target.left, "y":target.top, "objectname":target.objectname, "scale" : target.scale,
              "widthcabinet": target.widthcabinet, "id": target.id, "relatedId": target.relatedId, "relatedId2": target.relatedId2};
                let changedObj = drawSBDRotate(canvas, cabinetT, option.rotate, "addFlag");
                const cabinetObject = selectCabinetObject(store.getState());
              let canvasObjectStore = cabinetObject.canvasObjectList;
              let updatedCanvasObjectstmp = canvasObjectStore.map(item => {
                if (item.id === target.id) {
                  let mod = positionMod(changedObj.left, changedObj.top, changedObj.rotation, changedObj.width, changedObj.depth, changedObj.height, changedObj.cabinettype); 
                  return {
                        ...item,
                        x: mod.left ,
                        y: mod.top ,
                        rotation: option.rotate,
                        // width :changedObj.width,
                        // height : changedObj.height
                    };
                }
                return item;
              });             
              let updateCabinetTMP = {
                  ...cabinetObject,
                  updateFlag: 1,
                  canvasObjectList:updatedCanvasObjectstmp, 
              };
              dispatch(updateCabinet(updateCabinetTMP));
              // 从canvas中移除对象
                canvas.remove(target);
                canvas.renderAll(); // 刷新画布以显示更改
                handleCloseMenu(null);
                return;
            }
          let widthT = option.width;
          let heightT = option.height;
          const allObjects = target.getObjects();
          // 筛选出文本对象
          const cabinetRectList = allObjects.filter(obj => obj instanceof fabric.Rect);
          const textObject = allObjects.find(obj => obj instanceof fabric.Text);
          // 保存原始宽度和高度
  
          if (option.rotate === 90 || option.rotate === 270) {
            widthT = option.height;
            heightT = option.width;
          }
          // 计算 `rect` 宽高交换后的位置偏移
          const boundingRect = target.getBoundingRect();
  
          // target.rotation = option.rotate;
          if (!target.rotation) target.rotation=0;
          // 交换宽度和高度
          cabinetRectList.forEach((cabinetRect,index) => {
            let isSwap = null;
            if (target.rotation === option.rotate) {
              isSwap = false;
            } else {
              let isSwapT = target.rotation % 180 !== 0;
              let isSwapO = option.rotate % 180 !== 0;
              if (isSwapT != isSwapO) {
                isSwap = true;
              } else {
                isSwap = false;
              }
            }
            const newWidth = isSwap ? cabinetRect.height : cabinetRect.width;
            const newHeight = isSwap ? cabinetRect.width : cabinetRect.height;
            cabinetRect.set({
                width: newWidth,   // 将原来的高度设置为宽度
                height: newHeight ,   // 将原来的宽度设置为高度
              //   left: newWidth/2 + newRelX,
              // top: newHeight/2 + newRelY
  
            });
            cabinetRect.setCoords();
  
            // 更新 `rect` 的位置，使其保持与原位置一致
            let newRelX = -newWidth / 2;
            let newRelY = -newHeight / 2;
            newRelX = Number(newRelX);
            newRelY = Number(newRelY);
            if (index === 1) {
              if (option.rotate === 90 || option.rotate === 270) {
                newRelY = -newHeight + heightT/2;
                newRelY = Number(newRelY);
              } else {
                newRelX = -newWidth + widthT/2;
                newRelX = Number(newRelX);
              }
            }
            cabinetRect.set({
              left: newRelX,  // 调整 left
              top: newRelY   // 调整 top
            });  
            // 更新 rect 的坐标系统
            cabinetRect.setCoords();
          });
            textObject.set({
              left: 0,
              top: 0,
              angle: option.rotate
            });
            textObject.setCoords(); // 更新文本对象的坐标信息
          target.rotation = option.rotate;
          target.setCoords();  // 确保 group 的边界框更新
          canvas.setActiveObject(target);
          // 更新 group 封装盒
          const maxWidth = Math.max(...cabinetRectList.map(r => r.width));
          const maxHeight = Math.max(...cabinetRectList.map(r => r.height));
          
            target.set({
              width: maxWidth,
              height: maxHeight,
              left: boundingRect.left,  // 调整 left
              top: boundingRect.top,   // 调整 top
            }); 
            target.setCoords();
          target.canvas.requestRenderAll();
          // canvas.renderAll(); // 刷新画布以显示更改

          // 选择之后需要更新 cabinetCanvasInfo 和 cabinets 中的数据
          const cabinetObject = selectCabinetObject(store.getState());
          let canvasObjectStore = cabinetObject.canvasObjectList;
          let cabinetListStore = cabinetObject.cabinetObjectList;
          let updatedCanvasObjectstmp = canvasObjectStore.map(item => {
            if (item.id === target.id) {
              let mod = positionMod(target.left, target.top, target.rotation, target.width, target.depth, target.height, target.cabinettype); 
                return {
                    ...item,
                    x: mod.left ,
                    y: mod.top ,
                    // width: target.width,
                    // height: target.height,
                    rotation: option.rotate
                    // flag: "moveFlag",
                    // updateFlg: 2
                };
            }
            return item;
          });             
          let updateCabinetTMP = {
              ...cabinetObject,
              updateFlag: 1,
              canvasObjectList:updatedCanvasObjectstmp, 
          };
          dispatch(updateCabinet(updateCabinetTMP));
          handleCloseMenu(null);
          return;
          
        }
        
      } else {
      //   let target = option.target;
      //   const cabList = cabArray
      //   .filter((cabindext) => cabindext && typeof cabindext.text !== "undefined")
      //   .map((cabindext) => {
      //     console.log("cabindext.text:", cabindext.text);
      //     let idmax = cabinetIdMax + 1;
      //     setCabinetIdMax(idmax);
      //     return {
      //       id: idmax,
      //       kitchen: target.kitchen,
      //       cabinettype: target.cabinettype,
      //       objectType: target.objectType,
      //       objectname: cabindext.text,
      //       fill: "#FFFBF0",
      //       x: cabindext.x,
      //       y: cabindext.y,
      //       width: cabindext.width * option.scale,
      //       height: target.height,
      //       depth: option.depth,
      //       rotation: target.rotation,
      //       color:  "#FFFBF0",
      //       data: false,
      //       scale: option.scale,
      //       updateFlg : 1,
      //       widthcabinet:cabindext.width,
      //     };
      //   });
      // if (option.target && canvas.getObjects().includes(option.target)) {
      //   console.log("Removing target:", option.target);
      //   // 移除 group 中的每个子对象
      //   option.target.forEachObject((obj) => {
      //     canvas.remove(obj); // 从 canvas 中移除 group 的每个子对象
      //   });
      //   canvas.remove(option.target);
      //   canvas.discardActiveObject(); // 清除可能的选中状态
      //   // setCanvas(canvas);  
      //   canvas.renderAll();           // 刷新 Canvas
  
      // } else {
      //     console.warn("Target not found in canvas or invalid:", option.target);
      // }
      // const updatedCabinetInfo = cabinetCanvasInfo.map((cabinetCanvasItem) => {
      //   // 如果匹配 ID，则更新 cabinettype 和 objectname
      //   if (cabinetCanvasItem.id === option.target.id) {

      //     return {
      //       ...cabinetCanvasItem, // 保留其他属性不变
      //       cabinettype: cabList[0].cabinettype, // 更新 cabinettype
      //       objectname: cabList[0].objectname, // 更新 objectname
      //       updateFlg : 1
      //     };
      //   }
      //   // 如果不匹配，直接返回原对象
      //   return cabinetCanvasItem;
      // });
      //   setCabinetCanvasInfo(updatedCabinetInfo);
      //   drawCabinetset(canvas, cabList );
  
      //   // 1. 找到 cabinetCanvasInfo 中 id 匹配的对象
      //   const targetCanvasItem = cabinetCanvasInfo.find(
      //     (cabinetCanvasItem) => cabinetCanvasItem.id === option.target.id
      //   );
      //   // 2. 如果找到对象，则使用它的 relatedId 更新 cabinets
      //   if (targetCanvasItem) {
      //     const relatedId = targetCanvasItem.relatedId;
  
      //     // 3. 更新 cabinets 中对应 id 的对象
      //     const updatedCabinets = cabinetObjectCabs.map((cabinet) => {
      //       if (cabinet.id === relatedId) {
      //         return {
      //           ...cabinet, // 保留其他属性
      //           cabinettype: cabList[0].cabinettype, // 更新 cabinettype
      //          // objectname: cabList[0].objectname, // 更新 objectname
      //           name: cabList[0].objectname,
      //           updateFlg : 1
      //         };
      //       }
      //       return cabinet; // 不匹配的对象保持不变
      //     });
  
      //     // setCabinets(updatedCabinets);
      //     const updatedCabinetFlag = {
      //             ...cabinetObject,
      //             updateFlag: 1,
      //             canvasObjectList: updatedCabinetInfo,
      //             cabinetObjectList: updatedCabinets
  
      //     };
      //   dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
  
      //   } else {
      //     console.log("未找到匹配的 cabinetCanvasItem");
      //   }
  
      //  handleCloseMenu(null);

      }
  
      
    },
    [handleCloseMenu]
  );

  const positionMod = (x, y, rotation, width, depth, height, cabinettype) =>{
    let subObjX = x;
    let subObjY = y; 
    if (cabinettype === "BLS" || cabinettype === "WLS") {
        if (rotation === 0) {
            subObjY = y + width - depth;
        } else if (rotation === 90) {

        } else if (rotation === 180) {
             subObjX = x + width;
        } else if (rotation === 270) {
           subObjY = y + width ;
           subObjX = x + width - depth ;
        }
    } else if (cabinettype === "SBD" || cabinettype === "WDC") {
        if (rotation === 0) {
            subObjY = y + width - depth;
        } else if (rotation === 90) {

        } else if (rotation === 180) {
             subObjX = x + width;
        } else if (rotation === 270) {
            subObjY = y + width ;
            subObjX = x + width - depth ;
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

    return {left: subObjX, top:subObjY};
}

  return {
    contextMenu,
    handleContextMenu,
    handleCloseMenu,
    handleOption,
    cabinetGroup, // 菜单选项列表
    cabinetObjectCabs,
    cabinetCanvasInfo,
    setCabinetCanvasInfo
  };
};



