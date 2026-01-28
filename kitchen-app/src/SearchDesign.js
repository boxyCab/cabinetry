import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Paper,
  InputBase,
  Divider,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Button,
  Card
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircle from '@mui/icons-material/CheckCircle';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';

import fetchSearchData from './api/fetchSearchData';
import fetchData from './api/fetchData';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateKitchenInfo,
  selectSearchData,
  updateSearchData,
  updateOthers,
  updateCabinet,
  selectIsReadOnly,
  selectIsSearchLoaded,
  selectSearchPreviewData
} from './store';
import { mapFetchedDataToFormFormat } from './utils/dataMapper';
import { useSnackbar } from "./components/GlobalSnackbar";
import KitchenDataDisplay from './KitchenDataDisplay';

const SearchDesign = ({ handleSubmitData }) => {
  const dispatch = useDispatch();
  const showSnackbar = useSnackbar();

  // Redux Selectors
  const kitcheninfoS = useSelector((state) => state.data);
  const searchD = useSelector(selectSearchData);
  const isReadOnly = useSelector(selectIsReadOnly);
  const isSearchLoaded = useSelector(selectIsSearchLoaded);
  const searchPreviewData = useSelector(selectSearchPreviewData);

  // Local States
  const [searchText, setSearchText] = useState(searchD.searchKey || '');
  const [data, setData] = useState([]);
  const [isVisibleDiv, setIsVisibleDiv] = useState(true);
  const [isVisibleList, setIsVisibleList] = useState(false);

  // Sync search results from Redux (Only on search result changes)
  useEffect(() => {
    const updatedData = (searchD.searchResult || []).map((item, index) => ({
      id: (index + 1).toString(),
      primary: `Kitchen ID: ${item.kitchenId}`,
      secondary: item.kitchenName || item.secondary,
      clicked: (searchPreviewData?.kitchenObject?.id === item.kitchenId) || (kitcheninfoS.kitchenObject?.id === item.kitchenId),
      kitchenId: item.kitchenId
    }));
    setData(updatedData);
    if (updatedData.length > 0) {
      setIsVisibleList(true);
      setIsVisibleDiv(false);
    }
  }, [searchD.searchResult, searchPreviewData?.kitchenObject?.id, kitcheninfoS.kitchenObject?.id]);

  const handleInputChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleSearchClick = async () => {
    // if (!searchText.trim()) return;
    try {
      // Clear current loaded preview when starting a new search
      dispatch(updateOthers({
        ...kitcheninfoS.others,
        isSearchLoaded: false,
        searchPreviewData: null
      }));

      let result = await fetchSearchData(searchText);
      setIsVisibleList(true);
      setIsVisibleDiv(false);

      const updatedData = result.map((item, index) => ({
        id: (index + 1).toString(),
        primary: `Kitchen ID: ${item.kitchenId}`,
        secondary: item.kitchenName,
        clicked: false,
        kitchenId: item.kitchenId
      }));

      dispatch(updateSearchData({
        searchKey: searchText,
        searchResult: updatedData
      }));
    } catch (error) {
      showSnackbar('Search failed. Please try again.', 'error');
    }
  };

  const handleSelectKitchen = async (itemId) => {
    try {
      let fullData = await fetchData(itemId);
      const mappedData = mapFetchedDataToFormFormat(fullData);

      // Only set the preview data, DO NOT update the main kitchen info yet
      // This prevents the Sidebar from refreshing immediately
      dispatch(updateOthers({
        ...kitcheninfoS.others,
        isReadOnly: true,
        isSearchLoaded: true,
        searchPreviewData: mappedData
      }));

      showSnackbar(`Previewing kitchen: ${fullData.kitchen.kitchenName}. Click Unlock to Edit.`, 'info');
    } catch (error) {
      showSnackbar('Failed to load kitchen data.', 'error');
    }
  };

  const handleUnlockForm = () => {
    if (!searchPreviewData) return;

    // PERFORM REFRESH: Sync preview data to main state
    const updatedFullState = {
      ...kitcheninfoS,
      ...searchPreviewData,
      cabinet: {
        loadFinished: false,
        scale: 1,
        updateFlag: 0,
        canvasId: 1,
        canvasWallList: [],
        canvasObjectList: [],
        cabinetObjectList: [],
      },
      others: {
        ...kitcheninfoS.others,
        isReadOnly: false,
        isSearchLoaded: false,
        // searchPreviewData: null // Clear preview after syncing
      }
    };

    dispatch(updateKitchenInfo(updatedFullState));
    showSnackbar('Form unlocked and updated with selection.', 'success');

    // Close SearchDesign (SearchDesign消失)
    if (handleSubmitData) {
      handleSubmitData(1, null);
    }
  };

  const handleShowDesign = async () => {
    // Use data from either the preview or the synced state
    const currentKitchen = searchPreviewData?.kitchenObject || kitcheninfoS.kitchenObject;
    const effectiveKitchenId = currentKitchen?.id;
    if (!effectiveKitchenId) return;
    if (!searchPreviewData) return;

    // PERFORM REFRESH: Sync preview data to main state
    const updatedFullState = {
      ...kitcheninfoS,
      ...searchPreviewData,
      cabinet: {
        loadFinished: false,
        scale: 1,
        updateFlag: 0,
        canvasId: 1,
        canvasWallList: [],
        canvasObjectList: [],
        cabinetObjectList: [],
      },
      others: {
        ...kitcheninfoS.others,
        isReadOnly: true,
        canvasActiveId: 0,
      }
    };

    dispatch(updateKitchenInfo(updatedFullState));
    // showSnackbar('Form unlocked and updated with selection.', 'success');
    handleSubmitData(2, effectiveKitchenId);

  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Search Input */}
      <Paper
        component="form"
        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}
        onSubmit={(e) => { e.preventDefault(); handleSearchClick(); }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search by kitchen name or ID"
          value={searchText}
          onChange={handleInputChange}
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton type="button" sx={{ p: '10px' }} aria-label="search" onClick={handleSearchClick}>
          <SearchIcon />
        </IconButton>
      </Paper>

      {!isSearchLoaded ? (
        <>
          {/* Welcome Text */}
          {isVisibleDiv && (
            <Box sx={{ mt: 10, textAlign: 'center' }}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                Find your previous design
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the kitchen ID or name to search
              </Typography>
            </Box>
          )}

          {/* Results List */}
          {isVisibleList && (
            <List sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto', flex: 1 }}>
              {data.map((item) => (
                <Box key={item.kitchenId}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" onClick={() => handleSelectKitchen(item.kitchenId)}>
                        {item.clicked ? <CheckCircle color="primary" /> : <CheckCircleOutline />}
                      </IconButton>
                    }
                    disablePadding
                  >
                    <ListItemAvatar sx={{ minWidth: 56, ml: 1 }}>
                      <Avatar alt={item.id} src={`/static/images/avatar/${(parseInt(item.id) % 5) + 1}.jpg`} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.primary}
                      secondary={item.secondary}
                      sx={{ my: 1.5 }}
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Box>
              ))}
            </List>
          )}
        </>
      ) : (
        /* Loaded Preview with KitchenDataDisplay */
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <KitchenDataDisplay
            kitchenData={searchPreviewData}
            isReadOnly={true}
            onUnlock={handleUnlockForm}
            onGenerate={handleShowDesign}
          />
        </Box>
      )}
    </Box>
  );
};

export default SearchDesign;