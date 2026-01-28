import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, TextField, IconButton, Button, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';

const KitchenAppliSpeci = ({ control, shapeType, getValues, setValue, disabled = false }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "applianceObject",
  });
  const watchedAppliances = useWatch({ control, name: 'applianceObject' }) || [];

  const watchedIslandKind = useWatch({ control, name: 'islandObject.islandKind' });
  const [wallOptions, setWallOptions] = useState([]);

  useEffect(() => {
    const wallMap = {
      'I': [true, false, false, false],
      'II': [true, true, false, false],
      'L': [true, true, false, false],
      'U': [true, true, true, false],
      'O': [true, true, true, true],
      'S': [false, false, false, false],
    };
    const visibleWalls = wallMap[shapeType] || [false, false, false, false];
    const options = visibleWalls.map((isVisible, idx) => isVisible ? `Wall ${idx + 1}` : null).filter(Boolean);

    // Only add island/peninsula if it's active
    if (watchedIslandKind && watchedIslandKind !== 'none') {
      options.push('island');
    }
    setWallOptions(options);
  }, [shapeType, watchedIslandKind]);

  const applianceTypes = [
    { label: 'Refrigerator', value: 'Refrigerator' },
    { label: 'Dishwasher', value: 'Dishwasher' },
    { label: 'Range', value: 'Range' },
    { label: 'Hood', value: 'Hood' },
  ];

  const handleAddClick = () => {
    append({
      appliancekind: 'Refrigerator',
      width: 0,
      position: 0,
      wallId: 'one'
    });
  };

  const handleRemoveAppliance = (index) => {
    const current = getValues('applianceObject');
    if (Array.isArray(current)) {
      const updated = current.filter((_, i) => i !== index);
      setValue('applianceObject', updated, { shouldValidate: true, shouldDirty: true });
    }
  };

  const parseFractionToDecimal = (value) => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    const trimmed = value.toString().trim();
    if (!trimmed) return 0;

    const fractionRegex = /^(\d+)[-\s]?(\d+)\/(\d+)$/;
    const simpleFractionRegex = /^(\d+)\/(\d+)$/;

    let match = trimmed.match(fractionRegex);
    if (match) {
      const intPart = parseInt(match[1], 10);
      const num = parseInt(match[2], 10);
      const den = parseInt(match[3], 10);
      return den === 0 ? 0 : parseFloat((intPart + num / den).toFixed(2));
    }

    match = trimmed.match(simpleFractionRegex);
    if (match) {
      const num = parseInt(match[1], 10);
      const den = parseInt(match[2], 10);
      return den === 0 ? 0 : parseFloat((num / den).toFixed(2));
    }

    const parsed = parseFloat(trimmed);
    return isNaN(parsed) ? 0 : parseFloat(parsed.toFixed(2));
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
        Appliances (Optional)
      </Typography> */}

      {/* Render Appliance Cards */}
      {fields.map((field, index) => (
        <Paper
          key={field.id}
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            mb: 2,
            position: 'relative'
          }}
        >
          <Grid container spacing={2} alignItems="flex-start">
            {/* Type Dropdown & Delete Button */}
            <Grid item xs={10} sm={11}>
              <Controller
                name={`applianceObject.${index}.appliancekind`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth size="small" error={!!error}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      {...field}
                      label="Type"
                      disabled={disabled}
                    >
                      {applianceTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                      ))}
                    </Select>
                    {error && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{error.message}</Typography>}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={2} sm={1} sx={{ display: 'flex', justifyContent: 'flex-end', pt: '4px !important' }}>
              <IconButton
                size="small"
                onClick={() => handleRemoveAppliance(index)}
                sx={{ color: '#9CA3AF' }}
                disabled={disabled}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Grid>

            {/* Width */}
            <Grid item xs={6}>
              <Controller
                name={`applianceObject.${index}.width`}
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
                    onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* On Wall */}
            <Grid item xs={6}>
              <Controller
                name={`applianceObject.${index}.wallId`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl fullWidth size="small" error={!!error}>
                    <InputLabel>On Wall</InputLabel>
                    <Select {...field} label="On Wall" disabled={disabled}>
                      {wallOptions.map((wall) => {
                        let wallIdVal = wall.toLowerCase();
                        if (wallIdVal.startsWith('wall ')) {
                          const num = wallIdVal.split(' ')[1];
                          wallIdVal = num === '1' ? 'one' : num === '2' ? 'two' : num === '3' ? 'three' : 'four';
                        }
                        return (
                          <MenuItem key={wall} value={wallIdVal}>
                            {wall === 'island' ? 'Island/Peninsula' : wall}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    {error && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>{error.message}</Typography>}
                  </FormControl>
                )}
              />
            </Grid>

            {/* From Right */}
            <Grid item xs={6}>
              <Controller
                name={`applianceObject.${index}.position`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="From Right (Inches)"
                    size="small"
                    fullWidth
                    variant="outlined"
                    error={!!error}
                    helperText={error?.message}
                    disabled={disabled}
                    onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>

            {/* Height (Always shown, mandatory for Hood) */}
            <Grid item xs={6}>
              <Controller
                name={`applianceObject.${index}.height`}
                control={control}
                rules={{
                  validate: (value) => {
                    const kind = getValues(`applianceObject.${index}.appliancekind`);
                    if (kind === 'Hood' && (!value || parseFloat(value) === 0)) {
                      return "Height is required for Hood";
                    }
                    return true;
                  }
                }}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    label="Height (Inches)"
                    size="small"
                    fullWidth
                    variant="outlined"
                    error={!!error}
                    helperText={error?.message}
                    disabled={disabled}
                    onBlur={e => field.onChange(parseFractionToDecimal(e.target.value))}
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}

      {/* Add Button */}
      <Button
        variant="contained"
        fullWidth
        onClick={handleAddClick}
        disabled={disabled}
        sx={{
          mt: 1,
          bgcolor: '#EEF2FF',
          color: '#4F46E5',
          border: '1px solid #C7D2FE',
          boxShadow: 'none',
          textTransform: 'none',
          fontWeight: 600,
          '&:hover': {
            bgcolor: '#E0E7FF',
            boxShadow: 'none'
          }
        }}
      >
        + Add Appliance
      </Button>
    </Box>
  );
};

export default KitchenAppliSpeci;