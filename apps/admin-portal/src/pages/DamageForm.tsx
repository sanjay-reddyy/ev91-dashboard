import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { vehicleService, Vehicle } from '../services/vehicleService';

// Validation schema
const damageSchema = yup.object().shape({
  vehicleId: yup.string().required('Vehicle is required'),
  damageType: yup.string().oneOf(['Cosmetic', 'Mechanical', 'Electrical', 'Structural']).required('Damage type is required'),
  severity: yup.string().oneOf(['Minor', 'Moderate', 'Major']).required('Severity is required'),
  location: yup.string().required('Location is required'),
  description: yup.string().required('Description is required'),
  estimatedCost: yup.number().nullable().min(0, 'Cost must be positive'),
  actualCost: yup.number().nullable().min(0, 'Cost must be positive'),
  reportedBy: yup.string().required('Reported by is required'),
  assignedTechnician: yup.string().nullable(),
  damageStatus: yup.string().oneOf(['Reported', 'Under Review', 'Approved for Repair', 'In Repair', 'Resolved', 'Rejected']).required('Status is required'),
  resolutionNotes: yup.string().nullable(),
});

interface DamageFormData {
  vehicleId: string;
  damageType: 'Cosmetic' | 'Mechanical' | 'Electrical' | 'Structural';
  severity: 'Minor' | 'Moderate' | 'Major';
  location: string;
  description: string;
  estimatedCost: number | null;
  actualCost: number | null;
  reportedBy: string;
  assignedTechnician: string | null;
  damageStatus: 'Reported' | 'Under Review' | 'Approved for Repair' | 'In Repair' | 'Resolved' | 'Rejected';
  resolutionNotes: string | null;
  reportedDate?: string;
}

const DamageForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // always keep vehicles as an array to avoid `.find` on undefined
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<DamageFormData>({
    resolver: yupResolver(damageSchema),
    defaultValues: {
      vehicleId: '',
      damageType: 'Cosmetic',
      severity: 'Minor',
      location: '',
      description: '',
      estimatedCost: null,
      actualCost: null,
      reportedBy: '',
      assignedTechnician: '',
      damageStatus: 'Reported',
      resolutionNotes: '',
    },
  });

  const damageTypes = ['Cosmetic', 'Mechanical', 'Electrical', 'Structural'];
  const severityLevels = ['Minor', 'Moderate', 'Major'];
  const statusOptions = ['Reported', 'Under Review', 'Approved for Repair', 'In Repair', 'Resolved', 'Rejected'];
  
  const selectedStatus = watch('damageStatus');
  const watchVehicleId = watch('vehicleId');
  // guard against undefined and ensure we always use an array
  const selectedVehicle = (vehicles || []).find((v: any) => v.id === watchVehicleId) || null;

  // Load vehicles for selection
  useEffect(() => {
    (async () => {
      try {
        // vehicleService.getVehicles is the canonical method — fallback to getAll if needed
        try {
          const response = (typeof (vehicleService as any).getVehicles === 'function')
            ? await (vehicleService as any).getVehicles()
            : await (vehicleService as any).getAll();
          const list = response?.vehicles || response?.data || (Array.isArray(response) ? response : []);
          setVehicles(Array.isArray(list) ? list : []);
        } catch (err) {
          console.error('[DamageForm] failed to load vehicles', err);
          setVehicles([]);
        }
      } catch (err) {
        console.error('[DamageForm] failed to load vehicles', err);
        setVehicles([]);
      }
    })();
  }, []);

  // Load damage record for editing
  useEffect(() => {
    if (isEdit && id) {
      const loadDamageRecord = async () => {
        try {
          setLoading(true);
          const damageRecord = await vehicleService.getDamageRecord(id);
          if (!damageRecord) {
            throw new Error('No damage record found');
          }
          
          const record = damageRecord.data;
          if (!record) {
            throw new Error('No damage record found');
          }
          
          // Reset form with damage record data
          reset({
            vehicleId: record.vehicleId || '',
            damageType: record.damageType || 'Cosmetic',
            severity: record.severity || 'Minor',
            location: record.location || '',
            description: record.description || '',
            estimatedCost: record.estimatedCost || null,
            actualCost: record.actualCost || null,
            reportedBy: record.reportedBy || '',
            assignedTechnician: record.assignedTechnician || null,
            damageStatus: record.damageStatus || 'Reported',
            resolutionNotes: record.resolutionNotes || null,
            reportedDate: record.reportedDate
          });
        } catch (error) {
          console.error('Error loading damage record:', error);
          setError('Failed to load damage record');
        } finally {
          setLoading(false);
        }
      };

      loadDamageRecord();
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data: DamageFormData) => {
    try {
      setSubmitting(true);
      setError(null);

      // Clean up and validate the data before sending
      const damageData = {
        vehicleId: data.vehicleId,
        damageType: data.damageType,
        severity: data.severity,
        location: data.location.trim(),
        description: data.description.trim(),
        reportedBy: data.reportedBy.trim(),
        damageStatus: data.damageStatus,
        // Handle optional numeric fields
        estimatedCost: data.estimatedCost !== null ? parseFloat(data.estimatedCost.toString()) : null,
        actualCost: data.actualCost !== null ? parseFloat(data.actualCost.toString()) : null,
        // Handle optional text fields
        assignedTechnician: data.assignedTechnician?.trim() || null,
        resolutionNotes: data.resolutionNotes?.trim() || null,
        reportedDate: new Date().toISOString()
      };

      let result;
      if (isEdit && id) {
        result = await vehicleService.updateDamageRecord(id, damageData);
        if (!result.success) {
          throw new Error(result.message || 'Failed to update damage record');
        }
      } else {
        result = await vehicleService.createDamageRecord(damageData);
        if (!result.success) {
          throw new Error(result.message || 'Failed to create damage record');
        }
      }

      // If successful, navigate back to the list
      navigate('/damage');
    } catch (error: any) {
      console.error('Error saving damage record:', error);
      setError(error.message || 'Failed to save damage record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/damage');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body1"
          onClick={() => navigate('/damage')}
          sx={{ textDecoration: 'none' }}
        >
          Damage Management
        </Link>
        <Typography color="text.primary">
          {isEdit ? 'Edit Damage Record' : 'New Damage Record'}
        </Typography>
      </Breadcrumbs>

      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" mb={3}>
            <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h5" component="h1">
              {isEdit ? 'Edit Damage Record' : 'Create New Damage Record'}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Vehicle Selection */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="vehicleId"
                  control={control}
                  defaultValue={selectedVehicle?.id ?? ''} // stable default
                  render={({ field }) => (
                    <TextField select label="Vehicle" {...field}>
                      {(vehicles || []).map((v: any) => (
                        <MenuItem key={v.id} value={v.id}>{v.registrationNumber}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {/* Damage Type */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="damageType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.damageType}>
                      <InputLabel>Damage Type *</InputLabel>
                      <Select {...field} label="Damage Type *">
                        {damageTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.damageType && (
                        <FormHelperText>{errors.damageType.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Severity */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="severity"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.severity}>
                      <InputLabel>Severity *</InputLabel>
                      <Select {...field} label="Severity *">
                        {severityLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.severity && (
                        <FormHelperText>{errors.severity.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="damageStatus"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.damageStatus}>
                      <InputLabel>Status *</InputLabel>
                      <Select {...field} label="Status *">
                        {statusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.damageStatus && (
                        <FormHelperText>{errors.damageStatus.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Location *"
                      error={!!errors.location}
                      helperText={errors.location?.message}
                      placeholder="e.g., Front bumper, Engine bay, Left door"
                    />
                  )}
                />
              </Grid>

              {/* Reported By */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="reportedBy"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Reported By *"
                      error={!!errors.reportedBy}
                      helperText={errors.reportedBy?.message}
                      placeholder="Name of person reporting the damage"
                    />
                  )}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Description *"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Detailed description of the damage"
                    />
                  )}
                />
              </Grid>

              {/* Estimated Cost */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="estimatedCost"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="number"
                      label="Estimated Cost"
                      error={!!errors.estimatedCost}
                      helperText={errors.estimatedCost?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  )}
                />
              </Grid>

              {/* Actual Cost - only show if status is resolved */}
              {selectedStatus === 'Resolved' && (
                <Grid item xs={12} md={6}>
                  <Controller
                    name="actualCost"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        type="number"
                        label="Actual Cost"
                        error={!!errors.actualCost}
                        helperText={errors.actualCost?.message}
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Assigned Technician */}
              <Grid item xs={12} md={6}>
                <Controller
                  name="assignedTechnician"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Assigned Technician"
                      error={!!errors.assignedTechnician}
                      helperText={errors.assignedTechnician?.message}
                      placeholder="Name of assigned technician"
                    />
                  )}
                />
              </Grid>

              {/* Resolution Notes - only show if status requires it */}
              {(selectedStatus === 'Resolved' || selectedStatus === 'Rejected') && (
                <Grid item xs={12}>
                  <Controller
                    name="resolutionNotes"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={3}
                        label="Resolution Notes"
                        error={!!errors.resolutionNotes}
                        helperText={errors.resolutionNotes?.message}
                        placeholder="Notes about the resolution or rejection"
                      />
                    )}
                  />
                </Grid>
              )}

              {/* Form Actions */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    startIcon={<ArrowBackIcon />}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      isEdit ? 'Update Damage Record' : 'Create Damage Record'
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DamageForm;
