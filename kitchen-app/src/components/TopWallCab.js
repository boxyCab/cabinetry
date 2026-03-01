// src/components/Canvas.js
import React, { useEffect, useRef, useCallback } from 'react';
import fabric from '../utils/fabricConfig';
import './MyCanvasComponent.css';
import { drawWall } from './drawWall';
import { drawRuler } from './drawRuler';
import DrawApplianceSet from './DrawApplianceSet';
import { drawCabinetset } from './drawCabinets';
import { drawWindow } from './drawWindow';
import { drawDoor } from './drawDoor';
import { useCanvas } from './../CanvasContext';
import { selectKitchenId } from './../store';
import { useSelector } from 'react-redux';
import { useSnackbar } from "../components/GlobalSnackbar";
import { MessageInfo } from './../common/MessageInfo';
import { useContextMenu } from "../hooks/useContextMenu";
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import cloneDeep from 'lodash/cloneDeep';
import store, { updateCabinet, selectCabinetObject, selectKitchenShapeType, selectConstruction1, selectOthers } from './../store';
import { useDispatch, } from 'react-redux';
import Tooltip from "./Tooltip";
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import { TextField, Button, Box, Typography, Grid, InputAdornment } from '@mui/material';
import { saveHistory, undoHistory, redoHistory, initHistory } from '../management/historyManager';

