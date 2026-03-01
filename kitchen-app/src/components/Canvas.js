// src/components/Canvas.js
import React, { useEffect, useRef, useCallback, memo } from 'react';
import fabric from '../utils/fabricConfig';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './MyCanvasComponent.css';

import { drawWall, } from './drawWall';
import DrawApplianceSet from './DrawApplianceSet';
import { drawCabinetset, } from './drawCabinets';
import { drawRuler } from './drawRuler';
import { drawIsland } from './drawIsland';
import { drawWindow } from './drawWindow';
import { drawDoor } from './drawDoor';
import store, { updateCabinet, selectCabinetObject, selectKitchenId, selectKitchenShapeType, selectConstruction1 } from './../store';
import { useCanvas, } from './../CanvasContext';
import { useDispatch, useSelector } from 'react-redux';
import cloneDeep from 'lodash/cloneDeep';
import { useSnackbar } from "../components/GlobalSnackbar";
import { MessageInfo } from './../common/MessageInfo';
import { useContextMenu } from "../hooks/useContextMenu";
import Tooltip from "./Tooltip";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import { TextField, Button, Box, Typography, InputAdornment, Grid } from '@mui/material';
import { saveHistory, undoHistory, redoHistory, initHistory } from '../management/historyManager';

const Canvas = memo(({ trigger, setTrigger }) => {
  const { createCanvas, getCanvas, cleanupCanvas, saveSubmitData } = useCanvas();
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);  // 用于存储 fabric.Canvas 实例
  const [cabinetCanvasInfo, setCabinetCanvasInfo] = React.useState([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const dispatch = useDispatch();
  const cabinetObject = useSelector(selectCabinetObject);
  const kitchenId = useSelector(selectKitchenId);
  const kitchenShapeType = useSelector(selectKitchenShapeType);
  const cabConstruction = useSelector(selectConstruction1);
  const isSnappedRef = useRef(false); // 改为 useRef
  const isDraggingRef = useRef(false); // 改为 useRef
  const showSnackbar = useSnackbar();
  const saveCanvasStateRef = useRef(null);
  const handleObjectModifiedRef = useRef(null);
  const [tooltip, setTooltip] = React.useState({
    visible: false,
    x: 0,
    y: 0,
    content: "",
  });
  const [fillerGroup, setFillerGroup] = React.useState(null);
  const [spPnwGroup, setSpPnwGroup] = React.useState(null);
  const [newWidth, setNewWidth] = React.useState("");
  const [spHeight, setSpHeight] = React.useState("");
  const [spDepth, setSpDepth] = React.useState("");
  // 组件顶部添加状态
  const [errorMessage, setErrorMessage] = React.useState('');
  const [spErrorMessage, setSpErrorMessage] = React.useState('');
  const initialLoadDoneRef = useRef(false);

  const handleContextMenuRef = useRef(null);
  // 在组件顶部定义
  const cabinetCanvasInfoRef = useRef(cabinetCanvasInfo);
  // const handleContextMenuRef = useRef(handleContextMenu);



  // 当创建或更新 canvas 内容时，保存其状态
  const saveCanvasState = useCallback((canvas) => {
    // Add safety check before accessing canvas methods
    if (!canvas || !canvas.getContext || typeof canvas.getContext !== 'function') { // 更好的检查
      console.warn('Canvas context is null or invalid, skipping saveCanvasState operation');
      return;
    }
    const canvasData = canvas.toDataURL('image/png'); // 获取当前 canvas 数据
    // 获取 canvas 上的所有对象数据
    // const canvasData = canvas.toJSON();
    //console.log(canvasData);
    // 根据当前环境创建基础 URL
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost'
      : `http://${window.location.hostname}`;

    // 调用保存函数，例如发送到后台
    fetch(`${baseURL}/api/save-canvas-data`, { // <-- 修正这里的反引号
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvasData: canvasData, pageIndex: "1", path: "output/" + kitchenId }),
    }).catch(
      (error) => {
        console.error('Failed to save canvas state:', error);
        showSnackbar(MessageInfo.backCommunicateError, "error");
      });
  }, [showSnackbar, kitchenId]); // 添加 showSnackbar 作为依赖

  useEffect(() => {
    console.log('saveCanvasState useEffect triggered');
    saveCanvasStateRef.current = saveCanvasState;
  }, [saveCanvasState]); // 当 saveCanvasState 变化时更新 ref

  const snapToNearbyObjects = useCallback((movingObject) => {
    let canvas = getCanvas('canvas1');
    if (!canvas || !canvas.getContext) return;

    const zoom = canvas.getZoom?.() || 1;
    const SNAP_THRESHOLD = Math.max(1 / zoom, 2); // 阈值
    const DETACH_THRESHOLD = Math.max(1 / zoom, 2);

    if (isDraggingRef.current) {
      isSnappedRef.current = false;
      return;
    }

    const objects = canvas.getObjects().filter(obj => obj instanceof fabric.Group);

    let snapX = null;
    let snapY = null;
    let snapXWall = null;
    let snapYWall = null;
    let targetType = null;
    let cabinettype = null;
    let cabinetRotation = null;
    const movingBounds = movingObject.getBoundingRect(true);
    cabinetRotation = movingObject.rotation;
    for (let i = 0; i < objects.length; i++) {
      const obj = objects[i];
      if (obj === movingObject) continue;

      const targetBounds = obj.getBoundingRect(true);
      targetType = obj.objectType;
      let targetCabinettype = obj.cabinettype;
      let targetRotation = obj.rotation;
      let targetX = targetBounds.left;
      let targetY = targetBounds.top;
      let targetWidth = targetBounds.width;
      let targetHeight = targetBounds.height;
      cabinettype = movingObject.cabinettype;

      if (targetCabinettype === "BLS" || targetCabinettype === "SBD") {
        if (targetRotation === 0) {
          if (cabinetRotation != targetRotation) {
            targetX = targetBounds.left + targetBounds.width - obj.depth;
          } else {
            targetY = targetBounds.top + targetBounds.height - obj.depth;
          }
        } else if (targetRotation === 90) {
          if (cabinetRotation != targetRotation) {
            targetY = targetBounds.top + targetBounds.height - obj.depth;
          }
        } else if (targetRotation === 180) {
          if (cabinetRotation != targetRotation) {
            targetWidth = obj.depth;
          }
        } else if (targetRotation === 270) {
          if (cabinetRotation != targetRotation) {
            targetHeight = obj.depth;
          } else {
            targetX = targetBounds.left + targetBounds.width - obj.depth;
          }
        }
      }
      // 270
      if (Math.abs(movingBounds.left - targetX) <= SNAP_THRESHOLD &&
        Math.abs(movingBounds.top - targetBounds.top) <= SNAP_THRESHOLD) {
        snapX = targetX;
        snapY = targetBounds.top;
      }
      if ((snapX !== null && snapY !== null) || (snapX !== null && snapYWall !== null ) || (snapXWall !== null && snapY !== null)) break;
      if (Math.abs(movingBounds.left - targetX) <= SNAP_THRESHOLD) {
        snapX = targetX;
        if (Math.abs(movingBounds.top + movingBounds.height - targetY) <= SNAP_THRESHOLD) {
          // moving 的底边 ≈ target 的顶边
          snapY = targetY - movingBounds.height;
        } else if (Math.abs(movingBounds.top - (targetY + targetHeight)) <= SNAP_THRESHOLD) {
          // moving 的顶边 ≈ target 的底边
          snapY = targetY + targetHeight;
        } else {
          snapY = null;
        }
      } else {
        // --- 水平贴合逻辑 ---
        if (Math.abs(movingBounds.left + movingBounds.width - targetX) <= SNAP_THRESHOLD) {
          // moving 的右边 ≈ target 的左边
          snapX = targetX - movingBounds.width;
        } else if (Math.abs(movingBounds.left - (targetX + targetWidth)) <= SNAP_THRESHOLD) {
          // moving 的左边 ≈ target 的右边
          snapX = targetX + targetWidth;
        } else {
          snapX = null;
        }
      }
      if ((snapX !== null && snapY !== null) || (snapX !== null && snapYWall !== null ) || (snapXWall !== null && snapY !== null)) break;

      if (Math.abs(movingBounds.top - targetY) <= SNAP_THRESHOLD) {
        snapY = targetY;
        // --- 水平贴合逻辑 ---
        if (Math.abs(movingBounds.left + movingBounds.width - targetX) <= SNAP_THRESHOLD) {
          // moving 的右边 ≈ target 的左边
          snapX = targetX - movingBounds.width;
        } else if (Math.abs(movingBounds.left - (targetX + targetWidth)) <= SNAP_THRESHOLD) {
          // moving 的左边 ≈ target 的右边
          snapX = targetX + targetWidth;
        } else {
          snapX = null;
        }
      } else {
        if (Math.abs(movingBounds.top + movingBounds.height - targetY) <= SNAP_THRESHOLD) {
          // moving 的底边 ≈ target 的顶边
          snapY = targetY - movingBounds.height;
        } else if (Math.abs(movingBounds.top - (targetY + targetHeight)) <= SNAP_THRESHOLD) {
          // moving 的顶边 ≈ target 的底边
          snapY = targetY + targetHeight;
        } else {
          snapY = null;
        }
      }
      // --- 垂直贴合逻辑 ---


      // ✅ 一旦找到满足条件的贴合对象，就直接贴合（不再继续计算更近的）
      if ((snapX !== null && snapY !== null) || (snapX !== null && snapYWall !== null ) || (snapXWall !== null && snapY !== null)) break;
      // wall
      if (Math.abs(targetType === "wall")) {

        if (Math.abs(movingBounds.left + movingBounds.width - targetX) <= SNAP_THRESHOLD) {
          // moving 的右边 ≈ target 的左边
          snapXWall = targetX - movingBounds.width;
        } else if (Math.abs(movingBounds.left - (targetX + targetWidth)) <= SNAP_THRESHOLD) {
          // moving 的左边 ≈ target 的右边
          snapXWall = targetX + targetWidth;
        } else
          if (Math.abs(movingBounds.top + movingBounds.height - targetY) <= SNAP_THRESHOLD) {
            // moving 的底边 ≈ target 的顶边
            snapYWall = targetY - movingBounds.height;
          } else if (Math.abs(movingBounds.top - (targetY + targetHeight)) <= SNAP_THRESHOLD) {
            // moving 的顶边 ≈ target 的底边
            snapYWall = targetY + targetHeight;
          } else
            if (cabinettype === "BLS" || cabinettype === "SBD" ||
              cabinettype === "BBC" || cabinettype === "BBCL" || cabinettype === "BBCR") {
              if (snapXWall !== null && snapYWall !== null) break;
            }


      }
    }
    if (snapXWall !== null) {
      movingObject.left = snapXWall;
    }
    if (snapYWall !== null) {
      movingObject.top = snapYWall;
    }
    // --- 应用贴合 ---
    if (snapX !== null) {
      movingObject.left = snapX;
    }
    if (snapY !== null) {
      movingObject.top = snapY;
    }


    if (snapX !== null || snapY !== null || snapXWall !== null || snapYWall !== null) {
      requestAnimationFrame(() => {
        movingObject.setCoords();
        canvas.renderAll();
      });
      movingObject.isSnapped = true;
    } else {
      movingObject.isSnapped = false;
    }

    // --- 解除贴合 ---
    const deltaX = Math.abs(movingObject.left - (movingObject._initialLeft ?? movingObject.left));
    const deltaY = Math.abs(movingObject.top - (movingObject._initialTop ?? movingObject.top));
    if (deltaX > DETACH_THRESHOLD || deltaY > DETACH_THRESHOLD) {
      movingObject.isSnapped = false;
    }

  }, [getCanvas]);

  const handleObjectModified = useCallback((event) => {
    console.log('Object modified:', event.target);
    // event.target.flag = 'moveFlag'; // 显式设置为移动标志，避免被当作新添加
    snapToNearbyObjects(event.target);
    // 更新 Redux 状态
    const currentCabinetObject = selectCabinetObject(store.getState());
    saveSubmitData(currentCabinetObject, kitchenId, "canvas1", kitchenShapeType, cabConstruction);

    // Save history for Undo
    saveHistory(getCanvas('canvas1'), currentCabinetObject);

    setTrigger(prev => !prev);
  }, [snapToNearbyObjects, saveSubmitData, kitchenId, kitchenShapeType, cabConstruction, getCanvas]);

  useEffect(() => {
    console.log('handleObjectModified useEffect triggered');
    handleObjectModifiedRef.current = handleObjectModified;
  }, [handleObjectModified]); // 当 handleObjectModified 变化时更新 ref
  // 清理事件
  const getSubmitData = useCallback((cabinetObjecttmp) => {
    try {
      saveSubmitData(cabinetObjecttmp, kitchenId, "canvas1", kitchenShapeType, cabConstruction);
    } catch (error) {
      console.log(error);
      // showSnackbar(MessageInfo.cornerCheckError, "error");
    }
  }, [kitchenId, dispatch]);


  // --- 1. 数据处理函数：从 Redux 数据中提取并设置本地状态 ---
  // 使用 useCallback 确保这个函数在依赖项不变时不会重新创建，
  // 避免不必要的 useEffect 触发。
  const loadShapes = useCallback((canvas, cabinetObject) => {
    console.log('loadShapes triggered with cabinetObjectCanvas:', cabinetObject.canvasObjectList);
    let fetchedCanvasobjectList = cabinetObject.canvasObjectList;
    const canvaswallsObject = [];
    const canvaislandsObject = [];
    const canvascabinetObject = [];
    const canvaswindowsObject = [];
    const canvasdoorsbject = [];
    const canvasappliancesObject = [];
    // *** 关键修改：使用局部变量来跟踪最大 ID ***
    let currentMaxCabinetId = 0; // 初始化局部变量
    // 检查 cabinetObjectCanvas 是否有效，避免空或非数组报错
    if (fetchedCanvasobjectList && Array.isArray(fetchedCanvasobjectList)) {
      fetchedCanvasobjectList.forEach((canvasObject) => {
        let canvasObjectCopy = { ...canvasObject }; // 创建对象的副本

        if (canvasObjectCopy.cabinettype === "WBCLD" || canvasObjectCopy.cabinettype === "WBCRD" || canvasObjectCopy.cabinettype === "WBCD") {
          canvasObjectCopy.widthcabinet = canvasObjectCopy.widthcabinet - 12;
        } else if (canvasObjectCopy.cabinettype === "BBCD" || canvasObjectCopy.cabinettype === "BBCLD" || canvasObjectCopy.cabinettype === "BBCRD") {
          canvasObjectCopy.widthcabinet = canvasObjectCopy.widthcabinet - 24;
        } else if (canvasObjectCopy.cabinettype === "WBC" || canvasObjectCopy.cabinettype === "WBCL" || canvasObjectCopy.cabinettype === "WBCR") {
          canvasObjectCopy.widthcabinet = canvasObjectCopy.widthcabinet - 3;
        } else if (canvasObjectCopy.cabinettype === "BBC" || canvasObjectCopy.cabinettype === "BBCL" || canvasObjectCopy.cabinettype === "BBCR") {
          canvasObjectCopy.widthcabinet = canvasObjectCopy.widthcabinet - 3;
        }
        if (canvasObject.objectType === "wall") {
          canvaswallsObject.push(canvasObject);
        } else if (canvasObject.objectType === "island" || canvasObject.objectType === "peninsula") {
          canvaislandsObject.push(canvasObject);
        } else if (canvasObject.objectType === "lower" ||
          canvasObject.objectType === "high" || canvasObject.objectType === "islandiner") {
          if (canvasObject.cabinettype === "Range" || canvasObject.cabinettype === "Dishwasher" || canvasObject.cabinettype === "Refrigerator"
            || canvasObject.cabinettype === "Hood"
          ) {
            canvasappliancesObject.push(canvasObject);
          } else {
            canvascabinetObject.push(canvasObjectCopy);
          }
          // *** 关键修改：更新局部变量，而不是 state ***
          if (canvasObject.id > currentMaxCabinetId) {
            currentMaxCabinetId = canvasObject.id;
          }
        } else if (canvasObject.objectType === "islandouter") {
          // 创建对象的副本，而不是直接修改原对象
          let objectToAdd = { ...canvasObjectCopy };
          if (objectToAdd.rotation === 180) {
            objectToAdd.rotation = 0;
          }
          canvascabinetObject.push(objectToAdd);
          // *** 关键修改：更新局部变量，而不是 state ***
          if (canvasObject.id > currentMaxCabinetId) {
            currentMaxCabinetId = canvasObject.id;
          }
        } else if (canvasObject.objectType === "window") {
          canvaswindowsObject.push(canvasObject);
        } else if (canvasObject.objectType === "door") {
          canvasdoorsbject.push(canvasObject);
        }

      });
    } else {
      console.warn("fetchedCanvasobjectList 不是数组或为空/未定义:", fetchedCanvasobjectList);
    }

    try {
      console.log("清空画布");
      canvas.clear(); // 每次重绘前清空画布，避免旧图形残留或重叠
      canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas)); // 建议加上这行，防止背景变透明

      console.log("开始执行绘制");
      // 调用各个绘制函数，并添加数据存在的检查
      if (canvaswallsObject.length > 0) {
        drawWall(canvas, canvaswallsObject, kitchenShapeType);
      }
      if (canvaislandsObject.length > 0 && canvaislandsObject[0]) { // 确保 island 数组不为空且第一个元素存在
        drawIsland(canvas, canvaislandsObject[0]);
      }
      if (canvasappliancesObject.length > 0) {
        DrawApplianceSet(canvas, canvasappliancesObject, 1, dispatch, cabinetObject);
      }
      if (canvascabinetObject.length > 0) {
        drawCabinetset(canvas, canvascabinetObject, 'init', dispatch, cabinetObject);

      }
      if (canvaswindowsObject.length > 0) {
        drawWindow(canvas, canvaswindowsObject);
      }
      if (canvasdoorsbject.length > 0) {
        drawDoor(canvas, canvasdoorsbject);
      }
      if (canvascabinetObject.length > 0 || canvasappliancesObject.length > 0) {
        const rulerObject = canvascabinetObject.concat(canvasappliancesObject);

        const groupedByWallId = Object.values(
          rulerObject.reduce((groups, item) => {
            const key = item.wallid;  // 按 wallid 分组
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
            return groups;
          }, {})
        );
        let wallIslandObject = canvaswallsObject.concat(canvaislandsObject);
        drawRuler(canvas, groupedByWallId, kitchenShapeType, wallIslandObject);
      }

      console.log("开始渲染画布");
      canvas.renderAll();
      console.log("Canvas 上的对象数量:", canvas.getObjects().length); // 调试：检查实际绘制了多少对象

      // **通过 ref 调用 saveCanvasState**
      if (saveCanvasStateRef.current) {
        console.log("保存画布状态 (通过 Ref)");
        saveCanvasStateRef.current(canvas);
      } else {
        console.warn("saveCanvasStateRef 在绘制 effect 期间未准备好。");
      }
      // **通过 ref 绑定和解绑事件监听器**
      canvas.off('object:modified', handleObjectModifiedRef.current);
      canvas.on('object:modified', handleObjectModifiedRef.current);

    } catch (error) {
      console.error("绘制过程中发生错误:", error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
    }

  }, [showSnackbar]); // 依赖项，如果 kitchenInfo 也是外部传入，也要加上


  const deleteSelectedObject = useCallback(() => {
    let canvas = getCanvas('canvas1'); // 获取 canvas 实例
    if (!canvas || !canvas.getActiveObject()) return; // 如果canvas不存在或没有活动对象，则不执行删除
    const activeObject = canvas.getActiveObject();
    const cabinetObject = selectCabinetObject(store.getState()); // 直接从 Redux store 获取
    console.log('deleteSelectedObject triggered with cabinetObject:', cabinetObject);

    // ✅ 删除前先保存当前状态
    saveHistory(canvas, cabinetObject);

    let relatedId = null;
    let relatedId2 = null;
    // 从canvas中移除对象
    canvas.remove(activeObject);
    canvas.renderAll();

    let cabinetObjectCanvasDel = cabinetObject.canvasObjectList;
    let updatedCabinetDel = cabinetObject.cabinetObjectList;
    let updatedCanvasObjectstmp = [];
    let updatedCabinets = [];
    // ✅ 使用 Ref 获取最新的本地数据，不作为依赖项
    const currentCabinetCanvasInfo = cabinetCanvasInfoRef.current;

    if (activeObject.objectType === 'appliance') {

    } else if (activeObject.objectType === 'lower' || activeObject.objectType === 'upper' || activeObject.objectType === 'high' ||
      activeObject.objectType === 'islandiner' || activeObject.objectType === 'islandouter') {
      const matchingCabinets = cabinetObject.canvasObjectList.filter(cabinet => cabinet.id === activeObject.id);
      if (matchingCabinets.length > 0) {
        relatedId = matchingCabinets[0].relatedId;
        relatedId2 = matchingCabinets[0].relatedId2;
        // 更新appliances状态，移除对应项
        if (activeObject.cabinettype === 'BLS' || activeObject.cabinettype === 'BBC' || activeObject.cabinettype === 'SBD') {
          // 得到最新柜子canvas列表
          updatedCanvasObjectstmp = cabinetObjectCanvasDel.filter(cabinet => cabinet.id !== activeObject.id || cabinet.cabinettype !== activeObject.cabinettype);
          //  得到最新柜子cabinet列表
          updatedCabinets = currentCabinetCanvasInfo.filter(cabinet => cabinet.id !== activeObject.id || cabinet.cabinettype !== activeObject.cabinettype);
          // updatedCanvasObjects = cabinetObjectCanvas.filter(cabinet => cabinet.id !== activeObject.id && cabinet.cabinettype !== activeObject.cabinettype);
        } else {
          updatedCabinets = currentCabinetCanvasInfo.filter(cabinet => cabinet.id !== activeObject.id);
          updatedCanvasObjectstmp = cabinetObjectCanvasDel.filter(cabinet => cabinet.id !== activeObject.id);

        }

      }
    }
    let updatedCabinettmp = [];
    if (relatedId) {
      updatedCabinettmp = updatedCabinetDel.filter(cabinet => cabinet.id !== relatedId);
      if (relatedId2) {
        updatedCabinettmp = updatedCabinettmp.filter(cabinet => cabinet.id !== relatedId2);
        updatedCabinets = updatedCabinets.filter(cabinet => cabinet.relatedId !== relatedId2)
      }
    }
    setCabinetCanvasInfo(updatedCabinets);
    let updatedCabinetFlag = {};
    if (updatedCanvasObjectstmp.length > 0 && updatedCabinettmp.length > 0) {
      updatedCabinetFlag = {
        ...cloneDeep(cabinetObject),
        updateFlag: 1,
        canvasId: 1,
        canvasObjectList: updatedCanvasObjectstmp,
        cabinetObjectList: updatedCabinettmp
      };
      dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
    } else if (updatedCabinettmp.length > 0) {
      updatedCabinetFlag = {
        ...cloneDeep(cabinetObject),
        updateFlag: 1,
        canvasId: 1,
        cabinetObjectList: updatedCabinettmp
      };
      dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
    } else if (updatedCanvasObjectstmp.length > 0) {
      updatedCabinetFlag = {
        ...cloneDeep(cabinetObject),
        updateFlag: 1,
        canvasId: 1,
        canvasObjectList: updatedCanvasObjectstmp
      };
      dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态

    }
    getSubmitData(updatedCabinetFlag); // 在删除后立即调用
  }, [dispatch, getSubmitData]); //

  const handleKeyDown = useCallback((event) => {
    // 过滤输入框内的按键，防止在输入数字时触发删除
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelectedObject();
    }

    let canvas = getCanvas('canvas1');
    if (!canvas) return;

    // Undo (Ctrl+Z or Cmd+Z)
    if ((event.ctrlKey || event.metaKey) && (event.key === "z" || event.key === "Z")) {
      event.preventDefault();
      undoHistory(canvas, dispatch, updateCabinet);
      return;
    }

    // Redo (Ctrl+Y or Cmd+Y)
    if ((event.ctrlKey || event.metaKey) && (event.key === "y" || event.key === "Y")) {
      event.preventDefault();
      console.log("Redo triggered!");
      redoHistory(canvas, dispatch, updateCabinet);
      return;
    }
  }, [deleteSelectedObject, getCanvas, dispatch]); // 依赖项

  // ✅ 专门处理键盘事件的 useEffect
  useEffect(() => {
    console.log("Binding Keydown Event...");
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      console.log("Unbinding Keydown Event...");
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 2. 独立的 handleMouseMove (使用 useCallback)
  const handleMouseMove = useCallback((opt) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const target = canvas.findTarget(opt.e, false);
    if (target && target.objectname != undefined && target.width != undefined) {
      let widthTemp = target.widthcabinet + "''";
      setTooltip({
        visible: true,
        x: opt.e.offsetX,
        y: opt.e.offsetY,
        content: `Name: ${target.objectname}\n Width: ${widthTemp}`,
      });
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  }, []);


  // 3. 独立的 handlePointerDown (使用 useCallback)
  const handlePointerDown = useCallback((event) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 只有右键才需要我们干预
    if (event.button === 2) {
      const target = canvas.findTarget(event, false) || canvas.getActiveObject();
      if (target.flag != "addFlag"  ) {
        if (target && (target.type === "group" || target.group) && target.cabinettype === "FILLER") {
          // 右键点击 FILLER
          const group = target.type === "group" ? target : target.group;
          setFillerGroup(group);
          setNewWidth((group.widthcabinet).toFixed(1));

          event.preventDefault();
          event.stopPropagation();
        } else if (target && (target.type === "group" || target.group) && (target.cabinettype === "SP" || 
          target.cabinettype === "PNB" || target.cabinettype === "PNI" || target.cabinettype === "RRP" )) {
          // 右键点击 SP/PNW
          const group = target.type === "group" ? target : target.group;
          setSpPnwGroup(group);
          setSpHeight((group.heightcabinet || 0).toFixed(1));
          setSpDepth((group.depthcabinet || 0).toFixed(1));

          event.preventDefault();
          event.stopPropagation();
        } else {
          // 普通右键菜单 -> 调用 Ref 中的最新函数
          if (handleContextMenuRef.current) {
            handleContextMenuRef.current(event);
          }
          event.preventDefault();
          event.stopPropagation();
        }
      }
      else {
        // 普通右键菜单 -> 调用 Ref 中的最新函数
        if (handleContextMenuRef.current) {
          handleContextMenuRef.current(event);
        }
        event.preventDefault();
        event.stopPropagation();
      }
    }
    // ⚠️ 已删除左键逻辑，交给 Fabric 原生处理
  }, []);

  const preventDefaultContextMenu = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 4. 专门用于绑定交互事件的 useEffect (只在初始化时运行一次)
  useEffect(() => {
    if (!isInitialized || !fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    const upperCanvas = canvas.upperCanvasEl;

    console.log("Binding Mouse/Pointer Events...");

    // 绑定 Fabric 事件
    canvas.on("mouse:move", handleMouseMove);

    // 绑定 DOM 事件 (右键需要原生支持)
    upperCanvas.addEventListener("pointerdown", handlePointerDown);
    upperCanvas.addEventListener("contextmenu", preventDefaultContextMenu);
    window.addEventListener("contextmenu", preventDefaultContextMenu, true);

    return () => {
      console.log("Unbinding Mouse/Pointer Events...");
      canvas.off("mouse:move", handleMouseMove);

      upperCanvas.removeEventListener("pointerdown", handlePointerDown);
      upperCanvas.removeEventListener("contextmenu", preventDefaultContextMenu);
      window.removeEventListener("contextmenu", preventDefaultContextMenu, true);
    };
  }, [isInitialized, handleMouseMove, handlePointerDown, preventDefaultContextMenu]); // 依赖项稳定，几乎不会重新运行

  // --- 2. Canvas 实例初始化 Effect ---
  // 这个 useEffect 负责创建 Fabric.js Canvas 实例，且只运行一次（或在 isInitialized 改变时）。  
  useEffect(() => {
    console.log('Canvas component - Canvas initinit useEffect triggered:' + trigger);
    if (!canvasRef.current) {
      console.log('Canvas already initialized or invalid, skipping');
      return;
    }
    if (!isInitialized) {
      // 通过 useCanvas hook 创建 Fabric.js Canvas 实例
      const newFabricCanvas = createCanvas('canvas1', canvasRef);
      if (newFabricCanvas) {
        fabricCanvasRef.current = newFabricCanvas;
        setIsInitialized(true); // 标记 Fabric.js Canvas 实例已创建成功
        console.log('Canvas 初始化成功');
      } else {
        console.error('未能创建 Fabric.js Canvas 实例。');
      }
    }
  }, [createCanvas, cleanupCanvas, trigger]);

  useEffect(() => {
    return () => {
      console.log('组件卸载时进行 Canvas 清理');
      initHistory();
      if (fabricCanvasRef.current) {
        cleanupCanvas(fabricCanvasRef.current, 'canvas1');
      }
    };
  }, []);

  // --- 3. 数据加载 Effect ---
  // 这个 useEffect 在 Fabric.js Canvas 准备好并且 Redux 数据变化时，触发数据处理。

  useEffect(() => {
    console.log('数据加载 useEffect 触发:', {
      isInitialized,
      hasData: cabinetObject.canvasObjectList?.length > 0,
      updateFlag: cabinetObject.updateFlag,
      initialLoadDone: initialLoadDoneRef.current,
      trigger
    });

    const hasData = cabinetObject.canvasObjectList && cabinetObject.canvasObjectList.length > 0;
    const isReadyToDraw = isInitialized && hasData;

    // shouldLoad 逻辑：
    // 1. 已初始化且有数据
    // 2. 满足以下之一：强制刷新(updateFlag===0)、首次加载、或外部 trigger 变化
    const shouldLoad = isReadyToDraw && (
      cabinetObject.updateFlag === 0 ||
      !initialLoadDoneRef.current ||
      trigger
    );

    if (shouldLoad) {
      console.log("执行加载 shapes (Drawing on Canvas)...");
      const currentCabinetObject = selectCabinetObject(store.getState());
      loadShapes(fabricCanvasRef.current, currentCabinetObject);
      initialLoadDoneRef.current = true; // 标记首次加载已完成
    }
  }, [isInitialized, cabinetObject, trigger]); // 依赖项改为updateFlag，而不是canvasObjectList，避免无限循环

  const addDimensions = (wallObjects, cabinetCanvasInfo, canvas) => {
    const datas = wallObjects.concat(cabinetCanvasInfo);
    datas.forEach(item => {
      if (parseFloat(item.rotation) === 0) {
        // 创建一条水平标注线，放在矩形的上方
        const line = new fabric.Line([item.x, item.y - 10, item.x + item.width, item.y - 10], {
          stroke: 'black',
          strokeWidth: 1,
          selectable: false
        });
        // 在矩形上方添加标注线
        canvas.add(line);
        // 创建左端的竖线
        const leftVerticalLine = new fabric.Line([item.x, item.y - 15, item.x, item.y - 5], {
          stroke: 'black',
          strokeWidth: 1,
          selectable: false
        });
        // 创建右端的竖线
        const rightVerticalLine = new fabric.Line([item.x + item.width, item.y - 15, item.x + item.width, item.y - 5], {
          stroke: 'black',
          strokeWidth: 1,
          selectable: false
        });
        // 添加竖线到画布上
        canvas.add(leftVerticalLine);
        canvas.add(rightVerticalLine);
        // 创建一个文本对象，放置在标注线的中间，显示矩形的宽度
        const text = new fabric.Text('宽度: ' + item.width + '\'\'', {
          left: item.x + item.width / 2,  // 文本居中
          top: item.y - 30,  // 将文本放置在线的上方
          fontSize: 16,
          fill: 'black',
          originX: 'center',  // 设置文本居中对齐
          selectable: false
        });
        // 在画布上添加文本
        canvas.add(text);
      } else if (parseFloat(item.rotation) === 90) {

        // 需要判断标注应该写在左边还是右边？？
        // 创建一条垂直标注线，放在矩形的左边
        const line = new fabric.Line([item.x - 30, item.y, item.x - 30, item.y + item.width], {
          stroke: 'black',
          strokeWidth: 1,
          selectable: false
        });
        // 在矩形左边添加标注线
        canvas.add(line);
        // 创建上端的水平线
        const topHorizontalLine = new fabric.Line([item.x - 35, item.y, item.x - 25, item.y], {
          stroke: 'black',
          strokeWidth: 1,
          selectable: false
        });

        // 创建下端的水平线
        const bottomHorizontalLine = new fabric.Line([item.x - 35, item.y + item.width, item.x - 25, item.y + item.width], {
          stroke: 'black',
          strokeWidth: 1,
          selectable: false
        });

        // 添加水平线到画布上
        canvas.add(topHorizontalLine);
        canvas.add(bottomHorizontalLine);

        // 创建竖着的文字 "宽度"
        const word = "宽度:" + item.width + '\'\'';
        const startX = item.x - 50;  // 控制文字的X轴位置（相对于标注线的左侧）
        let startY = item.y + item.width / 2 - 20;  // 控制文字的Y轴起点（垂直居中）
        // 遍历每个字符，并将其作为独立的文本对象
        for (let i = 0; i < word.length; i++) {
          const char = new fabric.Text(word[i], {
            left: startX,
            top: startY + (i * 20),  // 每个字符垂直间隔 20px
            fontSize: 16,
            fill: 'black',
            originX: 'center',
            originY: 'center',
            selectable: false
          });
          // 添加每个字符到画布上
          canvas.add(char);
        }
      }
    })
  };
  const {
    contextMenu,
    handleContextMenu,
    handleCloseMenu,
    handleOption,
    cabinetGroup,
  } = useContextMenu(fabricCanvasRef, cabinetObject.cabinetObjectList, cabinetCanvasInfo, setCabinetCanvasInfo);

  // 监听变化并同步 Ref
  useEffect(() => {
    cabinetCanvasInfoRef.current = cabinetCanvasInfo;
    handleContextMenuRef.current = handleContextMenu;
  }, [cabinetCanvasInfo, handleContextMenu]);


  return (

    <div style={{ width: '100%', height: '100%', position: 'relative', cursor: 'context-menu', border: '0' }}
    >
      {/* onContextMenu={handleContextMenu} */}
      <Menu
        open={contextMenu !== null && (cabinetGroup || []).length > 0}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        {(cabinetGroup || []).length > 0 ? (
          cabinetGroup.map((option, index) => (
            <MenuItem key={index} onClick={() => handleOption(option, "canvas1")}>
              {option.text}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No Objects</MenuItem>
        )}
      </Menu>

      <Box sx={{
        width: '100%',
        height: '100%',
        bgcolor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="canvas-container" style={{
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'white'
        }}>
          <canvas ref={canvasRef} id="canvas1" />
        </div>
      </Box>
      <Tooltip {...tooltip} />
      <Dialog
        open={!!fillerGroup}
        onClose={() => setFillerGroup(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 12,
            padding: '20px 24px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.2rem',
            fontWeight: 600,
            textAlign: 'center',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            mx: -2,
          }}
        >
          Edit FILLER Width
        </DialogTitle>

        <DialogContent
          sx={{
            mt: 2,
            pb: 1,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 0.5,
                fontSize: '0.85rem',
                fontWeight: 500,
                color: 'text.primary',
              }}
            >
              Width
            </Typography>
            <TextField
              type="number"
              value={newWidth}
              onChange={(e) => setNewWidth(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Enter width"
              InputProps={{
                endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>in</InputAdornment>,
              }}
            />
          </Box>
        </DialogContent>
        {/* 添加错误提示区域 */}
        {errorMessage && (
          <Box sx={{
            p: 2,
            bgcolor: 'error.main',
            color: 'white',
            textAlign: 'center',
            borderRadius: 1,
            mx: 2,
            mb: 1
          }}>
            <Typography variant="body2">
              ⚠️ {errorMessage}
            </Typography>
          </Box>
        )}
        <DialogActions sx={{ justifyContent: 'flex-end', pt: 1, pb: 1.5 }}>
          <Button
            onClick={() => setFillerGroup(null)}
            sx={{ fontSize: '0.9rem', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (fillerGroup && !isNaN(newWidth) && newWidth > 0) {
                // check width 
                let nameCab = fillerGroup.objectname;
                let hasError = false;
                let errorMsg = '';
                if (nameCab === "BF6" && newWidth > 6) {
                  hasError = true;
                  errorMsg = 'BF6 cabinet width cannot exceed 6\'\'';
                } else if (nameCab === "BF3" && newWidth > 3) {
                  hasError = true;
                  errorMsg = 'BF3 cabinet width cannot exceed 3\'\'';
                }

                // 如果有错误，显示提示，不执行后续逻辑
                if (hasError) {
                  setErrorMessage(errorMsg);
                  return;
                }
                const cabinetObject = selectCabinetObject(store.getState());
                let canvas = getCanvas('canvas1');
                saveHistory(canvas, cabinetObject);

                // 保存新的逻辑宽度
                fillerGroup.widthcabinet = parseFloat(newWidth);
                let newWidthActual = parseFloat(newWidth) * fillerGroup.scale;;
                let oldLeft = fillerGroup.left;
                let oldTop = fillerGroup.top;
                // 修改 group 内部每个对象的宽度
                if (fillerGroup.rotation === 90 || fillerGroup.rotation === 270) {
                  const oldWidth = fillerGroup.height;
                  const scaleX = newWidthActual / oldWidth; // 计算新的横向缩放比例
                  console.log("旧高度:", oldWidth, "新高度:", newWidthActual, "比例:", scaleX);
                  // 记录原来的位置（左上角）
                  fillerGroup._objects.forEach(obj => {
                    if (obj.type === 'rect') {
                      obj.set({
                        height: newWidthActual,  // 等比例调整 rect 的宽度
                        top: obj.top * scaleX     // 保持位置比例一致
                      });
                    } else {
                      // 如果有其他类型对象，比如 text 或 image，可选地调整位置
                      obj.set({
                        top: obj.top * scaleX
                      });
                    }
                  });
                  console.log("fillerGroup.height", fillerGroup.height);
                  // 更新 group 封装盒
                  // fillerGroup.addWithUpdate();
                  fillerGroup.setCoords();
                  fillerGroup.height = newWidthActual;
                  // fillerGroup.top = newPosition;
                  console.log("fillerGroup.top", fillerGroup.top);
                  if (fillerGroup.rotation === 270) {
                    oldTop = oldTop + (oldWidth - newWidthActual);
                  }
                } else {

                  const oldWidth = fillerGroup.width;
                  const scaleX = newWidthActual / oldWidth; // 计算新的横向缩放比例
                  fillerGroup._objects.forEach(obj => {
                    if (obj.type === 'rect') {
                      obj.set({
                        width: newWidthActual,  // 等比例调整 rect 的宽度
                        left: obj.left * scaleX     // 保持位置比例一致
                      });
                    } else {
                      // 如果有其他类型对象，比如 text 或 image，可选地调整位置
                      obj.set({
                        left: obj.left * scaleX
                      });
                    }
                  });
                  // 更新 group 封装盒
                  // fillerGroup.addWithUpdate(); // ← 核心
                  fillerGroup.setCoords();
                  fillerGroup.width = newWidthActual;
                  if (fillerGroup.rotation === 180) {
                    oldLeft = oldLeft + (oldWidth - newWidthActual);
                  }
                }
                // 更新 group 封装信息
                fillerGroup.set({
                  scaleY: 1,       // 取消缩放，保留实际几何
                  left: oldLeft,   // 恢复原来的 left
                  top: oldTop      // 恢复原来的 top
                });
                console.log("fillerGroup.width", fillerGroup.width);
                console.log("scale", fillerGroup.scale);
                console.log("oldLeft", oldLeft);
                console.log("oldTop", oldTop);
                // 更新坐标并重新渲染
                fillerGroup.setCoords();
                fabricCanvasRef.current.requestRenderAll();

                fillerGroup.flag = "modifyFiller";   // 在对象上打标记


                let canvasObjectStore = cabinetObject.canvasObjectList;
                let cabinetListStore = cabinetObject.cabinetObjectList;
                let newX = fillerGroup.left;
                let newY = fillerGroup.top;
                if (fillerGroup.rotation === 180) {
                  newX = fillerGroup.left + fillerGroup.width;
                }
                if (fillerGroup.rotation === 270) {
                  newY = fillerGroup.top + fillerGroup.height;
                }
                // 更新 Redux 和后端数据
                const matchingCanvas = canvasObjectStore.filter(cabinet => cabinet.id === fillerGroup.id);
                if (matchingCanvas.length > 0) {
                  let relatedId = matchingCanvas[0].relatedId;
                  // 更新 canvasObjectStore
                  canvasObjectStore = canvasObjectStore.map(item =>
                    item.id === fillerGroup.id
                      ? {
                        ...item,
                        x: newX,
                        y: newY,
                        widthcabinet: parseFloat(newWidth),
                        width: newWidthActual,
                        updateFlg: 2,
                      }
                      : item
                  );

                  // 更新 cabinetListStore
                  cabinetListStore = cabinetListStore.map(item =>
                    item.id === relatedId
                      ? {
                        ...item,
                        width: parseFloat(newWidth),
                        updateFlg: 2,
                      }
                      : item
                  );
                }
                const updatedCabinetFlag = {
                  ...cabinetObject,
                  canvasObjectList: canvasObjectStore,
                  cabinetObjectList: cabinetListStore,
                  updateFlag: 1
                };
                dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
                setTrigger(prev => !prev); // 强制子组件重新渲染
              }
              setFillerGroup(null);
            }}
            variant="contained"
            color="primary"
            sx={{ fontSize: '0.9rem', textTransform: 'none' }}
          >
            Confirm
          </Button>

        </DialogActions>
      </Dialog>

      {/* SP/PNW Edit Dialog */}
      <Dialog
        open={!!spPnwGroup}
        onClose={() => setSpPnwGroup(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 12,
            padding: '20px 24px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '1.2rem',
            fontWeight: 600,
            textAlign: 'center',
            pb: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            mx: -2,
          }}
        >
          Edit SP/PNW Dimensions
        </DialogTitle>

        <DialogContent
          sx={{
            mt: 2,
            pb: 1,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  Height
                </Typography>
                <TextField
                  type="number"
                  value={spHeight}
                  onChange={(e) => setSpHeight(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter height"
                  InputProps={{
                    endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>in</InputAdornment>,
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: 'text.primary',
                  }}
                >
                  Depth
                </Typography>
                <TextField
                  type="number"
                  value={spDepth}
                  onChange={(e) => setSpDepth(e.target.value)}
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="Enter depth"
                  InputProps={{
                    endAdornment: <InputAdornment position="end" sx={{ fontSize: '0.75rem' }}>in</InputAdornment>,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        {/* SP/PNW Error Message */}
        {spErrorMessage && (
          <Box sx={{
            p: 2,
            bgcolor: 'error.main',
            color: 'white',
            textAlign: 'center',
            borderRadius: 1,
            mx: 2,
            mb: 1
          }}>
            <Typography variant="body2">
              ⚠️ {spErrorMessage}
            </Typography>
          </Box>
        )}

        <DialogActions sx={{ justifyContent: 'flex-end', pt: 1, pb: 1.5 }}>
          <Button
            onClick={() => setSpPnwGroup(null)}
            sx={{ fontSize: '0.9rem', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (spPnwGroup) {
                let hasError = false;
                let errorMsg = '';
                let nameCab = spPnwGroup.objectname;

                // Height validation
                if (spHeight && (isNaN(spHeight) || spHeight <= 0)) {
                  hasError = true;
                  errorMsg = 'Height must be a positive number';
                } else if (!hasError && spHeight) {
                  if (nameCab === "PNB36" && spHeight > 36) {
                    hasError = true;
                    errorMsg = 'PNB36 cabinet height cannot exceed 36\'\'';
                  } else if (nameCab === "PNB96" && spHeight > 96) {
                    hasError = true;
                    errorMsg = 'PNB96 cabinet height cannot exceed 96\'\'';
                  } else if (nameCab === "PNB108" && spHeight > 108) {
                    hasError = true;
                    errorMsg = 'PNB108 cabinet height cannot exceed 108\'\'';
                  } else if (nameCab === "PNI24" && spHeight > 24) {
                    hasError = true;
                    errorMsg = 'PNI24 cabinet height cannot exceed 24\'\'';
                  } else if (nameCab === "PNI36" && spHeight > 36) {
                    hasError = true;
                    errorMsg = 'PNI36 cabinet height cannot exceed 36\'\'';
                  } else if (nameCab === "PNI48" && spHeight > 48) {
                    hasError = true;
                    errorMsg = 'PNI48 cabinet height cannot exceed 48\'\'';
                  } else if (nameCab === "PNI96" && spHeight > 96) {
                    hasError = true;
                    errorMsg = 'PNI96 cabinet height cannot exceed 96\'\'';
                  } else if (nameCab === "SP2436" && spHeight > 36) {
                    hasError = true;
                    errorMsg = 'SP2436 cabinet height cannot exceed 36\'\'';
                  } else if (nameCab === "SP2796" && spHeight > 96) {
                    hasError = true;
                    errorMsg = 'SP2796 cabinet height cannot exceed 96\'\'';
                  } else if (nameCab === "SP4896" && spHeight > 96) {
                    hasError = true;
                    errorMsg = 'SP4896 cabinet height cannot exceed 96\'\'';
                  } else if (nameCab === "RRP2796" && spHeight > 96) {
                    hasError = true;
                    errorMsg = 'RRP2796 cabinet height cannot exceed 96\'\'';
                  } else if (nameCab === "RRP27108" && spHeight > 108) {
                    hasError = true;
                    errorMsg = 'RRP27108 cabinet height cannot exceed 108\'\'';
                  }
                }

                // Depth validation
                if (!hasError && spDepth && (isNaN(spDepth) || spDepth <= 0)) {
                  hasError = true;
                  errorMsg = 'Depth must be a positive number';
                }

                if (hasError) {
                  setSpErrorMessage(errorMsg);
                  return;
                }

                const cabinetObject = selectCabinetObject(store.getState());
                let canvas = getCanvas('canvas1');
                saveHistory(canvas, cabinetObject);

                // Save height and depth
                if (spHeight && !isNaN(spHeight)) {
                  spPnwGroup.heightcabinet = parseFloat(spHeight);
                }
                if (spDepth && !isNaN(spDepth)) {
                  spPnwGroup.depthcabinet = parseFloat(spDepth);
                }

                // Calculate actual dimensions
                let heightToUse = (spHeight && !isNaN(spHeight)) ? parseFloat(spHeight) : spPnwGroup.heightcabinet;
                let newHeightActual = heightToUse * spPnwGroup.scale;
                let depthToUse = (spDepth && !isNaN(spDepth)) ? parseFloat(spDepth) : spPnwGroup.depthcabinet;
                let newDepthActual = depthToUse * spPnwGroup.scale;

                let oldLeft = spPnwGroup.left;
                let oldTop = spPnwGroup.top;

                // Modify group objects based on rotation
                if (spPnwGroup.rotation === 90 || spPnwGroup.rotation === 270) {
                  const oldDepth = spPnwGroup.width;
                  const scaleDepth = newDepthActual / oldDepth;

                  spPnwGroup._objects.forEach(obj => {
                    if (obj.type === 'rect') {
                      obj.set({
                        width: newDepthActual,
                        left: obj.left * scaleDepth,
                      });
                    } else {
                      obj.set({
                        left: obj.left * scaleDepth,
                      });
                    }
                  });

                  spPnwGroup.setCoords();
                  spPnwGroup.width = newDepthActual;

                  if (spPnwGroup.rotation === 270) {
                    oldLeft = oldLeft + (oldDepth - newDepthActual);
                  }
                } else {
                  const oldHeight = spPnwGroup.height;
                  const scaleHeight = newDepthActual / oldHeight;

                  spPnwGroup._objects.forEach(obj => {
                    if (obj.type === 'rect') {
                      obj.set({
                        height: newDepthActual,
                        top: obj.top * scaleHeight,
                      });
                    } else {
                      obj.set({
                        top: obj.top * scaleHeight,
                      });
                    }
                  });

                  spPnwGroup.setCoords();
                  spPnwGroup.height = newDepthActual;

                  if (spPnwGroup.rotation === 0) {
                    oldTop = oldTop + (oldHeight - newDepthActual);
                  }
                }

                // Update group properties
                spPnwGroup.set({
                  scaleY: 1,
                  left: oldLeft,
                  top: oldTop
                });

                // Update canvas
                spPnwGroup.setCoords();
                fabricCanvasRef.current.requestRenderAll();
                spPnwGroup.flag = "modifySpPnw";

                // Update Redux and backend data
                let canvasObjectStore = cabinetObject.canvasObjectList;
                let cabinetListStore = cabinetObject.cabinetObjectList;
                let newX = spPnwGroup.left;
                let newY = spPnwGroup.top;

                if (spPnwGroup.rotation === 180) {
                  newX = spPnwGroup.left + spPnwGroup.width;
                }
                if (spPnwGroup.rotation === 270) {
                  newY = spPnwGroup.top + spPnwGroup.height;
                }

                const matchingCanvas = canvasObjectStore.filter(cabinet => cabinet.id === spPnwGroup.id);
                if (matchingCanvas.length > 0) {
                  let relatedId = matchingCanvas[0].relatedId;

                  // Update canvasObjectStore
                  canvasObjectStore = canvasObjectStore.map(item => {
                    if (item.id === spPnwGroup.id) {
                      let updateData = {
                        ...item,
                        x: newX,
                        y: newY,
                        height : newHeightActual,
                        depth : newDepthActual,
                        updateFlg: 2,
                      };

                      if (spHeight && !isNaN(spHeight)) {
                        updateData.heightcabinet = parseFloat(spHeight);
                      }
                      if (spDepth && !isNaN(spDepth)) {
                        updateData.depthcabinet = parseFloat(spDepth);
                      }

                      return updateData;
                    }
                    return item;
                  });

                  // Update cabinetListStore
                  cabinetListStore = cabinetListStore.map(item => {
                    if (item.id === relatedId) {
                      let cabinetUpdateData = {
                        ...item,
                        updateFlg: 2,
                      };

                      if (spHeight && !isNaN(spHeight)) {
                        cabinetUpdateData.height = parseFloat(spHeight);
                      }
                      if (spDepth && !isNaN(spDepth)) {
                        cabinetUpdateData.depth = parseFloat(spDepth);
                      }

                      return cabinetUpdateData;
                    }
                    return item;
                  });
                }

                const updatedCabinetFlag = {
                  ...cabinetObject,
                  canvasObjectList: canvasObjectStore,
                  cabinetObjectList: cabinetListStore,
                  updateFlag: 1
                };
                dispatch(updateCabinet(updatedCabinetFlag));
                setTrigger(prev => !prev);
              }
              setSpPnwGroup(null);
            }}
            variant="contained"
            color="primary"
            sx={{ fontSize: '0.9rem', textTransform: 'none' }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

    </div>
  );
});


export default Canvas;
