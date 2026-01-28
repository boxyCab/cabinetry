import React, { useState } from 'react';
import { Box, Paper, Divider } from '@mui/material';
import DashboardSidebar from './DashboardSidebar';
import DashboardMain from './DashboardMain';

const Dashboard = () => {
  const [sidebarWidth, setSidebarWidth] = useState(600); // Default increased to 600px
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = React.useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = React.useCallback(
    (mouseMoveEvent) => {
      if (isResizing) {
        // Limit width between 300 and 1200
        const newWidth = Math.max(300, Math.min(1200, mouseMoveEvent.clientX));
        setSidebarWidth(newWidth);
      }
    },
    [isResizing]
  );

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing, isResizing]);

  return (
    <Box sx={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Left Sidebar */}
      <Paper
        elevation={0} // 【修改1】去掉阴影，扁平化
        square // 确保没有圆角
        sx={{
          width: sidebarWidth,
          minWidth: 300,
          maxWidth: 1200,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          transition: isResizing ? 'none' : 'width 0.2s ease',

          // 【修改2】样式调整
          borderRight: '1px solid #E5E7EB', // 用边框代替阴影
          bgcolor: 'white',
          overflow: 'hidden' // 关键：禁止整体滚动，让 Logo 固定，只滚动内部的 Form
        }}
      >
        <DashboardSidebar />
      </Paper>

      {/* Resize Handle */}
      <Box
        onMouseDown={startResizing}
        sx={{
          width: 5,
          cursor: 'col-resize',
          resize: 'horizontal',
          bgcolor: 'transparent',
          // 让拖拽条稍微向左偏移覆盖住边框，便于点击
          marginLeft: '-2px',
          zIndex: 20,
          '&:hover': {
            bgcolor: '#4F46E5', // 统一使用你的主色调紫色
            width: 4 // hover 时变宽一点点
          },
          '&:active': {
            bgcolor: '#4338CA',
          },
          transition: 'background-color 0.2s',
        }}
      />

      {/* Main Area (Canvas) */}
      <Box sx={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
        position: 'relative',

        // 【修改3】增加浅灰色背景，衬托白色的 Canvas
        bgcolor: '#F3F4F6' // 或者 '#F9FAFB'
      }}>
        <DashboardMain />

        {/* Overlay while resizing */}
        {isResizing && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, cursor: 'col-resize' }} />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
