// src/components/Canvas.js
import React, { useEffect, useRef } from 'react';
import fabric from '../utils/fabricConfig';
import './MyCanvasComponent.css';
import { drawElevationWall } from './drawWall';
import { drawElevationAppliance } from './DrawApplianceSet';
import { drawElevationCabinetset } from './drawCabinets';
import { drawElevationWindow } from './drawWindow';
import { drawElevationDoor } from './drawDoor';
import { selectCabinetObject, selectKitchenId, selectCeilingHeight, selectConstruction1, selectConstruction2 } from './../store';
import { useSelector } from 'react-redux';
import { useSnackbar } from "../components/GlobalSnackbar";
import { MessageInfo } from './../common/MessageInfo';
import Tooltip from "./Tooltip";

const ElevationView = ({ canvasobjectList, pageIndex }) => {
  console.log("ElevationView render:" + canvasobjectList);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);

  const [canvas, setCanvas] = React.useState(null);
  const [cabinetIdMax, setCabinetIdMax] = React.useState(0);
  const cabinetObjectPage = useSelector(selectCabinetObject);
  const construction1 = useSelector(selectConstruction1);
  const construction2 = useSelector(selectConstruction2);

  const kitchenId = useSelector(selectKitchenId);
  const ceilingHeight = useSelector(selectCeilingHeight);

  const showSnackbar = useSnackbar();
  const [tooltip, setTooltip] = React.useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const getWidthFromWallObjectName = (wallObjectName) => {
    const match = wallObjectName.match(/\d+\.?\d*/); // 查找第一个数字
    return match ? Number(match[0]) : NaN; // 如果找到数字，则转换为数值
  };
  const loadShapes = async (fabricCanvas) => {
    // 
    if (!canvasobjectList || canvasobjectList.length === 0) {
      showSnackbar(MessageInfo.interError);
      return;
    }
    const fetchedCanvasobjectList = canvasobjectList;
    const canvaswallsObject = [];
    const canvascabinetObject = [];
    const canvaswindowsObject = [];
    const canvasdoorsbject = [];
    const canvasappliancesObject = [];
    let cabinetPositionY = 1050;
    let cabinetPositionX = 100;

    let scaleX = 0;
    let scaleY = 9;
    const applianceTypes = ["Refrigerator", "Range", "Oven", "Dishwasher", "Hood"];

    let canvasWallListStore = cabinetObjectPage.canvasWallList;
    let wallidT = canvasobjectList[0].wallid;
    let wallType = canvasobjectList[0].type;
    let wallObject
    if (wallType === "islandouter" || wallType === "islandiner") {
      wallObject = canvasWallListStore.find(wall => wall.wallid === wallidT &&
        (wall.objectType === 'island' || wall.objectType === 'peninsula'));
    } else if (wallType === "upper" || wallType === "lower" || wallType === "high") {
      wallObject = canvasWallListStore.find(wall => wall.wallid === wallidT && wall.objectType === 'wall');
    }

    let wallObjectName = wallObject.objectname;
    let wallWidth = getWidthFromWallObjectName(wallObjectName);

    scaleX = Math.floor((1050.0 / wallWidth) * 10) / 10;
    if (scaleX > 9) {
      scaleX = 9;
    }

    // 确定wall对象
    let canvasWall = { x: 100, y: cabinetPositionY, width: wallWidth * scaleX, scale: scaleX, ceilingHeight: ceilingHeight };
    let cabinetPositionMaxX = canvasWall.width + cabinetPositionX;
    canvaswallsObject.push(canvasWall);

    fetchedCanvasobjectList.forEach((canvasObject) => {
      if (canvasObject.width === 0 && canvasObject.cabinettype !== 'SP') {
        console.log("canvasObject: " + canvasObject.name);
        return;
      }
      let canvasObjectT = { ...canvasObject }; // 创建对象的浅拷贝
      if (canvasObject.type === "islandouter" && canvasObject.rotation === 0) {
        canvasObjectT.x = cabinetPositionMaxX - canvasObject.startposition * scaleX - canvasObject.width * scaleX;

      } else {
        canvasObjectT.x = cabinetPositionMaxX - canvasObject.startposition * scaleX - canvasObject.width * scaleX;
      }
      canvasObjectT.y = cabinetPositionY - scaleY * canvasObject.height;
      canvasObjectT.width = canvasObject.width * scaleX;
      canvasObjectT.height = canvasObject.height * scaleY;
      canvasObjectT.objectname = canvasObject.name;
      canvasObjectT.scale = scaleX;
      canvasObjectT.widthcabinet = canvasObject.width;
      let ceilingHeightY = 0;
      let ceilingHeightY2 = 0;
      if (ceilingHeight >= 105) {
        ceilingHeightY = cabinetPositionY - scaleY * 105;

      } else if (ceilingHeight >= 93) {
        ceilingHeightY = cabinetPositionY - scaleY * 93;
      } else {
        if (ceilingHeight >= 84 && construction2.toLowerCase().startsWith("bc1")) {
          ceilingHeightY = cabinetPositionY - scaleY * (84);
        } else {
          ceilingHeightY = cabinetPositionY - scaleY * (ceilingHeight);
        }
      }
      if (canvasObject.cabinettype === "WBCLD" || canvasObject.cabinettype === "WBCRD" || canvasObject.cabinettype === "WBCD") {
        canvasObjectT.widthcabinet = canvasObject.width - 12;
      } else if (canvasObject.cabinettype === "BBCD" || canvasObject.cabinettype === "BBCLD" || canvasObject.cabinettype === "BBCRD") {
        canvasObjectT.widthcabinet = canvasObject.width - 24;
      } else if (canvasObject.cabinettype === "WBC" || canvasObject.cabinettype === "WBCL" || canvasObject.cabinettype === "WBCR") {
        canvasObjectT.widthcabinet = canvasObject.width - 3;
      } else if (canvasObject.cabinettype === "BBC" || canvasObject.cabinettype === "BBCL" || canvasObject.cabinettype === "BBCR") {
        canvasObjectT.widthcabinet = canvasObject.width - 3;
      }
      if (canvasObject.type === "lower") {
        if (canvasObject.cabinettype === "appliance") {
          if (canvasObject.name === "Refrigerator") {
            canvasObjectT.objectname = "REF" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "Dishwasher") {
            canvasObjectT.objectname = "DISHW" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "Range") {
            canvasObjectT.objectname = "RANGE" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "HOOD") {
            canvasObjectT.objectname = "HOOD" + Math.round(canvasObject.width);

          }
          //appliance
          canvasappliancesObject.push(canvasObjectT);
        } else if (canvasObject.cabinettype === "door") {
          canvasObjectT.y = cabinetPositionY - scaleY * canvasObject.height;
          canvasdoorsbject.push(canvasObjectT);
        } else {
          canvascabinetObject.push(canvasObjectT);
        }
      } else if (canvasObject.type === "upper") {
        if (canvasObject.cabinettype === "window") {
          let spaceH = ceilingHeight - 34.5;
          if (spaceH - canvasObject.height <= 0) {
            canvasObjectT.y = ceilingHeightY + 10 * scaleY;
          } else {
            canvasObjectT.y = cabinetPositionY - scaleY * 34.5 - scaleY * (spaceH - canvasObject.height) / 2 - scaleY * canvasObject.height;
          }
          canvaswindowsObject.push(canvasObjectT);
        } else if (canvasObject.cabinettype === "appliance") {
          if (canvasObject.name === "HOOD") {
            canvasObjectT.objectname = "HOOD" + Math.round(canvasObject.width);
          }
          const matchingObjects = canvasobjectList.filter(obj =>
            obj !== canvasObject &&
            obj.startposition === canvasObject.startposition &&
            obj.type === "upper" &&
            obj.cabinettype !== "SP"
          );
          if (matchingObjects.length > 0) {
            if (matchingObjects.length === 1) {
              canvasObjectT.y = ceilingHeightY + scaleY * matchingObjects[0].height;
            } else if (matchingObjects.length === 2) {
              canvasObjectT.y = ceilingHeightY + scaleY * matchingObjects[0].height + scaleY * matchingObjects[1].height;
            }
          } else {
            canvasObjectT.y = ceilingHeightY;
          }
          canvasappliancesObject.push(canvasObjectT);
        } else {
          if (ceilingHeight >= 105) {
            if (canvasObject.cabinettype == "WBR") {
              canvasObjectT.y = ceilingHeightY;
            } else if (canvasObject.cabinettype == "HOODWBR1") {
              canvasObjectT.y = ceilingHeightY;
            } else if (canvasObject.cabinettype == "HOODWBR") {
              canvasObjectT.y = ceilingHeightY + scaleY * 15;;
            } else {
              if (canvasObject.height === 15) {
                canvasObjectT.y = ceilingHeightY;
              } else {
                canvasObjectT.y = ceilingHeightY + scaleY * 15;;
              }
            }

          } else {
            canvasObjectT.y = ceilingHeightY;
          }

          canvascabinetObject.push(canvasObjectT);
        }
      } else if (canvasObject.type === "high") {
        // const constr = kitchenInfo.;
        // if (ceilingHeight >= 105) {
        //   canvasObjectT.y  = cabinetPositionY - scaleY*105;
        // } 
        // if (ceilingHeight >= 93) {
        //   canvasObjectT.y  = cabinetPositionY - scaleY*93;
        // } else  {
        //   canvasObjectT.y = ceilingHeightY;
        // }
        if (canvasObjectT.height > 105) {
          canvasObjectT.y = cabinetPositionY - scaleY * canvasObject.height;
        } else {
          canvasObjectT.y = ceilingHeightY;
        }
        
        canvascabinetObject.push(canvasObjectT);
      } else if (canvasObject.type === "islandiner") {
        if (canvasObject.cabinettype === "appliance") {
          if (canvasObject.name === "Refrigerator") {
            canvasObjectT.objectname = "REF" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "Dishwasher") {
            canvasObjectT.objectname = "DISHW" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "Range") {
            canvasObjectT.objectname = "RANGE" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "HOOD") {
            canvasObjectT.objectname = "HOOD" + Math.round(canvasObject.width);

          }
          //appliance
          canvasappliancesObject.push(canvasObjectT);
        } else {
          canvascabinetObject.push(canvasObjectT);
        }
      } else if (canvasObject.type === "islandouter") {
        if (canvasObject.cabinettype === "appliance") {
          if (canvasObject.name === "Refrigerator") {
            canvasObjectT.objectname = "REF" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "Dishwasher") {
            canvasObjectT.objectname = "DISHW" + Math.round(canvasObject.width);
          } else if (canvasObject.name === "Range") {
            canvasObjectT.objectname = "RANGE" + Math.round(canvasObject.width);
          } else {

          }
          //appliance
          canvasappliancesObject.push(canvasObjectT);
        } else {
          canvascabinetObject.push(canvasObjectT);
        }
      } else {
        canvascabinetObject.push(canvasObjectT);
      }
      if (canvasObject.id > cabinetIdMax) {
        setCabinetIdMax(canvasObject.id);
      }
    });
    drawElevationAppliance(fabricCanvas, canvasappliancesObject);
    drawElevationCabinetset(fabricCanvas, canvascabinetObject);
    drawElevationWindow(fabricCanvas, canvaswindowsObject);
    drawElevationDoor(fabricCanvas, canvasdoorsbject);
    drawElevationWall(fabricCanvas, canvaswallsObject[0]);
    //重新渲染整个canvas
    fabricCanvas.renderAll();

  };
  async function initializeCanvas(fabricCanvas) {
    try {
      await loadShapes(fabricCanvas); // 等待 loadShapes 完成
      saveCanvasState(fabricCanvas); // 在 loadShapes 执行完成后调用 saveCanvasState
    } catch (error) {
      console.error('Error while loading shapes:', error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
    }
  }
  // 当创建或更新 canvas 内容时，保存其状态
  const saveCanvasState = (canvas) => {
    console.log("saveCanvasState: " + pageIndex);
    const canvasData = canvas.toDataURL('image/png'); // 获取当前 canvas 数据
    // 调用保存函数，例如发送到后台
    // 根据当前环境创建基础 URL
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost'
      : `http://${window.location.hostname}`;

    fetch(`${baseURL}/api/save-canvas-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvasData: canvasData, pageIndex: pageIndex, path: "output/" + kitchenId }),
    }).catch((error) => {
      console.error('Failed to save canvas state:', error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
    });
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    console.log('useEffect!!!!!!!:');

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: 1300,
      height: 1300,
      selectionBorderColor: '#808080', // 灰色的hex值
      selectionColor: 'rgba(128, 128, 128, 0.3)', // 可选：设置带有透明度的灰色选择区域颜色
      enableRetinaScaling: true, // Retina 显示优化
      selection: true,
    });
    fabricRef.current = fabricCanvas;

    setCanvas(fabricCanvas);
    initializeCanvas(fabricCanvas);
    // 鼠标移动时检查是否在图形上
    const handleMouseMove = (opt) => {
      const target = fabricCanvas.findTarget(opt.e, false);

      if (target && target.objectname != undefined && target.width != undefined) {
        let widthTemp = target.widthcabinet + "''";

        setTooltip({
          visible: true,
          // x: rect.left  ,
          // y: rect.top ,
          x: opt.e.offsetX,
          y: opt.e.offsetY,
          content: `Name: ${target.objectname}\n Width: ${widthTemp}`,
        });

      } else {
        setTooltip((prev) => ({ ...prev, visible: false }));
      }
    };
    fabricCanvas.on("mouse:move", handleMouseMove);
    //清理事件
    return () => {
      // fabricCanvas.dispose();
      setCanvas(null);
      // 组件卸载时清理实例
      if (fabricCanvas) {
        fabricCanvas.off("mouse:move", handleMouseMove); // 卸载时清理监听
        fabricCanvas.dispose();
        console.log("Fabric canvas disposed.");
      }
    };
  }, [canvasobjectList]);



  return (

    <div style={{ width: '1300px', height: '1300px', position: 'relative', cursor: 'context-menu' }}
    >
      <div className="canvas-container">
        <canvas ref={canvasRef} id="canvas" />
      </div>
      <Tooltip {...tooltip} />
    </div>

  );
};


export default ElevationView;
