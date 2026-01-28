// historyManager.js
import cloneDeep from "lodash/cloneDeep";

const historyStack = [];
const initialStack = [];
let historyIndex = -1;


// ✅ 初始化历史记录
export const initHistory = () => {
  historyStack.length = 0;
  initialStack.length = 0;
  historyIndex = -1;

  console.log("History has been cleared.");
};

export const saveInitial = (canvas, cabinetObject) => {
  if (!canvas) return;
  const canvasState = canvas.toJSON();
  const reduxState = cloneDeep(cabinetObject);

  // 如果是第一次保存，先保存初始状态
  if (initialStack.length === 0) {
    const initialCanvasState = cloneDeep(canvasState);
    const initialReduxState = cloneDeep(reduxState);
    initialStack.push({ canvasState: initialCanvasState, reduxState: initialReduxState });
  }
};

export const getInitial = (canvas, dispatch, updateCabinet) => {
  if (!canvas) return;
  const { canvasState, reduxState } = historyStack[0];

  canvas.loadFromJSON(canvasState, () => {
    canvas.requestRenderAll();
    dispatch(updateCabinet(cloneDeep(reduxState)));
  });
};

// 保存状态
export const saveHistory = (canvas, cabinetObject) => {
  if (!canvas) return;
  const canvasState = canvas.toJSON();
  const reduxState = cloneDeep(cabinetObject);

  // If it's the first save, just push the initial state
  if (historyStack.length === 0) {
    const initialCanvasState = cloneDeep(canvasState);
    const initialReduxState = cloneDeep(reduxState);
    historyStack.push({ canvasState: initialCanvasState, reduxState: initialReduxState });
    historyIndex = 0;
  } else {
    // Normal save: remove redo history if any, then push new state
    if (historyIndex < historyStack.length - 1) {
      historyStack.splice(historyIndex + 1);
    }
    historyStack.push({ canvasState, reduxState });
    historyIndex = historyStack.length - 1;
  }
};

// 撤销
export const undoHistory = (canvas, dispatch, updateCabinet) => {
  if (historyIndex <= 0) return; // 已经是初始状态

  historyIndex--;
  console.log("undoHistory ：historyIndex =", historyIndex);

  const { canvasState, reduxState } = historyStack[historyIndex];

  canvas.loadFromJSON(canvasState, () => {
    canvas.requestRenderAll();
    dispatch(updateCabinet(cloneDeep(reduxState)));
  });
};

// 重做
export const redoHistory = (canvas, dispatch, updateCabinet) => {
  if (historyIndex >= historyStack.length - 1) return;
  historyIndex++;

  const { canvasState, reduxState } = historyStack[historyIndex];

  canvas.loadFromJSON(canvasState, () => {
    canvas.requestRenderAll();
    dispatch(updateCabinet(cloneDeep(reduxState)));
  });
};
