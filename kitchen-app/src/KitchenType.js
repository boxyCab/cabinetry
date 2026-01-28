import React from 'react';
import { Box, Typography, Grid, Paper, TextField, Checkbox, FormControlLabel, Stack, Select, MenuItem, InputLabel, FormControl, Button, IconButton, Tooltip, InputAdornment, FormHelperText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorIcon from '@mui/icons-material/Error';
import { Controller, useWatch, useFieldArray } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import { Menu } from '@mui/material';

const ShapeIcon = ({ shape, color }) => {
  const stroke = color;
  const strokeWidth = 8;
  switch (shape) {
    case 'I':
      return <svg width="60" height="60" viewBox="0 0 100 100"><line x1="20" y1="50" x2="80" y2="50" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" /></svg>;
    case 'II':
      return <svg width="60" height="60" viewBox="0 0 100 100"><line x1="20" y1="35" x2="80" y2="35" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" /><line x1="20" y1="65" x2="80" y2="65" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" /></svg>;
    case 'L':
      return <svg width="60" height="60" viewBox="0 0 100 100"><path d="M30 20 V80 H80" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></svg>;
    case 'U':
      return <svg width="60" height="60" viewBox="0 0 100 100"><path d="M20 20 V80 H80 V20" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" /></svg>;
    default: return null;
  }
};

const shapes = [
  { id: 'I', label: 'I-Shape' },
  { id: 'II', label: 'Galley' },
  { id: 'L', label: 'L-Shape' },
  { id: 'U', label: 'U-Shape' },
];

const ShapeCard = ({ label, id, selected, onClick, disabled = false }) => (
  <Paper
    elevation={0}
    onClick={disabled ? undefined : onClick}
    sx={{
      p: 2,
      border: selected ? '2px solid #5fa6f7' : '1px solid #E5E7EB',
      borderRadius: 3,
      cursor: disabled ? 'not-allowed' : 'pointer',
      textAlign: 'center',
      bgcolor: disabled ? '#F3F4F6' : (selected ? '#e6f2ff' : 'white'),
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: 110,
      transition: 'all 0.2s',
      opacity: disabled ? 0.6 : 1,
      '&:hover': disabled ? {} : { borderColor: '#60A5FA' }
    }}
  >
    <Box sx={{ mb: 1, height: 60, display: 'flex', alignItems: 'center' }}>
      <ShapeIcon shape={id} color={selected ? '#3B82F6' : '#6B7280'} />
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 600, color: selected ? '#1D4ED8' : '#374151' }}>{label}</Typography>
  </Paper>
);

