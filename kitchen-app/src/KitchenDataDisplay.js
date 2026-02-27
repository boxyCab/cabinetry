import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import KitchenIcon from '@mui/icons-material/Kitchen';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import WindowIcon from '@mui/icons-material/Window';
import DeckIcon from '@mui/icons-material/Deck';

const KitchenDataDisplay = ({
  kitchenData,
  isReadOnly,
  onUnlock,
  onGenerate
}) => {
  if (!kitchenData) return null;

  const { kitchenObject, wallObjects, windowObjects, doorObjects, applianceObject, islandObject } = kitchenData;

  const shapeTypeLabels = {
    'I': 'I-Shape',
    'II': 'Galley/II-Shape',
    'L': 'L-Shape',
    'U': 'U-Shape',
    'O': 'O-Shape',
    'S': 'Custom'
  };

  const getVisibleWalls = () => {
    if (!wallObjects || !Array.isArray(wallObjects)) return [];
    return wallObjects.filter(wall => wall.visibility);
  };

  const getActiveWindows = () => {
    if (!windowObjects || !Array.isArray(windowObjects)) return [];
    return windowObjects.filter(win => win.hasWindow);
  };

  const getActiveDoors = () => {
    if (!doorObjects || !Array.isArray(doorObjects)) return [];
    return doorObjects.filter(door => door.hasDoor);
  };

  const getAppliances = () => {
    if (!applianceObject || !Array.isArray(applianceObject)) return [];
    return applianceObject.map(app => ({
      type: app.appliancekind,
      width: app.width,
      position: app.position,
      location: app.wallId
    }));
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        bgcolor: isReadOnly ? '#F3F4F6' : 'white',
        border: isReadOnly ? '2px solid #E5E7EB' : '2px solid #4F46E5',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isReadOnly ? (
            <LockIcon sx={{ color: '#EF4444', fontSize: 20 }} />
          ) : (
            <LockOpenIcon sx={{ color: '#10B981', fontSize: 20 }} />
          )}
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
            {isReadOnly ? 'Loaded Design (Read Only)' : 'Design Data'}
          </Typography>
        </Box>
        {isReadOnly && (
          <Chip
            label="Search Result"
            size="small"
            sx={{ bgcolor: '#EEF2FF', color: '#4F46E5', fontWeight: 500 }}
          />
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Kitchen Info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <KitchenIcon fontSize="small" /> BASIC INFORMATION
        </Typography>
        <Box sx={{ ml: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            ID: <strong>{kitchenObject?.id || 'N/A'}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Name: <strong>{kitchenObject?.kitchenName || 'N/A'}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Shape: <strong>{shapeTypeLabels[kitchenObject?.shapeType] || kitchenObject?.shapeType}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ceiling: <strong>{kitchenObject?.ceilingHeight || 0} Inches</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upper Style: <strong>{kitchenObject?.construction1 || 'None'}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lower Style: <strong>{kitchenObject?.construction2 || 'None'}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Island Style: <strong>{kitchenObject?.construction3 || 'None'}</strong>
          </Typography>
        </Box>
      </Box>

      {/* Wall Configuration */}
      {getVisibleWalls().length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DeckIcon fontSize="small" /> WALL CONFIGURATION
          </Typography>
          <Box sx={{ ml: 3 }}>
            {getVisibleWalls().map((wall, index) => (
              <Typography key={wall.wallid} variant="body2" color="text.secondary">
                Wall {index + 1}: <strong>{wall.width} Inches × {wall.height || 96} Inches</strong>
                {wall.angle && ` (${wall.angle}°)`}
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* Windows & Doors */}
      {(getActiveWindows().length > 0 || getActiveDoors().length > 0) && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DoorFrontIcon fontSize="small" /> OPENINGS
          </Typography>
          <Box sx={{ ml: 3 }}>
            {getActiveWindows().map((win, idx) => (
              <Typography key={`win-${idx}`} variant="body2" color="text.secondary">
                <WindowIcon fontSize="inherit" sx={{ fontSize: 14, mr: 0.5 }} />
                Wall {win.wallId || 'N/A'}: Window <strong>{win.width} Inches × {win.height} Inches</strong> @ {win.position} Inches
              </Typography>
            ))}
            {getActiveDoors().map((door, idx) => (
              <Typography key={`door-${idx}`} variant="body2" color="text.secondary">
                <DoorFrontIcon fontSize="inherit" sx={{ fontSize: 14, mr: 0.5 }} />
                Wall {door.wallId || 'N/A'}: Door <strong>{door.width} Inches × {door.height} Inches</strong> @ {door.position} Inches
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* Appliances */}
      {getAppliances().length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckroomIcon fontSize="small" /> APPLIANCES
          </Typography>
          <Box sx={{ ml: 3 }}>
            {getAppliances().map((app, index) => (
              <Typography key={index} variant="body2" color="text.secondary">
                • {app.type}: <strong>{app.width} Inches</strong> (at <strong>{
                  app.location === 'one' ? 'Wall One' :
                    app.location === 'two' ? 'Wall Two' :
                      app.location === 'three' ? 'Wall Three' :
                        app.location === 'four' ? 'Wall Four' :
                          app.location
                }</strong>, {app.position} Inches from Right (Elevation))
              </Typography>
            ))}
          </Box>
        </Box>
      )}

      {/* Island */}
      {islandObject && islandObject.islandKind && islandObject.islandKind !== 'none' && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#6B7280', mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DeckIcon fontSize="small" /> ISLAND / PENINSULA
          </Typography>
          <Box sx={{ ml: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Type: <strong>{islandObject.islandKind}</strong>
            </Typography>
            {islandObject.width > 0 && (
              <Typography variant="body2" color="text.secondary">
                Dimensions: <strong>{islandObject.width} Inches × {islandObject.length} Inches</strong>
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Action Buttons */}
      <Stack direction="row" spacing={2}>
        {isReadOnly ? (
          <Button
            variant="outlined"
            size="small"
            startIcon={<LockOpenIcon />}
            onClick={onUnlock}
            sx={{
              borderColor: '#10B981',
              color: '#10B981',
              '&:hover': {
                borderColor: '#059669',
                bgcolor: '#ECFDF5'
              }
            }}
          >
            Unlock to Edit
          </Button>
        ) : null}
        <Button
          variant="contained"
          size="small"
          startIcon={<AutoAwesomeIcon />}
          onClick={onGenerate}
          disabled={!isReadOnly}
          sx={{
            bgcolor: '#4F46E5',
            '&:hover': {
              bgcolor: '#4338CA'
            },
            '&:disabled': {
              bgcolor: '#E5E7EB',
              color: '#9CA3AF'
            }
          }}
        >
          Show Design
        </Button>
      </Stack>
    </Paper>
  );
};

export default KitchenDataDisplay;
