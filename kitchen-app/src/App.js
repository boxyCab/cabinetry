import React, { useEffect } from 'react';
import { AppBar, Toolbar, Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Dashboard from './Dashboard';
import { CanvasProvider } from './CanvasContext';
import { ErrorProvider } from './common/ErrorProvider';
import { ErrorBoundary } from './common/ErrorBoundary';
import { SnackbarProvider } from './components/GlobalSnackbar';
import { initialize } from './store';
import { useDispatch } from 'react-redux';
import './App.css';

// Custom Theme Definition
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },
  palette: {
    primary: {
      main: '#4F46E5', // Indigo 600
    },
    background: {
      default: '#F3F4F6', // Gray 100
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827', // Gray 900
      secondary: '#6B7280', // Gray 500
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#4338CA', // Indigo 700
          }
        }
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1, // Keep styling clean
          }
        }
      }
    }
  },
});

// 生成唯一 ID 的函数
const generateUniqueId = () => {
  return `user-${Date.now()}`;
};

const saveUserId = (userId) => {
  localStorage.setItem('userId', userId);
};

const loadUserId = () => {
  return localStorage.getItem('userId');
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Correct initial structure matching store.js
    let initialData = {
      kitchenObject: {
        id: null,
        kitchenName: "",
        shapeType: "I",
        ceilingHeight: 0.0,
        construction1: '',
        construction2: '',
        construction3: '',
      },
      wallObjects: [
        { wallid: 1, visibility: true, kitchen_id: null, wallName: "Wall One", width: 0.0, height: 0.0, angle: 0.0, position: '', other_wall_id1: null, other_wall_id2: null, other_wall_id3: null, isLowerCabinetPlaced: false, isUpperCabinetPlaced: false, pantryRequired: false },
        { wallid: 2, visibility: false, kitchen_id: null, wallName: "Wall Two", width: 0.0, height: 0.0, angle: 0.0, position: '', isLowerCabinetPlaced: false, isUpperCabinetPlaced: false },
        { wallid: 3, visibility: false, kitchen_id: null, wallName: "Wall Three", width: 0.0, height: 0.0, angle: 0.0, position: '', isLowerCabinetPlaced: false, isUpperCabinetPlaced: false },
        { wallid: 4, visibility: false, kitchen_id: null, wallName: "Wall Four", width: 0.0, height: 0.0, angle: 0.0, position: '', isLowerCabinetPlaced: false, isUpperCabinetPlaced: false },
      ],
      windowObjects: [],
      doorObjects: [],
      applianceObject: [],
      islandObject: {
        islandKind: "none",
        width: 0,
        length: 0,
        peninsulaisadjacentto: 'one',
        horverType: 'H',
        isOverhang: false,
        isWaterfall: false
      },
      cabinet: {
        scale: 0,
        canvasId: 1,
        updateFlag: 0,
        canvasObjectList: [],
        cabinetObjectList: []
      },
      others: { canvasActiveId: 99, designCab: false },
      submitData: {},
      searchData: { searchKey: '', searchResult: [] },
    };

    let existingUserId = loadUserId();
    if (!existingUserId) {
      existingUserId = generateUniqueId();
      saveUserId(existingUserId);
      console.log('New User ID:', existingUserId);
      dispatch(initialize(initialData));
    } else {
      console.log('Existing User ID:', existingUserId);
      // Logic to load existing user data could go here if implemented
      dispatch(initialize(initialData)); // For now, always init default for testing refactor
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* 修改点 1: 全屏容器 
        设置 100vh 和 overflow: hidden，防止出现双重滚动条。
        布局完全交给内部的 Dashboard 组件处理。
      */}
      <Box sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 关键：禁止整个页面滚动，只允许内部区域滚动
        bgcolor: '#F3F4F6'  // 可选：设置一个统一的底层背景色
      }}>

        {/* 修改点 2: 删除了顶部的黑色条 (div) 和 AppBar 
           Logo 将被移动到 DashboardSidebar 组件中。
        */}

        <ErrorProvider>
          <SnackbarProvider>
            <ErrorBoundary>
              <CanvasProvider>
                {/* Dashboard 接管所有可视区域 */}
                <Dashboard />
              </CanvasProvider>
            </ErrorBoundary>
          </SnackbarProvider>
        </ErrorProvider>

      </Box>
    </ThemeProvider>
  );
}

export default App;
