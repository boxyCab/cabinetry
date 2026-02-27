import React, { useState, useRef, useEffect, useCallback } from 'react';  // 导入 useState
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import axios from 'axios';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // 样式导入
import './MyPageCarousel.css';
import { Box, Paper, Button, Stack, IconButton, TextField, CircularProgress, Tooltip, Divider } from '@mui/material';  // 导入 Stack 组件
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Canvas from './Canvas';
import TopWallCab from './TopWallCab';
import ElevationView from './ElevationView';
import CabinetItemList from './CabinetItemList'
import PdfDialog from './PdfDialog';

import store, { updateCabinet, selectCabinetObject, updateOthers, selectOthers, selectSubmitData, updateupdateFlag, updateKitchenInfo } from './../store';
import { selectKitchenId, selectKitchenShapeType, selectConstruction1, selectConstruction2 } from './../store';

import updateData from '../api/updateData';
import updateKitchenNotes from '../api/updateKitchenNotes';
import { useDispatch, useSelector } from 'react-redux';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloseIcon from '@mui/icons-material/Close';
import EditNoteIcon from '@mui/icons-material/EditNote';
import { useSnackbar } from "../components/GlobalSnackbar";
import { MessageInfo } from './../common/MessageInfo';
import { saveWall, addWallItem } from '../api/saveWall';
import { useCanvas, } from './../CanvasContext';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function PageCarousel({ paramKitchenId, inputFlg, refresh, onOpenCabinets, onOpenSearch }) {

  const [activeIndex, setActiveIndex] = useState(0);
  const [pages, setPages] = useState([
    { id: 1, title: 'Base view', type: 'Canvas', wallid: 0 },
    { id: 2, title: 'Top View', type: 'TopWallCab', wallid: 0 },
  ]);
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [wallidObjects, setWallidObjects] = React.useState([]);
  const [canvasobjectList, setCanvasobjectList] = React.useState([]);

  const [openItemListDialog, setOpenItemListDialog] = React.useState(false);
  const [openPdf, setOpenPdf] = React.useState(false);
  const [regenerateflag, setRegenerateflag] = React.useState(0);
  const carouselRef = useRef(null);
  const kitcheninfo = useSelector((state) => state.data);
  const [open, setOpen] = React.useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const cabinetObjectPage = useSelector(selectCabinetObject);
  const canvasOthersObject = useSelector(selectOthers);
  const submitData = useSelector(selectSubmitData);
  const dispatch = useDispatch();
  const showSnackbar = useSnackbar();
  const [pendingIndex, setPendingIndex] = useState(null); // null 表示无待处理跳转
  const { saveSubmitData } = useCanvas();
  const [openDialog, setOpenDialog] = useState(false);
  const [estimateId, setEstimateId] = useState("");
  const [po, setPo] = useState("");



  let kitchenId = typeof paramKitchenId === 'object' && paramKitchenId !== null
    ? paramKitchenId.paramKitchenId // 如果是对象，取 paramKitchenId
    : paramKitchenId;              // 如果是数字，直接使用
  const [trigger, setTrigger] = useState(false); // 用于触发 useEffect

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  const addWall = () => {
    // 这里添加你的逻辑
    console.log("addWall");
    let wallCount = wallidObjects ? wallidObjects.length : 0;
    const numberWords = ["zero", "one", "two", "three", "four", "five"];
    let addWallName = "Wall" + numberWords[wallCount + 1];
    let wallObjTmp = {
      id: null,
      x: 200,
      y: 100,
      width: 100 * wallidObjects ? wallidObjects[0].scale : 1,
      height: 20,
      angle: 0,
      scale: wallidObjects ? wallidObjects[0].scale : 1,
      widthCabinet: 100,
      objectName: addWallName,

    }
    addWallItem("canvas1", wallObjTmp);
  };


  const saveChangedWall = async () => {
    // 使用 await 获取异步请求的结果
    let result = await saveWall(kitcheninfo);

    console.log("saveWall::::::result:", result);  // 输出 result 对象
  };


  const handleSubmitData = useCallback(async (currentIndex, id) => {
    console.log('submit data handleSubmitData');
    // 1. 获取当前状态 (注意：要用 store.getState() 确保拿到最新的，避免闭包存了旧的 props)
    const state = store.getState();
    const currentCabinetObject = selectCabinetObject(state);
    const canvaswalls = currentCabinetObject.canvasWallList;

    // ... 获取其他数据 ...
    let kitchenId = selectKitchenId(state);
    const kitchenShapeType = selectKitchenShapeType(state);
    let cabConstruction = selectConstruction1(state); // 默认

    let canvas = null;
    if (id != null) kitchenId = id;
    if (currentIndex === 0) {
      canvas = "canvas1";
      cabConstruction = selectConstruction2(state);
    } else {
      // 假设 Index 1 是 Top View
      canvas = "canvas2";
      cabConstruction = selectConstruction1(state); // 或者是 construction1? 根据你的业务
    }

    let data = saveSubmitData(currentCabinetObject, kitchenId, canvas, kitchenShapeType, cabConstruction);

    if (!data) {
      showSnackbar("The cabinet placement is incorrect. Please adjust it before saving", "error");
      return false; // 返回 false
    }

    try {
      // 2. 等待后端请求完成 
      const result = await updateData(data);
      console.log("Update Data Result:", result);

      // ✅ 再次获取最新的 State，确保我们基于最新的数据进行修改
      const latestState = store.getState();
      const latestCabinetObject = selectCabinetObject(latestState);
      // 3. 构建新的 State
      const updatedCabinetFlag = {
        ...latestCabinetObject, // 使用最新获取的对象
        updateFlag: 0, // ✅ 关键：重置为 0
        canvasWallList: canvaswalls,
        canvasObjectList: result.cabinetObjectDtoList,
        cabinetObjectList: result.cabinetDtoList
      };
      // 4. Dispatch 更新 Redux
      dispatch(updateCabinet(updatedCabinetFlag));

      return true; // ✅ 成功返回 true
    } catch (error) {
      console.error("Error:", error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
      return false; // 失败返回 false
    }
  }, [dispatch, saveSubmitData, showSnackbar]); // 移除 submitData, cabinetObjectPage 依赖，改用 store.getState()

  const loadUpperShapes = async () => {
    try {
      const baseURL = window.location.hostname === 'localhost'
        ? 'http://localhost'
        : `http://${window.location.hostname}`;

      const response = await axios.get(`${baseURL}/api/getKitUpperObj`, {
        params: { kitchenId },
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      console.log("getKitUpperObj result:", response.data);

      const currentCabinetObject = selectCabinetObject(store.getState());
      const updatedCabinetObject = {
        ...currentCabinetObject,
        updateFlag: 0,
        canvasObjectList: response.data.cabinetObjectDtoList,
        cabinetObjectList: response.data.cabinetDtoList
      };
      dispatch(updateCabinet(updatedCabinetObject));

      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === 2
            ? {
              ...page,
              content: response.data.cabinetObjectDtoList.length > 0
                ? <TopWallCab
                  key={Date.now()}
                  canvasobjectListParam={response.data.cabinetObjectDtoList}
                  refreshParam={regenerateflag}
                  trigger={trigger}
                  setTrigger={setTrigger}
                />
                : <Typography>Loading TopWallCab...</Typography>,
            }
            : page
        )
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
    }
  };
  const loadElevationhapes = async (wallMetadata, pageId) => {
    try {
      const baseURL = window.location.hostname === 'localhost'
        ? 'http://localhost'
        : `http://${window.location.hostname}`;

      const response = await axios.get(`${baseURL}/api/getKitElevationObj`, {
        params: {
          kitchenId: kitchenId,
          wallid: wallMetadata.wallid,
          typeFlg: wallMetadata.flag
        },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      let displayData = response.data;

      // Removed redundant dispatch to prevent resetting page state

      if (wallMetadata.flag === "islandiner" || wallMetadata.flag === "islandouter") {
        displayData = Array.isArray(response.data)
          ? response.data.filter(item =>
            item && item.type &&
            item.type.toLowerCase() === wallMetadata.flag.toLowerCase())
          : response.data;
      }

      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === pageId
            ? {
              ...page,
              content: displayData.length > 0
                ? <ElevationView
                  canvasobjectList={displayData}
                  pageIndex={page.id}
                />
                : <Typography>Loading View...</Typography>,
            }
            : page
        )
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
    }
  };
  // Extract the logic to process data and update various internal states
  const initComponentWithData = useCallback((data, shouldUpdateRedux = true) => {
    if (!data || !data.cabinetObjectDtoList) return;

    const fetchedCanvasobjectList = data.cabinetObjectDtoList;
    const cabinetobjectList = data.cabinetDtoList || [];
    setCanvasobjectList(fetchedCanvasobjectList);

    const canvaswalls = [];
    let wallScale = "1";
    const wallidArray = [];
    const islandObjects = {};

    // 第一次遍历，收集所有 wall 和 island 对象
    fetchedCanvasobjectList.forEach((canvasObject) => {
      if (canvasObject.objectType === "wall") {
        canvaswalls.push(canvasObject);
        wallScale = canvasObject.scale;

        if (canvasObject.wallid !== null && canvasObject.wallid !== undefined) {
          const existingIndex = wallidArray.findIndex(item => item.wallid === canvasObject.wallid);
          if (existingIndex === -1) {
            let wallWidth = parseFloat(canvasObject.width) || 0;
            if (canvasObject.objectname) {
              const match = canvasObject.objectname.match(/[\d.]+/);
              if (match && !wallWidth) {
                wallWidth = parseFloat(match[0]);
              }
            }
            if (wallWidth > 0) {
              wallidArray.push({
                wallid: canvasObject.wallid,
                flag: "wall",
                rotation: canvasObject.rotation,
                scale: wallScale,
                objectName: canvasObject.objectname,
                widthCabinet: wallWidth,
              });
            }
          }
        }
      } else if (canvasObject.objectType === "island" || canvasObject.objectType === "peninsula") {
        canvaswalls.push(canvasObject);
        if (canvasObject.wallid !== null && canvasObject.wallid !== undefined) {
          islandObjects[canvasObject.wallid] = canvasObject;
          const existingIndex = wallidArray.findIndex(item => item.wallid === canvasObject.wallid);
          if (existingIndex === -1) {
            wallidArray.push({
              wallid: canvasObject.wallid,
              flag: "islandiner",
              rotation: canvasObject.rotation
            });
          }
        }
      }
    });

    // 第二次遍历，处理 islandiner 和 islandouter
    fetchedCanvasobjectList.forEach((canvasObject) => {
      if (canvasObject.objectType === "islandiner" || canvasObject.objectType === "islandouter") {
        if (canvasObject.wallid !== null && canvasObject.wallid !== undefined) {
          const existingIndex = wallidArray.findIndex(item =>
            item.wallid === canvasObject.wallid &&
            item.flag === canvasObject.objectType
          );

          if (existingIndex === -1) {
            wallidArray.push({
              wallid: canvasObject.wallid,
              flag: canvasObject.objectType,
              rotation: canvasObject.rotation || 0
            });

            if (islandObjects[canvasObject.wallid] &&
              !canvaswalls.some(w => w.wallid === canvasObject.wallid && (w.objectType === "island" || w.objectType === "peninsula"))) {
              canvaswalls.push(islandObjects[canvasObject.wallid]);
            }
          }
        }
      }
    });

    setWallidObjects(wallidArray);

    if (shouldUpdateRedux) {
      const currentCabinetObject = selectCabinetObject(store.getState());
      const updatedCabinetObject = {
        ...currentCabinetObject,
        updateFlag: currentCabinetObject.updateFlag || 0,
        scale: wallScale,
        canvasWallList: canvaswalls,
        canvasObjectList: fetchedCanvasobjectList,
        cabinetObjectList: cabinetobjectList
      };
      dispatch(updateCabinet(updatedCabinetObject));
    }

    setTrigger(prev => !prev);

    // Build Pages
    const basePages = [
      { id: 1, title: 'Base view', type: 'Canvas', wallid: 0 },
      { id: 2, title: 'Top View', type: 'TopWallCab', wallid: 0 },
    ];

    const additionalPages = [];
    let pageId = 3;
    let wallCounter = 0;
    wallidArray.forEach((item) => {
      if (item.flag === "wall") {
        const names = ["One", "Two", "Three", "Four"];
        const title = `Elevation ${names[wallCounter] || (wallCounter + 1)} View`;
        wallCounter++;
        additionalPages.push({
          id: pageId++,
          title: title,
          content: `Elevation${item.wallid}`,
          type: 'Elevation',
          background: pageId % 2 === 0 ? '#E0F7FA' : '#FFEBEE',
          wallid: item.wallid,
          flag: 'wall'
        });
      } else if (item.flag === "islandiner") {
        additionalPages.push({
          id: pageId++,
          title: `Island Inner View`,
          content: `IslandInner${item.wallid}`,
          type: 'IslandInner',
          background: pageId % 2 === 0 ? '#E0F7FA' : '#FFEBEE',
          wallid: item.wallid,
          flag: "islandiner"
        });
      } else if (item.flag === "islandouter") {
        additionalPages.push({
          id: pageId++,
          title: `Island Outer View`,
          content: `IslandOuter${item.wallid}`,
          type: 'IslandOuter',
          background: pageId % 2 === 0 ? '#E0F7FA' : '#FFEBEE',
          wallid: item.wallid,
          flag: "islandouter"
        });
      }
    });

    setPages([...basePages, ...additionalPages]);
  }, [dispatch, kitcheninfo.cabinet]);

  const loadShapes = async (regenerateflag) => {
    try {
      const baseURL = window.location.hostname === 'localhost'
        ? 'http://localhost'
        : `http://${window.location.hostname}`;
      const response = await axios.get(`${baseURL}/api/generateKitObj`, {
        params: {
          kitchenId: kitchenId,
          flag: regenerateflag
        },
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      setRegenerateflag(0);
      if (!response.data) {
        console.error('Invalid response data:', response.data);
        showSnackbar(MessageInfo.backCommunicateError, "error");
        return;
      }

      // Process and update state
      initComponentWithData(response.data, true);

    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar(MessageInfo.backCommunicateError, "error");
    }
  };


  useEffect(() => {
    console.log("kitchenId useEffect!!!!!!!:" + kitchenId);
    if (!kitchenId) return;

    // Check if Redux already has data
    const hasData = cabinetObjectPage?.canvasObjectList?.length > 0;

    // IMPORTANT: If data is already in Redux (from Sidebar generation or Search preview sync),
    // we should just initialize our internal views from it instead of re-fetching.
    if (hasData) {
      console.log("Data already exists in Redux.");

      // If we are in a sub-view (Top View, Elevation, etc.) and have already generated the page structure (walls found),
      // we assume the incoming Redux update is for that specific view's data (which might be partial/missing walls).
      // In this case, we SKIP rebuilding the pages to prevent losing the Navigation structure.
      if (activeIndex !== 0 && wallidObjects.length > 0) {
        console.log("Skipping Page Re-initialization (initComponentWithData) because we are in a sub-view and structure exists.");
        return;
      }

      console.log("Initializing views from existing data.");
      initComponentWithData({
        cabinetObjectDtoList: cabinetObjectPage.canvasObjectList,
        cabinetDtoList: cabinetObjectPage.cabinetObjectList
      }, false); // shouldUpdateRedux = false to avoid loops
      return;
    }

    if (inputFlg === "fromDrawer" ||
      inputFlg === "fromGenerate" ||
      (!hasData)
    ) {
      console.log("Loading shapes from API due to initial load or flag:", inputFlg);
      // const flag = inputFlg === "fromDrawer" ? 2 : 0;
      const flag = 0;
      setRegenerateflag(flag);
      loadShapes(flag);
      setActiveIndex(0);
    }
  }, [kitchenId, inputFlg, cabinetObjectPage?.canvasObjectList?.length, initComponentWithData, activeIndex, wallidObjects.length]);


  // useEffect(() => {
  //   loadShapes();
  // }, [loadShapes]);


  const handleNavClick = (index, flag) => {
    if (index === activeIndex) return;
    if (flag === false) return;
    performNavClick(index);

  };

  // 新增函数：封装原 handleNavClick 中的跳转逻辑
  const performNavClick = (index) => {
    setActiveIndex(index);
    const updateOthersObject = {
      ...canvasOthersObject,
      canvasActiveId: index,
    };
    dispatch(updateOthers(updateOthersObject));

    if (index === 0) {
      setIsButtonEnabled(true);
      if (inputFlg === "fromDrawer" || inputFlg === "fromGenerate") {
        loadShapes(0);
      }
    } else if (index === 1) {
      setIsButtonEnabled(false);

      // 🔥【关键修改 1】切换到 Top View 前，先清空 content，防止渲染 Redux 中残留的 Base View 数据
      setPages((prevPages) =>
        prevPages.map((page) =>
          page.id === 2 ? { ...page, content: null } : page // content: null 会触发 "Loading..." 界面
        )
      );

      loadUpperShapes();

    } else {
      setIsButtonEnabled(false);
      const page = pages[index];
      if (page) {
        loadElevationhapes(wallidObjects[index - 2], page.id);
      }
    }
  };

  const saveKitchen = (walls, cabinetInfo, canvas) => {
    setOpenPdf(true);
  }
  const ItemListCSV = (estimateId, po) => {
    handleExportCSV(estimateId, po);
  }

  const handleExportCSV = async (estimateId, po) => {
    try {
      // 根据当前环境创建基础 URL
      const baseURL = window.location.hostname === 'localhost'
        ? 'http://localhost'
        : `http://${window.location.hostname}`;
      // 发送 GET 请求下载 CSV 文件

      const response = await axios.post(`${baseURL}/api/exportItemsCSV`,
        {},   // 如果后端不需要 body，就传空对象
        {
          params: {
            kitchenId: kitchenId,
            po: po,
            estimateId: estimateId,
          },
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // 如果后端配置了 credentials
          responseType: 'blob',  // 以 blob 形式接收文件
        });

      // 创建一个 URL 对象来表示 Blob 文件
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const fileName = "ItemList_" + kitchenId + ".csv"; //   设置下载文件的名称
      // 创建一个隐藏的链接元素
      // 创建一个链接元素
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // 设置下载文件的名称
      document.body.appendChild(link);
      link.click();  // 模拟点击以触发下载

      // 释放 URL 对象
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }


  const ItemList = (walls, cabinetInfo, canvas) => {
    setOpenItemListDialog(true);
  }

  const dialogHandleClose = () => {
    setOpenItemListDialog(false);  // 将返回的值存储到状态中
  };
  const handlePdfClose = () => {
    setOpenPdf(false);
  };
  const handleReturnValue = (value) => {
    setOpenItemListDialog(false);  // 将返回的值存储到状态中
    console.log("Returned value:", value);  // 你可以在这里处理返回值
  };

  const handleSaveNotes = async () => {
    if (!kitchenId) return;
    setIsSavingNotes(true);
    try {
      // Only send kitchenId and notes to the backend
      const notesPayload = {
        kitchenId: kitchenId,
        notes: kitcheninfo.kitchenObject?.notes || ""

      };
      const result = await updateKitchenNotes(notesPayload);
      if (result && !result.error) {
        showSnackbar("Notes saved successfully!", "success");
      } else {
        showSnackbar("Failed to save notes: " + (result?.error || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      showSnackbar("An error occurred while saving notes.", "error");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const regenerateLayout = async () => {
    console.log("regenerateLayout开始执行...");
    // 1. 调用 loadShapes(2) 进行后端重新生成
    await loadShapes(2);

    // 2. 更新 updateFlag 触发 DashboardMain 中的 key 变化，从而触发 PageCarousel 重新 Mount
    // 这实现了“删除重新生成”的效果（完全卸载并重新加载组件）
    dispatch(updateupdateFlag(Date.now()));
  };

  // 打开对话框
  const handleOpenDialog = () => {
    setEstimateId("");
    setPo("");
    setOpenDialog(true);
  };

  // 关闭对话框
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // 确认导出
  const handleConfirmExport = () => {
    if (!estimateId || !po) {
      alert("Please fill in both Estimate ID and PO#");
      return;
    }
    ItemListCSV(estimateId, po);
    setOpenDialog(false);
  };

  const renderPageComponent = (page) => {
    if (!page) return (
      <Box sx={{ p: 5, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Preparing view...</Typography>
      </Box>
    );

    switch (page.type) {
      case 'Canvas':
        return <Canvas trigger={trigger} setTrigger={setTrigger} />;
      case 'TopWallCab':
        // If content is already set (by loadUpperShapes), use it. 
        // Otherwise, rely on dynamic rendering if we haven't loaded yet.
        // But since we set content in loadUpperShapes, we can use page.content or default.
        if (page.content && typeof page.content !== 'string') return page.content;
        return (
          <TopWallCab
            // For initial render before loadUpperShapes, we might want to pass something or just wait
            // But TopWallCab reads from Redux if we don't pass filtered list. 
            // However, for Top View we WANT filtered list. 
            // So we rely on loadUpperShapes to update content.
            refreshParam={regenerateflag}
            trigger={trigger}
            setTrigger={setTrigger}
          />
        );
      case 'Elevation':
      case 'IslandInner':
      case 'IslandOuter':
        // Elevation content is set by loadElevationhapes
        if (page.content && typeof page.content !== 'string') return page.content;
        return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading...</Typography></Box>;
      default:
        return <div>Unknown view type</div>;
    }
  };

  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'transparent',
    }}>

      {/* Top Navigation Bar */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 3,
        py: 2,
        height: '73px',
        borderBottom: '1px solid #E5E7EB',
        bgcolor: 'white',
      }}>
        {/* Left: Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', fontSize: '1.25rem' }}>
            Design View
          </Typography>
        </Box>

        {/* Right: Consolidated Action Toolbar */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          {/* Group 1: Helper Tools */}
          <Tooltip title="View Cabinets">
            <IconButton onClick={onOpenCabinets} size="small" sx={{ color: '#6B7280' }}>
              <LibraryBooksIcon sx={{ fontSize: '2rem' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Search Designs">
            <IconButton onClick={onOpenSearch} size="small" sx={{ color: '#6B7280' }}>
              <SearchIcon sx={{ fontSize: '2rem' }} />
            </IconButton>
          </Tooltip>

          {/* Divider */}
          <Divider orientation="vertical" flexItem variant="middle" sx={{ mx: 0.5, height: '24px', alignSelf: 'center' }} />

          {/* Group 2: Secondary Actions */}
          <Tooltip title="Export Item List">
            <IconButton onClick={handleOpenDialog} size="small" disabled={!isButtonEnabled} sx={{ color: '#6B7280' }}>
              <FileDownloadIcon sx={{ fontSize: '2rem' }} />
            </IconButton>
          </Tooltip>

          <Button
            variant="outlined"
            startIcon={<EditNoteIcon />}
            onClick={() => setShowNotes(!showNotes)}
            sx={{
              textTransform: 'none',
              color: '#4B5563',
              borderColor: '#D1D5DB',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: '24px',
              paddingX: '20px',
              '&:hover': { bgcolor: '#F3F4F6', borderColor: '#9CA3AF' }
            }}
          >
            Notes
          </Button>

          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            disabled={!isButtonEnabled}
            onClick={regenerateLayout}
            sx={{
              textTransform: 'none',
              color: '#4B5563',
              borderColor: '#D1D5DB',
              fontSize: '0.9rem',
              fontWeight: 600,
              borderRadius: '24px',
              paddingX: '20px',
              '&:hover': { bgcolor: '#F3F4F6', borderColor: '#9CA3AF' }
            }}
          >
            Regenerate
          </Button>

          {/* Group 3: Primary Action */}
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={!isButtonEnabled}
            onClick={saveKitchen}
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              paddingX: '32px',
              borderRadius: '24px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#4338CA', boxShadow: 'none' }
            }}
          >
            Save
          </Button>
        </Stack>
      </Box>

      {/* View Navigation Tabs Box */}
      <Box sx={{
        px: 3,
        py: 1.5,
        bgcolor: 'white',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        gap: 1.5,
        overflowX: 'auto',
        '&::-webkit-scrollbar': { height: 6 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#D1D5DB', borderRadius: 3 }
      }}>
        {pages.map((page, index) => (
          <Button
            key={index}
            variant={activeIndex === index ? "contained" : "outlined"}
            onClick={() => {
              const currentState = store.getState();
              const cabinetFlag = currentState.data.cabinet.updateFlag;
              // Only trigger "Unsaved Changes" if updateFlag is exactly 1 (manual modification)
              // If it's a timestamp (from Generate Design), it shouldn't be considered "unsaved manual change"
              if (cabinetFlag === 1) {
                setPendingIndex(index);
                setOpen(true);
              } else {
                handleNavClick(index, true);
              }
            }}
            sx={{
              ...(activeIndex === index ? {
                bgcolor: '#4F46E5',
                color: 'white',
                borderColor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA', borderColor: '#4338CA' }
              } : {
                bgcolor: 'transparent',
                color: '#6B7280',
                borderColor: '#D1D5DB',
                '&:hover': { bgcolor: '#F3F4F6', borderColor: '#9CA3AF' }
              }),
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              px: 2,
              py: 0.75,
              boxShadow: 'none',
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
              borderRadius: '8px'
            }}
          >
            {page.title}
          </Button>
        ))}
      </Box>

      {/* Main Content Area */}
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        p: 3,
        bgcolor: '#F3F4F6',
        position: 'relative'
      }}>
        {canvasobjectList && canvasobjectList.length > 0 ? (
          <>
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                bgcolor: 'white',
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                minHeight: '600px',
                width: '100%',
                maxWidth: '1600px',
                mx: 'auto',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 3, width: '100%', height: '100%' }}>
                {renderPageComponent(pages[activeIndex])}
              </Box>
            </Paper>

            {/* Floating Notes Panel */}
            {showNotes && (
              <Paper
                sx={{
                  position: 'absolute',
                  bottom: 24,
                  right: 24,
                  width: 320,
                  borderRadius: 2,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E5E7EB',
                  bgcolor: 'white',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{
                  p: 1.5,
                  bgcolor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#374151' }}>
                    Engineering Notes
                  </Typography>
                  <Box>
                    <Tooltip title="Save Notes">
                      <IconButton
                        size="small"
                        onClick={handleSaveNotes}
                        disabled={isSavingNotes}
                        sx={{ color: '#4F46E5', mr: 0.5 }}
                      >
                        {isSavingNotes ? <CircularProgress size={18} /> : <SaveIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => setShowNotes(false)}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ p: 2 }}>
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    placeholder="Enter design specifications or installation notes here..."
                    variant="outlined"
                    size="small"
                    value={kitcheninfo.kitchenObject?.notes || ''}
                    onChange={(e) => {
                      const updatedNotes = e.target.value;
                      const updatedKitchenInfo = JSON.parse(JSON.stringify(kitcheninfo));
                      updatedKitchenInfo.kitchenObject.notes = updatedNotes;
                      dispatch(updateKitchenInfo(updatedKitchenInfo));
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontSize: '0.875rem',
                        '& fieldset': { borderColor: '#E5E7EB' },
                      }
                    }}
                  />
                </Box>
                <Box sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    startIcon={isSavingNotes ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    sx={{
                      bgcolor: '#4F46E5',
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      '&:hover': { bgcolor: '#4338CA' }
                    }}
                  >
                    {isSavingNotes ? 'Saving...' : 'Save Notes'}
                  </Button>
                </Box>
              </Paper>
            )}
          </>
        ) : (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            minHeight: '400px',
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress size={40} sx={{ color: '#4F46E5' }} />
            <Typography variant="body1" color="textSecondary">
              Loading design pages...
            </Typography>
          </Box>
        )}
      </Box>

      {/* Dialogs */}
      <CabinetItemList
        open={openItemListDialog}
        onClose={dialogHandleClose}
        onReturnValue={handleReturnValue}
      />

      <PdfDialog
        open={openPdf}
        onClose={handlePdfClose}
        directoryPath={`output/${kitchenId}`}  // 直接用模板字符串拼接
        kitchenId={kitchenId}
      />

      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2, fontWeight: 600 }} id="customized-dialog-title">
          Unsaved Changes
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography gutterBottom>
            The design has been modified. Do you want to save changes before leaving?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              performNavClick(pendingIndex);
              handleClose();
            }}
            sx={{ color: '#6B7280' }}
          >
            Discard & Leave
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (activeIndex === 0 || activeIndex === 1) {
                try {
                  const success = await handleSubmitData(activeIndex, null);
                  // 2. 如果保存成功，执行跳转
                  if (success) {
                    if (pendingIndex !== null) {
                      handleNavClick(pendingIndex, true); // 跳转到目标页
                    }
                    handleClose(); // 关闭弹窗
                  } else {
                    // 如果保存失败，可以选择不关闭弹窗，或者提示用户
                    console.error("Save failed, staying on page.");
                  }
                } catch (error) {
                  console.error('save failed:', error);
                  return;
                }
              } else {
                performNavClick(pendingIndex);
                handleClose();
              }
            }}
            sx={{ bgcolor: '#4F46E5', '&:hover': { bgcolor: '#4338CA' } }}
          >
            Save & Continue
          </Button>
        </DialogActions>
      </BootstrapDialog>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Export Configuration</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Estimate ID"
              fullWidth
              variant="outlined"
              size="small"
              value={estimateId}
              onChange={(e) => setEstimateId(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Purchase Order #"
              fullWidth
              variant="outlined"
              size="small"
              value={po}
              onChange={(e) => setPo(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#6B7280' }}>Cancel</Button>
          <Button variant="contained" onClick={handleConfirmExport} sx={{ bgcolor: '#4F46E5' }}>
            Export Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
