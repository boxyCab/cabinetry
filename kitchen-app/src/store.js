import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create Slice
const mySlice = createSlice({
  name: 'myData',
  initialState: {
    data: { // kitchen info
      kitchenObject: {
        id: null,
        kitchenName: "",
        shapeType: "I",
        ceilingHeight: 96.0,
        construction1: '',  //
        construction2: '',  //
        construction3: '',  // Island
        notes: "",
      },
      // wall info
      wallObjects: [
        {
          wallid: 1,
          visibility: true,
          kitchen_id: null,
          wallName: "Wall One",
          width: 0.0,
          height: 0.0,
          angle: 0.0,
          position: '',
          other_wall_id1: null,
          other_wall_id2: null,
          other_wall_id3: null,
          isLowerCabinetPlaced: false,
          isUpperCabinetPlaced: false,
          pantryRequired: false,
        },
        {
          wallid: 2, // INT
          visibility: false,
          kitchen_id: null, // INT
          wallName: "Wall Two",
          width: 0.0, // FLOAT
          height: 0.0, // FLOAT
          angle: 0.0, // FLOAT
          position: '', // VARCHAR
          other_wall_id1: null, // INT
          other_wall_id2: null, // INT
          other_wall_id3: null, // INT
          isLowerCabinetPlaced: false, // VARCHAR
          isUpperCabinetPlaced: false // VARCHAR
        }, {
          wallid: 3, // INT
          visibility: false,
          kitchen_id: null, // INT
          wallName: "Wall Three",
          width: 0.0, // FLOAT
          height: 0.0, // FLOAT
          angle: 0.0, // FLOAT
          position: '', // VARCHAR
          other_wall_id1: null, // INT
          other_wall_id2: null, // INT
          other_wall_id3: null, // INT
          isLowerCabinetPlaced: false, // VARCHAR
          isUpperCabinetPlaced: false // VARCHAR
        }, {
          wallid: 4, // INT
          visibility: false,
          kitchen_id: null, // INT
          wallName: "Wall Four",
          width: 0.0, // FLOAT
          height: 0.0, // FLOAT
          angle: 0.0, // FLOAT
          position: '', // VARCHAR
          other_wall_id1: null, // INT
          other_wall_id2: null, // INT
          other_wall_id3: null, // INT
          isLowerCabinetPlaced: false, // VARCHAR
          isUpperCabinetPlaced: false // VARCHAR
        },],
      // window info
      windowObjects: [],
      // door info
      doorObjects: [],
      // appliance info
      applianceObject: [],
      islandObject: {
        islandKind: "none",
        width: 0,
        length: 0,
        peninsulaisadjacentto: 'one',
        horverType: 'H',
        isOverhang: false,
        isWaterfall: false,
      },
      cabinet: {
        loadFinished: false,
        scale: 1,
        updateFlag: 0,
        canvasId: 1,
        canvasWallList: [],
        canvasObjectList: [],
        cabinetObjectList: [],

      },
      submitData: {},
      others: {
        canvasActiveId: 99,
        designCab: false,
        isReadOnly: false,
        isSearchLoaded: false,
        showCanvas: true,
        searchPreviewData: null,
      },
      searchData: {
        searchKey: '',
        searchResult: [],
      },

      loading: false,
      error: null,
    },
  },
  reducers: {
    initialize: (state, action) => {
      state.data = action.payload;
    },
    updateKitchenInfo: (state, action) => {
      state.data = action.payload;
    },
    loadData: (state) => {
      state.loading = true;
      state.error = null; // Reset error when loading starts
    },
    loadDataSuccess: (state) => {
      state.loading = false;
      state.error = null;  // 数据加载成功时重置错误
    },
    loadDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload; // Set error message
    },
    // In your Redux slice
    updateApplianceObject: (state, action) => {
      state.data.applianceObject = action.payload;
    },
    updateIslandObject: (state, action) => {
      state.data.islandObject = action.payload;
    },
    updateDoorObject: (state, action) => {
      state.data.doorObjects = action.payload;
    },
    updatewindowsObject: (state, action) => {
      state.data.windowObjects = action.payload;
    },
    updateWallsObject: (state, action) => {
      state.data.wallObjects = action.payload;
    },
    updateKitchenObject: (state, action) => {
      state.data.kitchenObject = action.payload;
    },
    updateKitchenId: (state, action) => {
      state.data.kitchenObject.id = action.payload;
    },
    updateCabinet: (state, action) => {
      state.data.cabinet = action.payload;
    },
    updateOthers: (state, action) => {
      state.data.others = action.payload;
    },
    updateOthersReadOnly: (state, action) => {
      state.data.others.isReadOnly = action.payload;
    },
    updateOthersShowCanvas: (state, action) => {
      state.data.others.showCanvas = action.payload;
    },
    updateOthersCanvasActiveId: (state, action) => {
      state.data.others.canvasActiveId = action.payload;
    },
    updateSearchData: (state, action) => {
      state.data.searchData = action.payload;
    },
    updatecanvasObjectList: (state, action) => {
      state.data.cabinet.canvasObjectList = action.payload;
    },
    updatecabinetObjectList: (state, action) => {
      state.data.cabinet.cabinetObjectList = action.payload;
    },
    updateupdateFlag: (state, action) => {
      state.data.cabinet.updateFlag = action.payload;
    },
    updateSubmitData: (state, action) => {
      state.data.submitData = action.payload;
    },
  },

});
console.log(mySlice.actions);
// 选择器：获取 kitchenObject 的 id
export const selectKitchenId = (state) => state.data.kitchenObject.id;
export const selectKitchenShapeType = (state) => state.data.kitchenObject.shapeType;
export const selectConstruction1 = (state) => state.data.kitchenObject.construction1;
export const selectConstruction2 = (state) => state.data.kitchenObject.construction2;
export const selectConstruction3 = (state) => state.data.kitchenObject.construction3;
export const selectCabinetScale = (state) => state.data.cabinet.scale;
export const selectCabinetFlag = (state) => state.data.cabinet.updateFlag;
export const selectCabinetCanvasId = (state) => state.data.cabinet.canvasId;
// export const selectCabinetObject = (state) => state.data.cabinet;

export const selectCabinetObject = (state) => ({
  ...state.data.cabinet // 确保返回新对象
});

export const selectCabinetCanvasObject = (state) => state.data.cabinet.canvasObjectList;
export const selectCabinetCabObject = (state) => state.data.cabinet.cabinetObjectList;
export const selectOthers = (state) => state.data.others;
export const selectCeilingHeight = (state) => state.data.kitchenObject.ceilingHeight;
export const selectSubmitData = (state) => state.data.submitData;

// export const selectWindowList = (state) => state.data.windowObjects;
export const selectSearchData = (state) => state.data.searchData;
export const selectIsReadOnly = (state) => state.data.others.isReadOnly;
export const selectIsSearchLoaded = (state) => state.data.others.isSearchLoaded;
export const selectSearchPreviewData = (state) => state.data.others.searchPreviewData;
// Export actions
export const { initialize, updateKitchenInfo, loadData, updateApplianceObject, updateIslandObject, updateDoorObject, updatewindowsObject, updateKitchenObject,
  updateWallsObject, updateKitchenId, updateCabinet, updateOthers, updateSearchData, updatecanvasObjectList, updatecabinetObjectList, updateupdateFlag,
  updateSubmitData, updateOthersReadOnly, updateOthersShowCanvas, updateOthersCanvasActiveId } = mySlice.actions;

// Redux Store
const store = configureStore({
  reducer: mySlice.reducer,
});

export default store;