// Define Cabinet Styles
const CABINET_STYLES = [
  { value: 'BC1001', label: 'Ivory White (BC1001)' },
  { value: 'BC1002', label: 'Dove Gray (BC1002)' },
  { value: 'BC1003', label: 'Navy Blue (BC1003)' },
  { value: 'BC1004', label: 'Mingo Oak (BC1004)' },
  { value: 'BC1005', label: 'Beaman Oak (BC1005)' },
  { value: 'BC1006', label: 'Black Walnut (BC1006)' },
  { value: 'BC1007', label: 'Olive Green (BC1007)' },
  { value: 'BC2001', label: 'Ivory White (BC2001)' },
  { value: 'BC2002', label: 'Dove Gray (BC2002)' },
  { value: 'BC2003', label: 'Navy Blue (BC2003)' },
  { value: 'BC2004', label: 'Mingo Oak (BC2004)' },
  { value: 'BC2005', label: 'Beaman Oak (BC2005)' },
  { value: 'BC2006', label: 'Black Walnut (BC2006)' },
  { value: 'BC2007', label: 'Olive Green (BC2007)' },
  { value: 'BC3001', label: 'Ivory White (BC3001)' },
  { value: 'BC3002', label: 'Dove Gray (BC3002)' },
  { value: 'BC3003', label: 'Navy Blue (BC3003)' },
  { value: 'BC3004', label: 'Mingo Oak (BC3004)' },
  { value: 'BC3005', label: 'Beaman Oak (BC3005)' },
  { value: 'BC3006', label: 'Black Walnut (BC3006)' },
  { value: 'BC3007', label: 'Olive Green (BC3007)' },
  { value: 'BC4011', label: 'Arctic White (BC4011)' },
  { value: 'BC4012', label: 'Dune Oak (BC4012)' },
  { value: 'BC4013', label: 'Jasper Walnut (BC4013)' },
  { value: 'BC4014', label: 'Espresso Oak (BC4014)' },
  { value: 'BC5031', label: 'Blanco (BC5031)' },
  { value: 'BC5032', label: 'Blanco SM (BC5032)' },
  { value: 'BC5033', label: 'Cashmere SM (BC5033)' },
  { value: 'BC5034', label: 'Tortora SM (BC5034)' },
  { value: 'BC5035', label: 'Agave SM (BC5035)' },
  { value: 'BC5036', label: 'Antracita SM (BC5036)' },
  { value: 'BC5037', label: 'Evolve (BC5037)' },
  { value: 'BC5038', label: 'Acquedotti (BC5038)' },
  { value: 'BC5039', label: 'Valley (BC5039)' },
  { value: 'BC5040', label: 'Giffoni (BC5040)' }
];

