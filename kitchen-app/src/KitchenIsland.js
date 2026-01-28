
import React, { useEffect, memo } from 'react';
import { Box, Typography, TextField, FormControlLabel, Checkbox, ToggleButton, ToggleButtonGroup, Paper, Grid, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { Controller } from 'react-hook-form';

// Define Cabinet Styles (Same as KitchenType)
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

const KitchenIsland = memo(({ control, shapeType, islandObject, setIslandObject, setByIslandKind, getValues, setValue, clearErrors, disabled = false }) => {


  const [wallCounts, setWallCounts] = React.useState([true, true, true, true]);

  useEffect(() => {
    const wallMap = {
      'I': { visibility: [true, false, false, false] },
      'II': { visibility: [true, true, false, false] },
      'L': { visibility: [true, true, false, false] },
      'U': { visibility: [true, true, true, false] },
      'O': { visibility: [true, true, true, true] },
      'S': { visibility: [false, false, false, false] },
    };
    const defaultWall = { visibility: [false, false, false, false] };
    let { visibility: wallVisibilityValues } = wallMap[shapeType] || defaultWall;
    setWallCounts(wallVisibilityValues);

    if (!islandObject.islandKind) {
      setIslandObject(prev => ({ ...prev, islandKind: 'none' }));
    }
  }, [shapeType, islandObject.islandKind, setIslandObject]);

  const handleIslandKind = (newAlignment) => {
    setIslandObject(prev => ({ ...prev, islandKind: newAlignment }));
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

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      {/* <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
        Island / Peninsula (Optional)
      </Typography> */}

      {/* Segmented Control */}
      <Controller
        name="islandObject.islandKind"
        control={control}
        defaultValue="none"
        render={({ field }) => (
          <ToggleButtonGroup
            value={field.value || 'none'}
            exclusive
            fullWidth
            size="small"
            disabled={disabled}
            onChange={(_, newValue) => {
              if (newValue !== null) {
                field.onChange(newValue);
                handleIslandKind(newValue);
                if (newValue === 'none') {
                  setByIslandKind('none');
                  setValue('kitchenObject.construction3', '');
                  if (clearErrors) {
                    clearErrors('islandObject.width');
                    clearErrors('islandObject.length');
                  }
                } else if (newValue === 'island') {
                  setValue('islandObject.peninsulaisadjacentto', '');
                }
              }
            }}
            sx={{
              mb: 3,
              bgcolor: 'background.paper',
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                color: '#6B7280',
                borderColor: '#E5E7EB',
                '&.Mui-selected': {
                  bgcolor: '#EEF2FF',
                  color: '#4F46E5',
                  borderColor: '#C7D2FE',
                  '&:hover': {
                    bgcolor: '#E0E7FF',
                  }
                }
              }
            }}
          >
            <ToggleButton value="none" disabled={disabled}>None</ToggleButton>
            <ToggleButton value="island" disabled={disabled}>Island</ToggleButton>
            <ToggleButton value="peninsula" disabled={disabled || shapeType === 'O'}>Peninsula</ToggleButton>
          </ToggleButtonGroup>
        )}
      />

      {/* Details Card */}
      {getValues('islandObject.islandKind') !== 'none' && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            mb: 3
          }}
        >
          <Grid container spacing={2}>
            {/* Dimensions */}
            <Grid item xs={6}>
              <Controller
                name="islandObject.length"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Depth (Inches)"
                    size="small"
                    fullWidth
                    variant="outlined"
                    error={!!error}
                    helperText={error?.message}
                    disabled={disabled}
                    onBlur={(e) => field.onChange(parseFractionToDecimal(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={6}>
              <Controller
                name="islandObject.width"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Width (Inches)"
                    size="small"
                    fullWidth
                    variant="outlined"
                    error={!!error}
                    helperText={error?.message}
                    disabled={disabled}
                    onBlur={(e) => field.onChange(parseFractionToDecimal(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="islandObject.isWaterfall"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth size="small">
                    <InputLabel>Countertop Style</InputLabel>
                    <Select
                      {...field}
                      label="Countertop Style"
                      disabled={disabled}
                      // 逻辑核心：将 boolean 转为 string 给 UI 显示
                      value={field.value ? 'waterfall' : 'standard'}
                      // 逻辑核心：将 string 转回 boolean 存入数据
                      onChange={(e) => field.onChange(e.target.value === 'waterfall')}
                    >
                      <MenuItem value="standard">Standard Edge</MenuItem>
                      <MenuItem value="waterfall">Waterfall Edge</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {/* Right: Overhang Toggle (Direct Boolean) */}
            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
              <Controller
                name="islandObject.isOverhang"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!value} // 确保是 boolean
                        onChange={(e) => onChange(e.target.checked)}
                        color="primary"
                        size="small"
                        disabled={disabled}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                          Add Seating Overhang
                        </Typography>
                        {/* 可选：添加小字提示 */}
                        {value && (
                          <Typography variant="caption" sx={{ color: '#6B7280', display: 'block', lineHeight: 1 }}>
                            (+12" Depth)
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ ml: 1 }} // 稍微调整左边距
                  />
                )}
              />
            </Grid>
            {/* Peninsula Adjacency (Only for Peninsula) */}

            {getValues('islandObject.islandKind') === 'peninsula' && (
              <Grid item xs={12}>
                <Controller
                  name="islandObject.peninsulaisadjacentto"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <FormControl fullWidth size="small" error={!!error}>
                      <InputLabel>Connected To</InputLabel>
                      <Select {...field} label="Connected To" disabled={disabled}>
                        {wallCounts[0] && <MenuItem value="one">Wall 1</MenuItem>}
                        {wallCounts[1] && <MenuItem value="two">Wall 2</MenuItem>}
                        {wallCounts[2] && <MenuItem value="three">Wall 3</MenuItem>}
                        {wallCounts[3] && <MenuItem value="four">Wall 4</MenuItem>}
                      </Select>
                      {error && <FormHelperText>{error.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>
            )}

            {/* Island Cabinet Style (Construction) */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                Island Cabinet Styles
              </Typography>
              <Controller
                name="kitchenObject.construction3"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth size="small" error={!!error}>
                    <InputLabel>Cabinet Finish</InputLabel>
                    <Select {...field} label="Cabinet Finish" disabled={disabled}>
                      {CABINET_STYLES.map(s => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
                    </Select>
                    {error && <FormHelperText>{error.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>



          </Grid>
        </Paper>
      )}
    </Box>
  );
});

export default KitchenIsland;