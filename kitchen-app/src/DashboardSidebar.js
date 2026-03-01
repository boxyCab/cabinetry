import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { updateKitchenInfo, selectKitchenId, updateCabinet, updateOthers, updateKitchenId, updateOthersReadOnly, updateOthersShowCanvas } from './store'; // 引入 initializeState Action
import postData from './api/postData';
import KitchenType from './KitchenType';
import KitchenIsland from './KitchenIsland';
import KitchenAppliSpeci from './KitchenAppliSpeci';
import { useSnackbar } from "./components/GlobalSnackbar";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Controller } from 'react-hook-form';
import checkFormData from './checkFormData';

const SectionHeader = ({ title, number }) => (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Box sx={{
            width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.main', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', mr: 1.5
        }}>
            {number}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#111827' }}>
            {title}
        </Typography>
    </Box>
);

const SectionCard = ({ children }) => (
    <Box sx={{
        bgcolor: 'white',
        borderRadius: 2,
        border: '1px solid #E5E7EB',
        p: 3,
        mb: 3,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    }}>
        {children}
    </Box>
);

const DashboardSidebar = () => {
    const dispatch = useDispatch();
    const showSnackbar = useSnackbar();
    const kitchenInfoRedux = useSelector((state) => state.data);
    const kitchenId = useSelector(selectKitchenId);
    const [dataReady, setDataReady] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const kitchenIsReadOnly = useSelector((state) => state.data.others.isReadOnly);
    const kitchenIsSearchLoaded = useSelector((state) => state.data.others.isSearchLoaded);

    // Initial State Structure
    const defaultValues = {
        kitchenObject: {
            id: null, kitchenName: "", shapeType: null, ceilingHeight: 0.0,
            construction1: 'BC1001', construction2: 'BC1001', construction3: 'BC1001',
            notes: ""
        },
        wallObjects: [],
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
        others: { canvasActiveId: 0, designCab: false, isReadOnly: false, isSearchLoaded: false },
        submitData: {},
        searchData: { searchKey: '', searchResult: [] },
    };

    const { control, reset, getValues, setValue, setError, trigger, formState: { errors }, clearErrors } = useForm({
        defaultValues: defaultValues,
        mode: 'onChange',
        shouldUnregister: false // 关键：确保即使组件卸载（由于条件渲染），其值也会保留在表单中
    });

    // 1. Sync Redux -> Form
    useEffect(() => {
        if (kitchenInfoRedux && Object.keys(kitchenInfoRedux).length > 0) {
            const currentFormId = getValues('kitchenObject.id');
            const currentFormReadOnly = getValues('others.isReadOnly');
            const currentFormSearchLoaded = getValues('others.isSearchLoaded');

            // Reset if ID changes OR if read-only/search-loaded status changes
            if (!dataReady ||
                kitchenInfoRedux.kitchenObject?.id !== currentFormId ||
                kitchenInfoRedux.others?.isReadOnly !== currentFormReadOnly ||
                kitchenInfoRedux.others?.isSearchLoaded !== currentFormSearchLoaded
            ) {
                const dataToReset = JSON.parse(JSON.stringify(kitchenInfoRedux));

                // Progressive Disclosure: Set shapeType to null initially to hide downstream sections
                if (!dataReady && dataToReset.kitchenObject && dataToReset.kitchenObject.shapeType === 'I') {
                    dataToReset.kitchenObject.shapeType = null;
                }

                reset(dataToReset);
                if (!dataReady) setDataReady(true);
            }
        }
    }, [kitchenInfoRedux, reset, dataReady, getValues]);

    // 2. Real-time Watch & Dispatch (Only updates Redux store, DOES NOT POST)
    const watchedData = useWatch({ control });

    useEffect(() => {
        if (!dataReady) return;
        // FIX: Deep clone watchedData before dispatching to Redux. 
        // Redux Toolkit freezes state/payloads in dev mode. If we pass the RHF state reference directly,
        // it gets frozen, causing RHF to crash when it tries to mutate it on the next update.
        const dataToUpdate = JSON.parse(JSON.stringify(watchedData));

        // Generate friendly names for the Redux store
        if (dataToUpdate.windowObjects) {
            dataToUpdate.windowObjects.forEach((win, index) => {
                win.name = `Window ${index + 1}`;
            });
        }
        if (dataToUpdate.doorObjects) {
            dataToUpdate.doorObjects.forEach((door, index) => {
                door.name = `Door ${index + 1}`;
            });
        }
        if (dataToUpdate.applianceObject) {
            const counters = {};
            dataToUpdate.applianceObject.forEach((app) => {
                const kind = app.appliancekind || 'Appliance';
                counters[kind] = (counters[kind] || 0) + 1;
                app.name = `${kind} ${counters[kind]}`;
            });
        }

        dispatch(updateKitchenInfo(dataToUpdate));
        // Removed auto-save call
    }, [watchedData, dispatch, dataReady]);


    // 3. Manual Generate Handler
    const handleGenerateDesign = async () => {
        setIsGenerating(true);
        console.log("DashboardSidebar: Generating Design...", getValues());

        try {
            const currentData = getValues();

            // A. Validation
            const isFormValid = await trigger();
            const validationContext = checkFormData(currentData);
            const isCustomValid = Object.keys(validationContext.errors).length === 0;

            if (!isFormValid || !isCustomValid) {
                console.warn("Validation Errors:", validationContext.errors);

                // Helper to extract messages from nested validationContext.errors
                const collectMessages = (errs) => {
                    let messages = [];
                    Object.values(errs).forEach(val => {
                        if (val && typeof val === 'object') {
                            if (val.message) {
                                messages.push(val.message);
                            } else {
                                messages = [...messages, ...collectMessages(val)];
                            }
                        }
                    });
                    return messages;
                };

                const customMessages = collectMessages(validationContext.errors);
                const snackMsg = customMessages.length > 0
                    ? (customMessages.length > 1 ? `${customMessages[0]} (and ${customMessages.length - 1} more)` : customMessages[0])
                    : "Please fix the errors in the form.";

                showSnackbar(snackMsg, "error");

                if (!isCustomValid) {
                    // Apply custom errors to form (Handling Nested Errors)
                    const setNestedErrors = (errors, prefix = '') => {
                        Object.entries(errors).forEach(([key, value]) => {
                            const path = prefix ? `${prefix}.${key}` : key;
                            if (value && typeof value === 'object' && value.message) {
                                // Leaf node with error message
                                setError(path, { type: value.type || 'manual', message: value.message });
                            } else if (value && typeof value === 'object') {
                                // Recursive call for nested objects
                                setNestedErrors(value, path);
                            }
                        });
                    };
                    setNestedErrors(validationContext.errors);
                }

                setIsGenerating(false);
                return;
            } else {
                // Clear validation errors in Redux if valid
            }

            // B. Prepare and Save Data (POST)
            const payload = {
                ...currentData,
                windowObjects: (currentData.windowObjects || []).map((w, i) => ({
                    ...w,
                    name: `Window ${i + 1}`,
                    id: w.id,
                    width: parseFloat(w.width),
                    height: parseFloat(w.height),
                    position: parseFloat(w.position),
                    wallId: w.wallId,
                })),
                doorObjects: (currentData.doorObjects || []).map((d, i) => ({
                    ...d,
                    name: `Door ${i + 1}`,
                    id: d.id,
                    width: parseFloat(d.width),
                    height: parseFloat(d.height),
                    position: parseFloat(d.position),
                    wallId: d.wallId,
                })),
                applianceObject: (() => {
                    const counters = {};
                    return (currentData.applianceObject || []).map((app) => {
                        const kind = app.appliancekind || 'Appliance';
                        counters[kind] = (counters[kind] || 0) + 1;
                        return {
                            ...app,
                            name: `${kind} ${counters[kind]}`,
                            width: parseFloat(app.width),
                            height: parseFloat(app.height),
                            position: parseFloat(app.position)
                        };
                    });
                })()
            };

            const saveResult = await postData(payload);
            if (saveResult && saveResult.error) {
                let errorMsg = saveResult.error;
                if (typeof errorMsg === 'string' && (errorMsg.trim().startsWith('<') || errorMsg.includes('Bad Gateway'))) {
                    errorMsg = "Server Error: Unable to connect to backend (502).";
                }
                showSnackbar("Save failed: " + errorMsg, "error");
                setIsGenerating(false);
                return;
            } else {
                dispatch(updateKitchenId(saveResult.kitchenId));
                dispatch(updateOthersShowCanvas(true));
            }

            // C. Regenerate Layout (Canvas) - Call API to get GLB/JSON
            const effectiveKitchenId = kitchenId || saveResult.kitchenId; // Use existing or new ID
            if (effectiveKitchenId) {
                console.log("DashboardSidebar: Regenerating layout for kitchenId:", effectiveKitchenId);
                const baseURL = window.location.hostname === 'localhost'
                    ? 'http://localhost'
                    : `http://${window.location.hostname}`;

                const genResponse = await axios.get(`${baseURL}/api/generateKitObj`, {
                    params: { kitchenId: effectiveKitchenId, flag: 2 },
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });

                if (genResponse.data) {
                    const fetchedCanvasobjectList = genResponse.data.cabinetObjectDtoList;
                    const cabinetobjectList = genResponse.data.cabinetDtoList;

                    let wallScale = "1";
                    const canvaswalls = [];
                    fetchedCanvasobjectList.forEach((obj) => {
                        if (obj.objectType === 'wall') {
                            wallScale = obj.scale;
                            // Ensure visibility is true for walls coming from the API unless explicitly false
                            const visibility = obj.visibility !== undefined ? obj.visibility : true;
                            canvaswalls.push({ ...obj, visibility });
                        } else if (obj.objectType === 'island' || obj.objectType === 'peninsula') {
                            canvaswalls.push(obj);
                        }
                    });

                    const updatedCabinetObject = {
                        ...kitchenInfoRedux.cabinet,
                        updateFlag: Date.now(), // 触发 DashboardMain/PageCarousel 重新加载 (Remount)
                        scale: wallScale, // Ensure scale is updated
                        canvasWallList: canvaswalls,
                        canvasObjectList: fetchedCanvasobjectList,
                        cabinetObjectList: cabinetobjectList
                    };

                    dispatch(updateCabinet(updatedCabinetObject));

                    const updateOthersObject = {
                        ...kitchenInfoRedux.others,
                        canvasActiveId: 0,
                        showCanvas: true
                    };
                    dispatch(updateOthers(updateOthersObject));

                    showSnackbar("Design generated successfully!", "success");
                    // 生成成功后禁用表单输入
                    dispatch(updateOthersReadOnly(true));
                }
            }
        } catch (error) {
            console.error("DashboardSidebar: Generation failed", error);
            showSnackbar("Generation failed. Please try again.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    // Handlers needed by child components
    const setByShapeType = (shapeType) => {
        const wallMap = {
            'I': { visibility: [true, false, false, false] },
            'II': { visibility: [true, true, false, false] },
            'L': { visibility: [true, true, false, false] },
            'U': { visibility: [true, true, true, false] },
            'O': { visibility: [true, true, true, true] },
            'S': { visibility: [false, false, false, false] },
        };
        let { visibility: wallVisibilityValues } = wallMap[shapeType] || { visibility: [true, false, false, false] };

        const currentWalls = getValues('wallObjects');
        if (Array.isArray(currentWalls)) {
            // Clone walls to update visibility (using JSON to be safe)
            const updatedWalls = JSON.parse(JSON.stringify(currentWalls)).map((wall, index) => {
                const isVisible = wallVisibilityValues[index];
                return {
                    ...wall,
                    visibility: isVisible,
                    width: isVisible ? wall.width : 0,
                    isUpperCabinetPlaced: isVisible ? wall.isUpperCabinetPlaced : false,
                    isLowerCabinetPlaced: isVisible ? wall.isLowerCabinetPlaced : false,
                    pantryRequired: isVisible ? wall.pantryRequired : false,
                };
            });
            setValue('wallObjects', updatedWalls);
        }

        // Update shape type
        setValue('kitchenObject.shapeType', shapeType);

        // Delete windows and doors for invisible walls
        const wallIdMap = {
            0: 'one',
            1: 'two',
            2: 'three',
            3: 'four'
        };
        const invisibleWallIds = wallVisibilityValues
            .map((visible, index) => visible ? null : wallIdMap[index])
            .filter(id => id !== null);

        if (invisibleWallIds.length > 0) {
            const currentWindows = getValues('windowObjects') || [];
            const currentDoors = getValues('doorObjects') || [];

            const updatedWindows = currentWindows.filter(win => !invisibleWallIds.includes(win.wallId));
            const updatedDoors = currentDoors.filter(door => !invisibleWallIds.includes(door.wallId));

            setValue('windowObjects', updatedWindows);
            setValue('doorObjects', updatedDoors);
        }

        // FIX: Deep clone form data before dispatching to Redux.
        // Direct dispatch freezes the object reference, causing subsequent RHF updates (like typing kitchen name) to crash.
        const dataToDispatch = JSON.parse(JSON.stringify(getValues()));
        dispatch(updateKitchenInfo(dataToDispatch));
    };

    const setByIslandKind = (kind) => {
        setValue('islandObject.islandKind', kind);
    }

    if (!dataReady) return (
        <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
            <Typography sx={{ color: '#6B7280' }}>Loading Kitchen Data...</Typography>
        </Box>
    );

    const hasShapeSelected = !!watchedData.kitchenObject?.shapeType;

    return (
        // 1. 外层容器：占满高度，垂直排列，禁止滚动 (滚动逻辑下放)
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'white'
        }}>

            {/* 2. 顶部 Logo 区：固定高度，不随表单滚动 */}
            <Box sx={{
                px: 3,
                py: 2.5, // 稍微高一点的 padding 让 Logo 呼吸感更好
                borderBottom: '1px solid #E5E7EB', // 分割线
                bgcolor: 'white',
                flexShrink: 0, // 防止被挤压
                display: 'flex',
                alignItems: 'center'
            }}>
                <img
                    src="/boxylogo.jpg"
                    alt="Boxy Logo"
                    style={{ height: '28px', width: 'auto' }} // Logo 尺寸微调，适应侧边栏
                />
            </Box>

            {/* 3. 内容滚动区：占据剩余空间，内部滚动 */}
            <Box sx={{
                flex: 1,
                overflowY: 'auto', // 关键：只有这里滚动
                p: 3,
                bgcolor: '#F9FAFB',
                pb: 10, // 底部留白，防止按钮贴底
                // 美化滚动条 (Chrome/Safari)
                '&::-webkit-scrollbar': { width: '6px' },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#D1D5DB', borderRadius: '3px' },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#9CA3AF' }
            }}>

                {/* 原有的标题和描述 */}
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#111827', fontSize: '1.25rem' }}>
                    Design Your Kitchen
                </Typography>
                <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
                    Follow the steps below to configure your layout.
                </Typography>
                {/* --- 以下是你原来代码中的所有 Section 内容，保持不变 --- */}

                {/* Section 1: Kitchen Layout */}
                <SectionHeader number="1" title="Kitchen Layout" />
                <SectionCard>
                    <KitchenType
                        control={control}
                        wallObjects={watchedData.wallObjects}
                        setByShapeType={setByShapeType}
                        errors={errors}
                        getValues={getValues}
                        setValue={setValue}
                        disabled={kitchenIsReadOnly}
                    />
                </SectionCard>

                {/* Sections 2-5: Hidden until Shape is Selected */}
                {hasShapeSelected && (
                    <>
                        <SectionHeader number="2" title="Kitchen Island" />
                        <SectionCard>
                            <KitchenIsland
                                control={control}
                                shapeType={watchedData.kitchenObject?.shapeType || 'I'}
                                islandObject={watchedData.islandObject}
                                setIslandObject={(val) => {
                                    const newVal = typeof val === 'function' ? val(watchedData.islandObject) : val;
                                    setValue('islandObject', newVal);
                                }}
                                setByIslandKind={setByIslandKind}
                                getValues={getValues}
                                setValue={setValue}
                                clearErrors={clearErrors}
                                disabled={kitchenIsReadOnly}
                            />
                        </SectionCard>

                        <SectionHeader number="3" title="Appliances" />
                        <SectionCard>
                            <KitchenAppliSpeci
                                control={control}
                                shapeType={watchedData.kitchenObject?.shapeType || 'I'}
                                applianceObject={watchedData.applianceObject}
                                setApplianceObject={(val) => {
                                    const newVal = typeof val === 'function' ? val(watchedData.applianceObject) : val;
                                    setValue('applianceObject', newVal);
                                }}
                                getValues={getValues}
                                setValue={setValue}
                                disabled={kitchenIsReadOnly}
                            />
                        </SectionCard>

                        <SectionHeader number="4" title="Add Details (Optional)" />
                        <SectionCard>
                            <Controller
                                name="kitchenObject.notes"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        multiline
                                        minRows={3}
                                        fullWidth
                                        placeholder="e.g., Place a sink under the window on Wall A. Cabinet color: navy blue."
                                        variant="outlined"
                                        size="small"
                                        disabled={kitchenIsReadOnly}
                                        sx={{ bgcolor: 'white' }} // 输入框背景设为白色，更清晰
                                    />
                                )}
                            />
                        </SectionCard>





                        <Box sx={{ mt: 4, mb: 2 }}>
                            <Button
                                variant="contained"
                                fullWidth
                                size="large"
                                onClick={handleGenerateDesign}
                                disabled={isGenerating || kitchenIsReadOnly}
                                startIcon={<AutoAwesomeIcon />}
                                sx={{
                                    bgcolor: '#4F46E5', // 使用具体的紫色值，确保统一
                                    color: 'white',
                                    py: 1.5,
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: 2, // 稍微圆润一点
                                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.1), 0 2px 4px -1px rgba(79, 70, 229, 0.06)',
                                    '&:hover': {
                                        bgcolor: '#4338CA',
                                        boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.2)'
                                    },
                                    '&:disabled': {
                                        bgcolor: '#E5E7EB',
                                        color: '#9CA3AF'
                                    }
                                }}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Design'}
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default DashboardSidebar;
