import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, IconButton, Drawer, Checkbox, FormControlLabel, Tooltip, Avatar, Divider, Grid } from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BrushIcon from '@mui/icons-material/Brush';
import SettingsIcon from '@mui/icons-material/Settings';
import DescriptionIcon from '@mui/icons-material/Description';
import PageCarousel from './components/PageCarousel';
import { updateCabinet, updateKitchenId, selectCabinetObject, selectKitchenId, selectSearchPreviewData, updateOthersShowCanvas, updateOthersCanvasActiveId, selectOthers } from './store';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import KitchenIcon from '@mui/icons-material/Kitchen';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import WindowIcon from '@mui/icons-material/Window';
import DeckIcon from '@mui/icons-material/Deck';
import SearchDesign from './SearchDesign';
import TabDrawer from './TabDrawer';
import { useDispatch, useSelector } from 'react-redux';

const DashboardMain = () => {
    const dispatch = useDispatch();
    const cabinetObject = useSelector(selectCabinetObject);
    const searchPreviewData = useSelector(selectSearchPreviewData);
    const kitchenId = useSelector(selectKitchenId);
    const others = useSelector(selectOthers);
    const showCanvas = others.showCanvas;

    // Check if design has been generated (has canvas data) or loaded (has kitchenId)
    const [hasGeneratedDesign, setHasGeneratedDesign] = useState(!!kitchenId || (cabinetObject?.canvasObjectList?.length > 0));

    // Keep hasGeneratedDesign in sync with Redux updates
    useEffect(() => {
        if (!!kitchenId || (cabinetObject?.canvasObjectList?.length > 0)) {
            setHasGeneratedDesign(true);
        }
    }, [kitchenId, cabinetObject?.canvasObjectList]);

    // Drawer States
    const [openCabinets, setOpenCabinets] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);

    // Track if the current kitchen was loaded via Search/Show Design
    const [searchLoadedKitchenId, setSearchLoadedKitchenId] = useState(null);

    const handleSearchSubmit = (flag, id) => {
        setOpenSearch(false);
        setHasGeneratedDesign(true);

        if (flag === 1) {  // unlock
            dispatch(updateOthersShowCanvas(false));
        } else if (flag === 2) {  // show design
            dispatch(updateOthersShowCanvas(true));
            dispatch(updateOthersCanvasActiveId(0));
        }
        if (id) {
            // Track that this ID was loaded from search
            setSearchLoadedKitchenId(id);

            // Clear current cabinet state to ensure a clean "soft refresh"
            dispatch(updateCabinet({
                loadFinished: false,
                scale: 1,
                updateFlag: 0,
                canvasId: 1,
                canvasWallList: [],
                canvasObjectList: [],
                cabinetObjectList: [],
            }));
            // Update the kitchen ID to trigger remount and data fetch
            dispatch(updateKitchenId(id));
        }
    };

    // Determine input flag: 'fromDrawer' (Load) if from search, else default to 'fromGenerate'
    const carouselInputFlg = (kitchenId && kitchenId === searchLoadedKitchenId) ? "fromDrawer" : "fromGenerate";

    if (!hasGeneratedDesign) {
        // Show empty state before generation
        return (
            <Box sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#F3F4F6', // Lighter background
                p: 4
            }}>
                <Paper elevation={0} sx={{
                    p: 6,
                    textAlign: 'center',
                    borderRadius: 4,
                    maxWidth: 600,
                    bgcolor: 'white',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 2 }}>
                        Welcome to Kitchen Designer
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280', mb: 6, fontSize: '1.1rem' }}>
                        Ready to transform your space? Configure your kitchen in the sidebar and click "Generate Design" below, or explore our library and previous work.
                    </Typography>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                        <Paper
                            variant="outlined"
                            onClick={() => setOpenCabinets(true)}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '2px solid #E5E7EB',
                                '&:hover': {
                                    borderColor: '#4F46E5',
                                    bgcolor: '#F5F3FF',
                                    transform: 'translateY(-4px)'
                                },
                                flex: 1
                            }}
                        >
                            <LibraryBooksIcon sx={{ fontSize: 40, color: '#4F46E5', mb: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                                View Cabinets
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                Browse our library of units
                            </Typography>
                        </Paper>

                        <Paper
                            variant="outlined"
                            onClick={() => setOpenSearch(true)}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: '2px solid #E5E7EB',
                                '&:hover': {
                                    borderColor: '#4F46E5',
                                    bgcolor: '#F5F3FF',
                                    transform: 'translateY(-4px)'
                                },
                                flex: 1
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 40, color: '#4F46E5', mb: 2 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                                Search Designs
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280' }}>
                                Load a previous project
                            </Typography>
                        </Paper>
                    </Stack>
                </Paper>

                {/* Drawers rendered here for initial state access */}
                <SharedDrawers
                    openCabinets={openCabinets}
                    setOpenCabinets={setOpenCabinets}
                    openSearch={openSearch}
                    setOpenSearch={setOpenSearch}
                    handleSearchSubmit={handleSearchSubmit}
                />
            </Box>
        );
    }

    // Show PageCarousel with all views after generation
    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column', // 垂直布局：上Header，下内容
            bgcolor: '#F3F4F6',      // 统一底色
            overflow: 'hidden'       // 防止双重滚动
        }}>
            {/* --- A. 顶部工具栏 (Header) --- */}
            <Box sx={{
                p: 1.5,
                bgcolor: 'white',
                borderBottom: '1px solid #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 3
            }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DescriptionIcon sx={{ color: '#4F46E5' }} />
                    {showCanvas ? "Visual Design View" : "Design Specification Hub"}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel
                        disabled={!others.isReadOnly}
                        control={
                            <Checkbox
                                checked={showCanvas}
                                onChange={(e) => dispatch(updateOthersShowCanvas(e.target.checked))}
                                color="primary"
                                size="small"
                                disabled={!others.isReadOnly}
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{
                                fontWeight: 600,
                                color: others.isReadOnly ? '#374151' : '#9CA3AF'
                            }}>
                                {showCanvas ? "Live Preview" : "Show Visuals"}
                            </Typography>
                        }
                    />
                    {/* <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Tooltip title="Search New Designs">
                        <IconButton onClick={() => setOpenSearch(true)} size="small" sx={{
                            bgcolor: '#F3F4F6',
                            '&:hover': { bgcolor: '#E5E7EB' },
                            color: '#4F46E5'
                        }}>
                            <SearchIcon fontSize="small" />
                        </IconButton>
                    </Tooltip> */}
                </Stack>
            </Box>
            {/* --- B. 核心内容区域 (Carousel / Canvas) --- */}
            <Box sx={{
                flex: 1,            // 占满剩余高度
                position: 'relative',
                overflow: 'hidden',  // 确保内容溢出时是 Carousel 内部处理，而不是撑开外层
                display: showCanvas ? 'flex' : 'none' // Conditional visibility
            }}>
                <PageCarousel
                    key={kitchenId}
                    paramKitchenId={kitchenId}
                    inputFlg={carouselInputFlg}
                    refresh={cabinetObject?.updateFlag}
                    // 将打开弹窗的方法也传给 Carousel (万一 Carousel 内部也有按钮)
                    onOpenCabinets={() => setOpenCabinets(true)}
                    onOpenSearch={() => setOpenSearch(true)}
                />
            </Box>

            {/* --- Hub Placeholder when visual is hidden --- */}
            {!showCanvas && (
                <Box sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    bgcolor: '#F9FAFB'
                }}>
                    {/* 1. Project Overview Card */}
                    <Paper elevation={0} sx={{
                        p: 4,
                        borderRadius: 4,
                        border: '1px solid #E5E7EB',
                        bgcolor: 'white',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                                    Design Specification Hub
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ mb: 4 }} />

                        {/* 1. Basic Information */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B7280', mb: 2, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1 }}>
                                <KitchenIcon fontSize="small" sx={{ color: '#4F46E5' }} /> BASIC INFORMATION
                            </Typography>
                            <Box sx={{ ml: 4, display: 'grid', gridTemplateColumns: { xs: '1r', sm: '1fr 1fr' }, gap: 2 }}>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    ID: <strong>{kitchenId || 'N/A'}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    Name: <strong>{searchPreviewData?.kitchenObject?.kitchenName || 'N/A'}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    Shape: <strong>{searchPreviewData?.kitchenObject?.shapeType ? (
                                        searchPreviewData.kitchenObject.shapeType === 'I' ? 'I-Shape' :
                                            searchPreviewData.kitchenObject.shapeType === 'II' ? 'Galley/II-Shape' :
                                                searchPreviewData.kitchenObject.shapeType === 'L' ? 'L-Shape' :
                                                    searchPreviewData.kitchenObject.shapeType === 'U' ? 'U-Shape' :
                                                        searchPreviewData.kitchenObject.shapeType === 'O' ? 'O-Shape' :
                                                            searchPreviewData.kitchenObject.shapeType
                                    ) : '-'}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    Ceiling: <strong>{searchPreviewData?.kitchenObject?.ceilingHeight || 0} Inches</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    Upper Style: <strong>{searchPreviewData?.kitchenObject?.construction1 || 'None'}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    Lower Style: <strong>{searchPreviewData?.kitchenObject?.construction2 || 'None'}</strong>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#374151' }}>
                                    Island Style: <strong>{searchPreviewData?.kitchenObject?.construction3 || 'None'}</strong>
                                </Typography>
                            </Box>
                        </Box>

                        {/* 2. Wall Configuration */}
                        {searchPreviewData?.wallObjects && searchPreviewData.wallObjects.filter(w => w.visibility).length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B7280', mb: 2, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1 }}>
                                    <DeckIcon fontSize="small" sx={{ color: '#10B981' }} /> WALL CONFIGURATION
                                </Typography>
                                <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {searchPreviewData.wallObjects.filter(w => w.visibility).map((wall, idx) => (
                                        <Typography key={idx} variant="body2" sx={{ color: '#374151' }}>
                                            Wall {idx + 1}: <strong>{wall.width} Inches × {wall.height || 96} Inches</strong>
                                            {wall.angle && ` (${wall.angle}°)`}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* 3. Openings */}
                        {((searchPreviewData?.windowObjects && searchPreviewData.windowObjects.filter(w => w.hasWindow).length > 0) ||
                            (searchPreviewData?.doorObjects && searchPreviewData.doorObjects.filter(d => d.hasDoor).length > 0)) && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6B7280', mb: 2, display: 'flex', alignItems: 'center', gap: 1, letterSpacing: 1 }}>
                                        <DoorFrontIcon fontSize="small" sx={{ color: '#EF4444' }} /> OPENINGS
                                    </Typography>
                                    <Box sx={{ ml: 4, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {searchPreviewData.windowObjects?.filter(w => w.hasWindow).map((win, idx) => (
                                            <Typography key={`win-${idx}`} variant="body2" sx={{ color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <WindowIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                Wall {win.wallId || 'N/A'}: Window <strong>{win.width} Inches × {win.height} Inches</strong> @ {win.position} Inches
                                            </Typography>
                                        ))}
                                        {searchPreviewData.doorObjects?.filter(d => d.hasDoor).map((door, idx) => (
                                            <Typography key={`door-${idx}`} variant="body2" sx={{ color: '#374151', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <DoorFrontIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                                Wall {door.wallId || 'N/A'}: Door <strong>{door.width} Inches × {door.height} Inches</strong> @ {door.position} Inches
                                            </Typography>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                    </Paper>

                    {/* 2. Quick Action Tiles */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#374151', fontWeight: 700, mb: 3 }}>
                            Explore & Iterate
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <Paper
                                    onClick={() => others.isReadOnly && dispatch(updateOthersShowCanvas(true))}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        cursor: others.isReadOnly ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.2s',
                                        border: '2px solid transparent',
                                        opacity: others.isReadOnly ? 1 : 0.6,
                                        '&:hover': others.isReadOnly ? {
                                            borderColor: '#4F46E5',
                                            bgcolor: 'white',
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        } : {}
                                    }}>
                                    <Avatar sx={{ bgcolor: '#EEF2FF', width: 64, height: 64 }}>
                                        <VisibilityIcon sx={{ color: '#4F46E5', fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Visual Design View</Typography>
                                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                            Switch to the 2D/3D canvas to visualize the kitchen layout and interact with components.
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper
                                    onClick={() => setOpenSearch(true)}
                                    sx={{
                                        p: 4,
                                        borderRadius: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 3,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: '2px solid transparent',
                                        '&:hover': {
                                            borderColor: '#10B981',
                                            bgcolor: 'white',
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }
                                    }}>
                                    <Avatar sx={{ bgcolor: '#ECFDF5', width: 64, height: 64 }}>
                                        <SearchIcon sx={{ color: '#10B981', fontSize: 32 }} />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>Select Different Design</Typography>
                                        <Typography variant="body2" sx={{ color: '#6B7280' }}>
                                            Browse more designs from the project library or search for specific design IDs.
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            )}

            {/* --- C. 全局弹窗/抽屉 (Drawers) --- */}
            <SharedDrawers
                openCabinets={openCabinets}
                setOpenCabinets={setOpenCabinets}
                openSearch={openSearch}
                setOpenSearch={setOpenSearch}
                handleSearchSubmit={handleSearchSubmit}
            />
        </Box>
    );
};

// Helper component for Drawers to avoid duplication
const SharedDrawers = ({ openCabinets, setOpenCabinets, openSearch, setOpenSearch, handleSearchSubmit }) => (
    <>
        <Drawer
            anchor="right"
            open={openCabinets}
            onClose={() => setOpenCabinets(false)}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 600 },
                    bgcolor: '#F9FAFB'
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid #E5E7EB',
                bgcolor: 'white'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                    Cabinet Library
                </Typography>
                <IconButton onClick={() => setOpenCabinets(false)} sx={{ color: '#6B7280' }}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box sx={{ p: 2, overflow: 'auto', height: '100%' }}>
                <TabDrawer />
            </Box>
        </Drawer>

        <Drawer
            anchor="right"
            open={openSearch}
            onClose={() => setOpenSearch(false)}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 550 },
                    bgcolor: '#F9FAFB'
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2,
                borderBottom: '1px solid #E5E7EB',
                bgcolor: 'white'
            }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                    Search Kitchen Designs
                </Typography>
                <IconButton onClick={() => setOpenSearch(false)} sx={{ color: '#6B7280' }}>
                    <CloseIcon />
                </IconButton>
            </Box>
            <Box sx={{ overflow: 'auto', height: '100%' }}>
                <SearchDesign handleSubmitData={handleSearchSubmit} />
            </Box>
        </Drawer>
    </>
);

export default DashboardMain;