const TopWallCab = ({ canvasobjectListParam, refreshParam, trigger, setTrigger }) => {
  const { createCanvas, getCanvas, cleanupCanvas, saveSubmitData } = useCanvas();
  console.log("TopWallCab render:" + canvasobjectListParam);

  // --- Refs & State ---
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const [cabinetCanvasInfo, setCabinetCanvasInfo] = React.useState([]);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const dispatch = useDispatch();

  // Redux
  const kitchenId = useSelector(selectKitchenId);
  const kitchenShapeType = useSelector(selectKitchenShapeType);
  const cabConstruction = useSelector(selectConstruction1);
  const cabinetObject = useSelector(selectCabinetObject);

  // Mutable Refs (解决闭包问题)
  const isSnappedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const saveCanvasStateRef = useRef(null);
  const handleObjectModifiedRef = useRef(null);
  const initialLoadDoneRef = useRef(false);

  // 同步数据的 Refs
  const cabinetCanvasInfoRef = useRef(cabinetCanvasInfo);
  const handleContextMenuRef = useRef(null); // 初始为 null

  // UI State
  const showSnackbar = useSnackbar();
  const [tooltip, setTooltip] = React.useState({ visible: false, x: 0, y: 0, content: "" });
  const [fillerGroup, setFillerGroup] = React.useState(null);
  const [spPnwGroup, setSpPnwGroup] = React.useState(null);
  const [newWidth, setNewWidth] = React.useState("");
  const [newHeight, setNewHeight] = React.useState("");
  const [newDepth, setNewDepth] = React.useState("");
  const [spHeight, setSpHeight] = React.useState("");
  const [spDepth, setSpDepth] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState('');
  const [spErrorMessage, setSpErrorMessage] = React.useState('');

  const {
    contextMenu,
    handleContextMenu,
    handleCloseMenu,
    handleOption,
    cabinetGroup,
  } = useContextMenu(fabricCanvasRef, cabinetObject.cabinetObjectList, cabinetCanvasInfo, setCabinetCanvasInfo);

  // --- 1. 同步最新数据到 Refs ---
  useEffect(() => {
    cabinetCanvasInfoRef.current = cabinetCanvasInfo;
    handleContextMenuRef.current = handleContextMenu;
  }, [cabinetCanvasInfo, handleContextMenu]);

  // 当创建或更新 canvas 内容时，保存其状态
  const saveCanvasState = useCallback((canvas) => {
    const canvasData = canvas.toDataURL('image/png'); // 获取当前 canvas 数据
    // 根据当前环境创建基础 URL
    const baseURL = window.location.hostname === 'localhost'
      ? 'http://localhost'
      : `http://${window.location.hostname}`;
    // 调用保存函数，例如发送到后台
    fetch(`${baseURL}/api/save-canvas-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ canvasData: canvasData, pageIndex: "2", path: "output/" + kitchenId }),
    }).catch((error) => {
      console.error('Failed to save canvas state:', error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
    });
  }, [showSnackbar, kitchenId]);

  useEffect(() => {
    saveCanvasStateRef.current = saveCanvasState;
  }, [saveCanvasState]); // 当 saveCanvasState 变化时更新 ref

  const snapToNearbyObjects = useCallback((movingObject) => {
    let canvas = getCanvas('canvas2');
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

      if (targetCabinettype === "WLS" || targetCabinettype === "WDC") {
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
            if (cabinettype === "WLS" || cabinettype === "WDC" ||
              cabinettype === "WBC" || cabinettype === "WBCL" || cabinettype === "WBCR") {
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

  // 清理事件
  const getSubmitData = useCallback((cabinetObjecttmp) => {
    try {
      saveSubmitData(cabinetObjecttmp, kitchenId, "canvas2", kitchenShapeType, cabConstruction);
    } catch (error) {
      console.log(error);

    }
  }, [kitchenId, dispatch, kitchenShapeType, cabConstruction, saveSubmitData]);

  const loadShapes = useCallback((canvas, cabinetObject) => {

    const fetchedCanvasobjectList = cabinetObject.canvasObjectList && cabinetObject.canvasObjectList.length > 0
      ? cabinetObject.canvasObjectList
      : canvasobjectListParam;

    // We ALWAYS need the structural walls from the main project data in Redux
    const canvaswallsObject = [];

    const canvascabinetObject = [];
    const canvaswindowsObject = [];
    const canvasdoorsbject = [];
    const canvasappliancesObject = [];

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
        // Only add if not already in canvaswallsObject from Redux
        if (!canvaswallsObject.some(w => w.wallid === canvasObject.wallid)) {
          canvaswallsObject.push(canvasObject);
        }
      } else if (canvasObject.objectType === "upper" || canvasObject.objectType === "high") {
        if (canvasObject.cabinettype === "Refrigerator" || canvasObject.cabinettype === "Hood") {
          canvasappliancesObject.push(canvasObject);
        } else {
          canvascabinetObject.push(canvasObjectCopy);
        }
        // if (canvasObject.id > cabinetIdMax) {
        //   setCabinetIdMax(canvasObject.id);
        // }
      } else if (canvasObject.objectType === "window") {
        canvaswindowsObject.push(canvasObject);
      } else if (canvasObject.objectType === "door") {
        canvasdoorsbject.push(canvasObject);
      }
    });
    try {
      console.log("清空画布");
      canvas.clear(); // 每次重绘前清空画布，避免旧图形残留或重叠

      console.log("开始执行绘制");
      // 调用各个绘制函数，并添加数据存在的检查
      if (canvaswallsObject.length > 0) {
        drawWall(canvas, canvaswallsObject, kitchenShapeType);
      }
      if (canvasappliancesObject.length > 0) {
        DrawApplianceSet(canvas, canvasappliancesObject, 2, dispatch, cabinetObject);
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
        drawRuler(canvas, groupedByWallId, kitchenShapeType, canvaswallsObject);
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


  }, [showSnackbar, cabConstruction, dispatch, kitchenShapeType]);

  const handleObjectModified = useCallback((event) => {
    console.log('Object modified:', event.target);
    // event.target.flag = 'moveFlag'; // 显式设置为移动标志，避免被当作新添加
    snapToNearbyObjects(event.target);
    // 更新 Redux 状态
    const currentCabinetObject = selectCabinetObject(store.getState());
    getSubmitData(currentCabinetObject);
    // Save history for Undo
    saveHistory(getCanvas('canvas2'), currentCabinetObject);
    setTrigger(prev => !prev);

  }, [snapToNearbyObjects, getSubmitData]);

  useEffect(() => {
    handleObjectModifiedRef.current = handleObjectModified;
  }, [handleObjectModified]);





  const deleteSelectedObject = useCallback(() => {
    let canvas = getCanvas('canvas2'); // 获取 canvas 实例
    if (!canvas || !canvas.getActiveObject()) return; // 如果canvas不存在或没有活动对象，则不执行删除
    const activeObject = canvas.getActiveObject();
    const cabinetObject = selectCabinetObject(store.getState()); // 直接从 Redux store 获取
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
    const currentCabinetCanvasInfo = cabinetCanvasInfoRef.current;

    if (activeObject.objectType === 'appliance') {

    } else if (activeObject.objectType === 'lower' || activeObject.objectType === 'upper' || activeObject.objectType === 'high' ||
      activeObject.objectType === 'islandiner' || activeObject.objectType === 'islandouter') {
      const matchingCabinets = cabinetObject.canvasObjectList.filter(cabinet => cabinet.id === activeObject.id);
      if (matchingCabinets.length > 0) {
        relatedId = matchingCabinets[0].relatedId;
        relatedId2 = matchingCabinets[0].relatedId2;
        // 更新appliances状态，移除对应项
        if (activeObject.cabinettype === 'WDC' || activeObject.cabinettype === 'WLS') {
          updatedCanvasObjectstmp = cabinetObjectCanvasDel.filter(cabinet => cabinet.id !== activeObject.id || cabinet.cabinettype !== activeObject.cabinettype);

          updatedCabinets = currentCabinetCanvasInfo.filter(cabinet => cabinet.id !== activeObject.id && cabinet.cabinettype !== activeObject.cabinettype);
          // updatedCanvasObjects = cabinetObjectCanvas.filter(cabinet => cabinet.id !== activeObject.id && cabinet.cabinettype !== activeObject.cabinettype);
        } else {
          updatedCabinets = currentCabinetCanvasInfo.filter(cabinet => cabinet.id !== activeObject.id);
          updatedCanvasObjectstmp = cabinetObjectCanvasDel.filter(cabinet => cabinet.id !== activeObject.id);

        }
        setCabinetCanvasInfo(updatedCabinets);
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
        canvasId: 2,
        canvasObjectList: updatedCanvasObjectstmp,
        cabinetObjectList: updatedCabinettmp
      };
      dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
    } else if (updatedCabinettmp.length > 0) {
      updatedCabinetFlag = {
        ...cloneDeep(cabinetObject),
        updateFlag: 1,
        canvasId: 2,
        cabinetObjectList: updatedCabinettmp
      };
      dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
    } else if (updatedCanvasObjectstmp.length > 0) {
      updatedCabinetFlag = {
        ...cloneDeep(cabinetObject),
        updateFlag: 1,
        canvasId: 2,
        canvasObjectList: updatedCanvasObjectstmp
      };
      dispatch(updateCabinet(updatedCabinetFlag)); // 这里使用更新后的状态
    }
    getSubmitData(updatedCabinetFlag); // 在删除后立即调用
  }, [dispatch, getSubmitData]);

  const handleKeyDown = useCallback((event) => {
    // 过滤输入框内的按键，防止在输入数字时触发删除
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelectedObject();
    }

    let canvas = getCanvas('canvas2');
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

  const handlePointerDown = useCallback((event) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // 只有右键才需要我们干预
    if (event.button === 2) {
      const target = canvas.findTarget(event, false) || canvas.getActiveObject();
      if (target.flag != "addFlag"  ) {
        if (target && (target.type === "group" || target.group) && (target.cabinettype === "FILLER" || target.cabinettype === "WF")) {
          // 右键点击 FILLER
          const group = target.type === "group" ? target : target.group;
          setFillerGroup(group);
          setNewWidth((group.widthcabinet).toFixed(1));
          setNewHeight((group.heightcabinet || 0).toFixed(1));
          setNewDepth((group.depthcabinet || 0).toFixed(1));

          event.preventDefault();
          event.stopPropagation();
        } else if (target && (target.type === "group" || target.group) && (target.cabinettype === "SP" || target.cabinettype === "PNW")) {
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
      } else {
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
    console.log('Canvas component - Canvas initinit useEffect triggered');
    if (!canvasRef.current) {
      console.log('Canvas already initialized or invalid, skipping');
      return;
    }
    if (!isInitialized) {
      // 通过 useCanvas hook 创建 Fabric.js Canvas 实例
      const newFabricCanvas = createCanvas('canvas2', canvasRef);
      if (newFabricCanvas) {
        fabricCanvasRef.current = newFabricCanvas;
        setIsInitialized(true); // 标记 Fabric.js Canvas 实例已创建成功
        console.log('Canvas 初始化成功');
      } else {
        console.error('未能创建 Fabric.js Canvas 实例。');
      }
    }

  }, [createCanvas, cleanupCanvas, trigger]);
  // --- 3. 数据加载 Effect ---
  // 这个 useEffect 在 Fabric.js Canvas 准备好并且 Redux 数据变化时，触发数据处理。
  useEffect(() => {
    console.log('数据加载 useEffect 触发 (cabinetObjectCanvas 改变)');

    // ✅ 方案1：检查当前激活页面是否是TopWallCab（索引1）
    const canvasOthers = selectOthers(store.getState());
    const isCurrentPage = canvasOthers.canvasActiveId === 1; // 1 = TopView索引

    if (!isCurrentPage) {
      console.log("当前不是TopWallCab页面，跳过重绘 (canvasActiveId:", canvasOthers.canvasActiveId, ")");
      return;
    }

    // 只有当 Fabric.js Canvas 实例准备好后才加载数据
    const shouldLoad = isInitialized &&
      cabinetObject.canvasObjectList &&
      cabinetObject.canvasObjectList.length > 0 &&
      (cabinetObject.updateFlag === 0 || !initialLoadDoneRef.current || trigger);

    if (shouldLoad) {
      console.log("执行加载 shapes, updateFlag:", cabinetObject.updateFlag, "首次加载:", !initialLoadDoneRef.current, "trigger:", trigger);
      loadShapes(fabricCanvasRef.current, cabinetObject);
      initialLoadDoneRef.current = true; // 标记首次加载已完成
    }
  }, [isInitialized, cabinetObject, trigger]);



  useEffect(() => {
    // 组件卸载时的清理函数
    return () => {
      console.log('组件卸载时进行 Canvas 清理');
      initHistory();
      cleanupCanvas(fabricCanvasRef.current, 'canvas2'); // 确保清理 Canvas 实例
    };

  }, []);

  return (

    <div style={{ width: '1300px', height: '100%', position: 'relative', cursor: 'context-menu' }}
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
            <MenuItem key={index} onClick={() => handleOption(option, "canvas2")}>
              {option.text}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No Objects</MenuItem>
        )}
      </Menu>
      <div className="canvas-container">
        <canvas ref={canvasRef} id="canvas2" />
      </div>
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
          Edit FILLER Dimensions
        </DialogTitle>

        <DialogContent
          sx={{
            mt: 2,
            pb: 1,
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
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
            </Grid>

            <Grid item xs={6}>
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
                  value={newDepth}
                  onChange={(e) => setNewDepth(e.target.value)}
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
                  value={newHeight}
                  onChange={(e) => setNewHeight(e.target.value)}
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
          </Grid>
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
                // Validate dimensions
                let nameCab = fillerGroup.objectname;
                let hasError = false;
                let errorMsg = '';

                // Width validation
                if (nameCab === "WF06" && newWidth > 6) {
                  hasError = true;
                  errorMsg = 'WF06 cabinet width cannot exceed 6\'\'';
                } else if (nameCab === "WF03" && newWidth > 3) {
                  hasError = true;
                  errorMsg = 'WF03 cabinet width cannot exceed 3\'\'';
                }

                // Height validation
                if (!hasError && newHeight && (isNaN(newHeight) || newHeight <= 0 ||
                  nameCab === "WF0351" && newHeight > 51 ||
                  nameCab === "WF03108" && newHeight > 108)) {
                  hasError = true;
                  errorMsg = 'Height must be a positive number';
                }

                // Depth validation
                if (!hasError && newDepth && (isNaN(newDepth) || newDepth <= 0)) {
                  hasError = true;
                  errorMsg = 'Depth must be a positive number';
                }

                // 如果有错误，显示提示，不执行后续逻辑
                if (hasError) {
                  setErrorMessage(errorMsg);
                  return;
                }

                const cabinetObject = selectCabinetObject(store.getState());
                let canvas = getCanvas('canvas2');
                saveHistory(canvas, cabinetObject);

                // 保存新的逻辑宽度
                fillerGroup.widthcabinet = parseFloat(newWidth);

                // 保存高度和深度（如果提供了）
                if (newHeight && !isNaN(newHeight)) {
                  fillerGroup.heightcabinet = parseFloat(newHeight);
                }
                if (newDepth && !isNaN(newDepth)) {
                  fillerGroup.depthcabinet = parseFloat(newDepth);
                }

                let newWidthActual = parseFloat(newWidth) * fillerGroup.scale;
                // 使用原有的depthcabinet如果newDepth未提供或为NaN
                let depthToUse = (newDepth && !isNaN(newDepth)) ? parseFloat(newDepth) : fillerGroup.depthcabinet;
                let newDepthActual = depthToUse * fillerGroup.scale;
                // 使用原有的heightcabinet如果newHeight未提供或为NaN
                let heightToUse = (newHeight && !isNaN(newHeight)) ? parseFloat(newHeight) : fillerGroup.heightcabinet;
                let newDHeightActual = heightToUse * fillerGroup.scale;

                let oldLeft = fillerGroup.left;
                let oldTop = fillerGroup.top;

                // 修改 group 内部每个对象的宽度
                if (fillerGroup.rotation === 90 || fillerGroup.rotation === 270) {
                  const oldWidth = fillerGroup.height;
                  const oldDepth = fillerGroup.width;
                  // 分别计算两个方向的缩放比例
                  const scaleX = newWidthActual / oldWidth;  // 高度方向（逻辑宽度）
                  const scaleDepth = newDepthActual / oldDepth;  // 宽度方向（逻辑深度）
                  console.log("旧高度:", oldWidth, "新高度:", newWidthActual, "比例X:", scaleX);
                  console.log("旧深度:", oldDepth, "新深度:", newDepthActual, "比例Depth:", scaleDepth);

                  fillerGroup._objects.forEach(obj => {
                    if (obj.type === 'rect') {
                      obj.set({
                        height: newWidthActual,
                        width: newDepthActual,
                        // 根据两个方向分别缩放位置
                        top: obj.top * scaleX,
                        left: obj.left * scaleDepth,
                      });
                    } else {
                      obj.set({
                        top: obj.top * scaleX,
                        left: obj.left * scaleDepth,
                      });
                    }
                  });
                  console.log("fillerGroup.height", fillerGroup.height);
                  fillerGroup.setCoords();
                  fillerGroup.height = newWidthActual;
                  fillerGroup.width = newDepthActual;
                  console.log("fillerGroup.top", fillerGroup.top);
                  if (fillerGroup.rotation === 270) {
                    oldTop = oldTop + (oldWidth - newWidthActual);
                    oldLeft = oldLeft + (oldDepth - newDepthActual);
                  }
                } else {
                  const oldWidth = fillerGroup.width;
                  const oldDepth = fillerGroup.height;
                  // 分别计算两个方向的缩放比例
                  const scaleX = newWidthActual / oldWidth;  // 宽度方向
                  const scaleDepth = newDepthActual / oldDepth;  // 高度方向（逻辑深度）
                  console.log("旧宽度:", oldWidth, "新宽度:", newWidthActual, "比例X:", scaleX);
                  console.log("旧深度:", oldDepth, "新深度:", newDepthActual, "比例Depth:", scaleDepth);

                  fillerGroup._objects.forEach(obj => {
                    if (obj.type === 'rect') {
                      obj.set({
                        width: newWidthActual,
                        height: newDepthActual,
                        // 根据两个方向分别缩放位置
                        left: obj.left * scaleX,
                        top: obj.top * scaleDepth,
                      });
                    } else {
                      obj.set({
                        left: obj.left * scaleX,
                        top: obj.top * scaleDepth,
                      });
                    }
                  });
                  fillerGroup.setCoords();
                  fillerGroup.width = newWidthActual;
                  fillerGroup.height = newDepthActual;
                  if (fillerGroup.rotation === 180) {
                    oldLeft = oldLeft + (oldWidth - newWidthActual);
                  } else if (fillerGroup.rotation === 0) {
                    oldTop = oldTop + (oldDepth - newDepthActual);
                  }
                }

                // 更新 group 封装信息
                fillerGroup.set({
                  scaleY: 1,
                  left: oldLeft,
                  top: oldTop
                });
                console.log("fillerGroup.width", fillerGroup.width);
                console.log("scale", fillerGroup.scale);
                console.log("oldLeft", oldLeft);
                console.log("oldTop", oldTop);

                // 更新坐标并重新渲染
                fillerGroup.setCoords();
                fabricCanvasRef.current.requestRenderAll();
                fillerGroup.flag = "modifyFiller";

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
                  canvasObjectStore = canvasObjectStore.map(item => {
                    if (item.id === fillerGroup.id) {
                      let updateData = {
                        ...item,
                        x: newX,
                        y: newY,
                        widthcabinet: parseFloat(newWidth),
                        width: newWidthActual,
                        height: newDHeightActual,
                        depth: newDepthActual,
                        updateFlg: 2,
                      };

                      // 添加高度和深度（如果提供了）
                      if (newHeight && !isNaN(newHeight)) {
                        updateData.heightcabinet = parseFloat(newHeight);
                      }
                      if (newDepth && !isNaN(newDepth)) {
                        updateData.depthcabinet = parseFloat(newDepth);
                      }

                      return updateData;
                    }
                    return item;
                  });

                  // 更新 cabinetListStore
                  cabinetListStore = cabinetListStore.map(item => {
                    if (item.id === relatedId) {
                      let cabinetUpdateData = {
                        ...item,
                        width: parseFloat(newWidth),
                        updateFlg: 2,
                      };

                      // 添加高度和深度（如果提供了）
                      if (newHeight && !isNaN(newHeight)) {
                        cabinetUpdateData.height = parseFloat(newHeight);
                      }
                      if (newDepth && !isNaN(newDepth)) {
                        cabinetUpdateData.depth = parseFloat(newDepth);
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
                  if (nameCab === "PNW48" && spHeight > 48) {
                    hasError = true;
                    errorMsg = 'PNW48 cabinet height cannot exceed 48\'\'';
                  } else if (nameCab === "SP1239" && spHeight > 39) {
                    hasError = true;
                    errorMsg = 'SP1239 cabinet height cannot exceed 39\'\'';
                  } else if (nameCab === "SP1251" && spHeight > 51) {
                    hasError = true;
                    errorMsg = 'SP1251 cabinet height cannot exceed 51\'\'';
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
                let canvas = getCanvas('canvas2');
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
};


export default TopWallCab;