const KitchenType = ({ control, wallObjects, setByShapeType, errors, getValues, setValue, disabled = false }) => {
  const { fields: windowFields, append: appendWindow, remove: removeWindow } = useFieldArray({ control, name: "windowObjects" });
  const { fields: doorFields, append: appendDoor, remove: removeDoor } = useFieldArray({ control, name: "doorObjects" });

  const watchedShape = useWatch({ control, name: 'kitchenObject.shapeType' });
  const wallIdMap = ['one', 'two', 'three', 'four'];

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeWallIndex, setActiveWallIndex] = React.useState(null);
  const openMenu = Boolean(anchorEl);

  const handleAddClick = (event, index) => {
    setAnchorEl(event.currentTarget);
    setActiveWallIndex(index);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveWallIndex(null);
  };

  const handleAddWindow = () => {
    appendWindow({ hasWindow: true, width: 0, height: 0, position: 0, wallId: wallIdMap[activeWallIndex] });
    handleCloseMenu();
  };

  const handleAddDoor = () => {
    appendDoor({ hasDoor: true, width: 0, height: 0, position: 0, wallId: wallIdMap[activeWallIndex] });
    handleCloseMenu();
  };

  // Fix: Manual removal to ensure getValues() and verified data are in sync
  const handleRemoveWindow = (index) => {
    const current = getValues('windowObjects');
    if (Array.isArray(current)) {
      const updated = current.filter((_, i) => i !== index);
      setValue('windowObjects', updated, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleRemoveDoor = (index) => {
    const current = getValues('doorObjects');
    if (Array.isArray(current)) {
      const updated = current.filter((_, i) => i !== index);
      setValue('doorObjects', updated, { shouldValidate: true, shouldDirty: true });
    }
  };

  const showDetails = !!watchedShape;

  const handleShapeType = (newAlignment) => {
    if (!newAlignment) return;
    setByShapeType(newAlignment);
  };

  const parseFractionToDecimal = (value) => {
    if (value == null || typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (!trimmed) return value;
    const fractionRegex = /^(\d+)[-\s]?(\d+)\/(\d+)$/;
    const simpleFractionRegex = /^(\d+)\/(\d+)$/;
    let match = trimmed.match(fractionRegex);
    if (match) {
      const intPart = parseInt(match[1], 10);
      const num = parseInt(match[2], 10);
      const den = parseInt(match[3], 10);
      return den === 0 ? value : (intPart + num / den).toFixed(2);
    }
    match = trimmed.match(simpleFractionRegex);
    if (match) {
      const num = parseInt(match[1], 10);
      const den = parseInt(match[2], 10);
      return den === 0 ? value : (num / den).toFixed(2);
    }
    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? value : parsed.toFixed(2);
  };

  const showUpperStyle = Array.isArray(wallObjects) && wallObjects.some(w => w.visibility && w.isUpperCabinetPlaced);
  const showLowerStyle = Array.isArray(wallObjects) && wallObjects.some(w => w.visibility && w.isLowerCabinetPlaced);

  // Clear styles when they are hidden
  React.useEffect(() => {
    if (!showUpperStyle) {
      setValue('kitchenObject.construction1', '');
    }
  }, [showUpperStyle, setValue]);

  React.useEffect(() => {
    if (!showLowerStyle) {
      setValue('kitchenObject.construction2', '');
    }
  }, [showLowerStyle, setValue]);

  return (
    <Box sx={{ width: '100%' }}>

      {/* 1. Shape Selection */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
        Configuration
      </Typography>
      <Controller
        name="kitchenObject.shapeType"
        control={control}
        render={({ field }) => (
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {shapes.map((shape) => (
              <Grid item xs={6} sm={3} key={shape.id}>
                <ShapeCard
                  label={shape.label}
                  id={shape.id}
                  selected={field.value === shape.id}
                  disabled={disabled}
                  onClick={() => {
                    field.onChange(shape.id);
                    handleShapeType(shape.id);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      />

      {showDetails && (
        <>
          {/* 2. Global Dimensions */}
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
            General Dimensions
          </Typography>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Controller
              name="kitchenObject.kitchenName"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField {...field} label="Kitchen Name" size="small" fullWidth variant="outlined"
                  error={!!errors?.kitchenObject?.kitchenName}
                  helperText={errors?.kitchenObject?.kitchenName?.message}
                  disabled={disabled} />
              )}
            />
            <Controller
              name="kitchenObject.ceilingHeight"
              control={control}
              rules={{ required: "Required", min: { value: 80, message: "Min 80 inches" } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Ceiling Height (Inches)"
                  size="small" fullWidth variant="outlined"
                  error={!!errors?.kitchenObject?.ceilingHeight} helperText={errors?.kitchenObject?.ceilingHeight?.message}
                  disabled={disabled}
                  onBlur={(e) => {
                    field.onChange(parseFractionToDecimal(e.target.value));
                    field.onBlur();
                  }}
                />
              )}
            />
          </Stack>
        </>
      )}

      {showDetails && (
        <>
          {/* 3. Wall Configuration Cards */}
          {Array.isArray(wallObjects) && wallObjects.some(w => w.visibility) && (
            <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Walls & Openings
            </Typography>
          )}

          <Box>
            {Array.isArray(wallObjects) && wallObjects.map((item, index) => (
              (item.visibility === true || item.visibility === 1 || item.visibility === "true") && (
                <Paper
                  key={item.wallid || index}
                  elevation={0}
                  sx={{
                    border: '1px solid #E5E7EB',
                    borderRadius: 2,
                    mb: 3,
                    overflow: 'hidden'
                  }}
                >
                  {/* Wall Header & Length */}
                  <Box sx={{ p: 2, bgcolor: '#fff', borderBottom: '1px solid #F3F4F6' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>{item.wallName}</Typography>

                    <Controller
                      name={`wallObjects.${index}.width`}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          label={`${item.wallName} Length (Inches)`}
                          size="small"
                          fullWidth
                          variant="outlined"
                          value={field.value ?? ''}
                          error={!!error}
                          helperText={error?.message}
                          disabled={disabled}
                          onBlur={(e) => {
                            field.onChange(parseFractionToDecimal(e.target.value));
                            field.onBlur();
                          }}
                        />
                      )}
                    />
                  </Box>

                  {/* Cabinet Options */}
                  <Box sx={{ p: 2, bgcolor: '#FAFAFA', borderBottom: '1px solid #F3F4F6' }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', mb: 1, display: 'block' }}>Cabinets</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Controller
                          name={`wallObjects.${index}.isUpperCabinetPlaced`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small">
                              <InputLabel>Upper Cabinets</InputLabel>
                              <Select
                                {...field}
                                label="Upper Cabinets"
                                onChange={(e) => field.onChange(e.target.value)}
                                disabled={disabled}
                              >
                                <MenuItem value={false}>None</MenuItem>
                                <MenuItem value={true}>Yes</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Controller
                          name={`wallObjects.${index}.isLowerCabinetPlaced`}
                          control={control}
                          render={({ field }) => (
                            <FormControl fullWidth size="small">
                              <InputLabel>Lower Cabinets</InputLabel>
                              <Select
                                {...field}
                                label="Lower Cabinets"
                                onChange={(e) => field.onChange(e.target.value)}
                                disabled={disabled}
                              >
                                <MenuItem value={false}>None</MenuItem>
                                <MenuItem value={true}>Yes</MenuItem>
                              </Select>
                            </FormControl>
                          )}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <Controller
                          name={`wallObjects.${index}.pantryRequired`}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel control={<Checkbox {...field} checked={!!field.value} size="small" disabled={disabled} />} label={<Typography variant="body2">Add Pantry</Typography>} />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Windows & Doors Section */}
                  <Box sx={{ p: 2, bgcolor: '#F3F4F6' }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', mb: 1, display: 'block' }}>Windows & Doors</Typography>

                    <Stack spacing={2}>
                      {/* Render Windows for this wall */}
                      {windowFields.map((field, wIdx) => {
                        if (field.wallId !== wallIdMap[index] || !field.hasWindow) return null;
                        return (
                          <Paper key={field.id} sx={{ p: 2, borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#4F46E5', display: 'flex', alignItems: 'center' }}>
                                Window
                              </Typography>
                              <IconButton size="small" onClick={() => handleRemoveWindow(wIdx)} disabled={disabled}>
                                <DeleteIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                              </IconButton>
                            </Box>
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Controller
                                  name={`windowObjects.${wIdx}.width`}
                                  control={control}
                                  render={({ field, fieldState: { error } }) => (
                                    <TextField
                                      {...field} label="Width (Inches)" size="small" fullWidth error={!!error}
                                      InputProps={{
                                        endAdornment: error && (
                                          <InputAdornment position="end"><Tooltip title={error.message} arrow placement="top"><ErrorIcon color="error" fontSize="small" /></Tooltip></InputAdornment>
                                        )
                                      }}
                                      disabled={disabled}
                                      onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Controller
                                  name={`windowObjects.${wIdx}.height`}
                                  control={control}
                                  render={({ field, fieldState: { error } }) => (
                                    <TextField
                                      {...field} label="Height (Inches)" size="small" fullWidth error={!!error}
                                      InputProps={{
                                        endAdornment: error && (
                                          <InputAdornment position="end"><Tooltip title={error.message} arrow placement="top"><ErrorIcon color="error" fontSize="small" /></Tooltip></InputAdornment>
                                        )
                                      }}
                                      disabled={disabled}
                                      onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Controller
                                  name={`windowObjects.${wIdx}.position`}
                                  control={control}
                                  render={({ field, fieldState: { error } }) => (
                                    <TextField
                                      {...field} label="From Right (Inches)" size="small" fullWidth error={!!error}
                                      InputProps={{
                                        endAdornment: error && (
                                          <InputAdornment position="end"><Tooltip title={error.message} arrow placement="top"><ErrorIcon color="error" fontSize="small" /></Tooltip></InputAdornment>
                                        )
                                      }}
                                      disabled={disabled}
                                      onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        );
                      })}

                      {/* Render Doors for this wall */}
                      {doorFields.map((field, dIdx) => {
                        if (field.wallId !== wallIdMap[index] || !field.hasDoor) return null;
                        return (
                          <Paper key={field.id} sx={{ p: 2, borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center' }}>
                                Door
                              </Typography>
                              <IconButton size="small" onClick={() => handleRemoveDoor(dIdx)} disabled={disabled}>
                                <DeleteIcon fontSize="small" sx={{ color: '#9CA3AF' }} />
                              </IconButton>
                            </Box>
                            <Grid container spacing={2}>
                              <Grid item xs={4}>
                                <Controller
                                  name={`doorObjects.${dIdx}.width`}
                                  control={control}
                                  render={({ field, fieldState: { error } }) => (
                                    <TextField
                                      {...field} label="Width (Inches)" size="small" fullWidth error={!!error}
                                      InputProps={{
                                        endAdornment: error && (
                                          <InputAdornment position="end"><Tooltip title={error.message} arrow placement="top"><ErrorIcon color="error" fontSize="small" /></Tooltip></InputAdornment>
                                        )
                                      }}
                                      disabled={disabled}
                                      onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Controller
                                  name={`doorObjects.${dIdx}.height`}
                                  control={control}
                                  render={({ field, fieldState: { error } }) => (
                                    <TextField
                                      {...field} label="Height (Inches)" size="small" fullWidth error={!!error}
                                      InputProps={{
                                        endAdornment: error && (
                                          <InputAdornment position="end"><Tooltip title={error.message} arrow placement="top"><ErrorIcon color="error" fontSize="small" /></Tooltip></InputAdornment>
                                        )
                                      }}
                                      disabled={disabled}
                                      onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  )}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <Controller
                                  name={`doorObjects.${dIdx}.position`}
                                  control={control}
                                  render={({ field, fieldState: { error } }) => (
                                    <TextField
                                      {...field} label="From Right (Inches)" size="small" fullWidth error={!!error}
                                      InputProps={{
                                        endAdornment: error && (
                                          <InputAdornment position="end"><Tooltip title={error.message} arrow placement="top"><ErrorIcon color="error" fontSize="small" /></Tooltip></InputAdornment>
                                        )
                                      }}
                                      disabled={disabled}
                                      onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                                      InputLabelProps={{ shrink: true }}
                                    />
                                  )}
                                />
                              </Grid>
                            </Grid>
                          </Paper>
                        );
                      })}
                    </Stack>

                    <Button
                      variant="outlined"
                      fullWidth
                      startIcon={<AddIcon />}
                      sx={{ mt: 2, bgcolor: '#EEF2FF', borderColor: '#C7D2FE', color: '#4F46E5', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#E0E7FF' } }}
                      onClick={(e) => handleAddClick(e, index)}
                      disabled={disabled}
                    >
                      Add Window/Door
                    </Button>
                  </Box>
                </Paper>
              )
            ))}
          </Box>
          {/* Global Styles */}
          {(showUpperStyle || showLowerStyle) && (
            <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #E5E7EB', mt: 3, bgcolor: '#FAFAFA' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Cabinet Styles
              </Typography>
              <Grid container spacing={2}>
                {showUpperStyle && (
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="kitchenObject.construction1"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth size="small" error={!!error}>
                          <InputLabel>Upper Style</InputLabel>
                          <Select {...field} label="Upper Style" disabled={disabled}>
                            {CABINET_STYLES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                          </Select>
                          {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}
                {showLowerStyle && (
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="kitchenObject.construction2"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <FormControl fullWidth size="small" error={!!error}>
                          <InputLabel>Lower Style</InputLabel>
                          <Select {...field} label="Lower Style" disabled={disabled}>
                            {CABINET_STYLES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                          </Select>
                          {error && <FormHelperText>{error.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </>
      )}
      {/* Global Menu for Adding Windows/Doors */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleAddWindow}>+ Window</MenuItem>
        <MenuItem onClick={handleAddDoor}>+ Door</MenuItem>
      </Menu>
    </Box>
  );
};

export default KitchenType;