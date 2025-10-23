import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Snackbar,
  Autocomplete,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Schedule as ScheduleIcon,
  Build as ServiceIcon,
  DirectionsBike as VehicleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addDays } from 'date-fns';

// ensure Vehicle type exists or use `any`
interface Vehicle {
  id: string;
  registrationNumber?: string;
  vehicleNumber?: string;
  name?: string;
  mileage?: number;
  model?: any;
  [key: string]: any;
}

interface ServiceCenter {
  id: string;
  name: string;
  location: string;
  capacity: number;
  specialties: string[];
}

const ServiceScheduleForm: React.FC = (props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId = searchParams.get('vehicleId');

  // always keep vehicles as an array to avoid `.find` / `.map` on undefined
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const [formData, setFormData] = useState({
    vehicleId: preselectedVehicleId || '',
    serviceType: '',
    scheduledDate: '',
    description: '',
    serviceCenter: '',
    estimatedCost: '',
    priority: 'medium',
    mechanicPreference: '',
    notes: ''
  });

  const serviceTypes = [
    'Preventive Maintenance',
    'Battery Service',
    'Brake Service',
    'Tire Service',
    'Electrical Repair',
    'Body Work',
    'Emergency Repair',
    'Inspection',
    'Software Update',
    'Warranty Service'
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'info' as const },
    { value: 'medium', label: 'Medium', color: 'warning' as const },
    { value: 'high', label: 'High', color: 'error' as const },
    { value: 'urgent', label: 'Urgent', color: 'error' as const }
  ];

  useEffect(() => {
    fetchVehicles();
    fetchServiceCenters();
  }, []);

  async function fetchVehicles() {
    try {
      const apiBaseRaw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003';
      // normalize base: remove trailing slashes and any trailing /api or /api/vN to avoid duplication
      let apiRoot = apiBaseRaw.replace(/\/+$/, '');
      apiRoot = apiRoot.replace(/\/api(\/v\d+)?$/i, '');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';

      const res = await fetch(`${apiRoot}/api/vehicles`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // guard against non-JSON responses and non-OK status
      const json = await (async () => {
        try { return await res.json(); } catch { return null; }
      })();

      if (!res.ok) {
        console.warn('[ServiceScheduleForm] vehicles endpoint returned', res.status, json);
        setVehicles([]);
        return;
      }

      // backend may return { vehicles: [...] } or { data: [...] } or an array directly
      const list = json?.vehicles || json?.data || (Array.isArray(json) ? json : []);
      setVehicles(Array.isArray(list) ? list : []);
      console.debug('[ServiceScheduleForm] loaded vehicles', Array.isArray(list) ? list.length : 0);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setVehicles([]); // safe fallback
    }
  }

  const fetchServiceCenters = async () => {
    try {
      // Mock service centers for now
      setServiceCenters([
        {
          id: '1',
          name: 'Central Service Hub',
          location: 'Mumbai Central',
          capacity: 50,
          specialties: ['Battery Service', 'Electrical Repair', 'Software Update']
        },
        {
          id: '2',
          name: 'North Mumbai Center',
          location: 'Andheri West',
          capacity: 30,
          specialties: ['Preventive Maintenance', 'Brake Service', 'Tire Service']
        },
        {
          id: '3',
          name: 'South Mumbai Center',
          location: 'Worli',
          capacity: 40,
          specialties: ['Body Work', 'Emergency Repair', 'Inspection']
        }
      ]);
    } catch (error) {
      console.error('Error fetching service centers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // normalize base as in fetchVehicles
      let apiRoot = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3003').replace(/\/+$/, '');
      apiRoot = apiRoot.replace(/\/api(\/v\d+)?$/i, '');
      const token = localStorage.getItem('authToken') || localStorage.getItem('token') || '';

      const response = await fetch(`${apiRoot}/api/vehicles/service/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          estimatedCost: parseFloat(formData.estimatedCost as any) || 0
        })
      });

      const data = await (async () => {
        try { return await response.json(); } catch { return null; }
      })();

      if (response.ok && data?.success) {
        setSnackbar({
          open: true,
          message: 'Service scheduled successfully',
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/services');
        }, 1200);
      } else {
        console.warn('[ServiceScheduleForm] schedule failed', response.status, data);
        throw new Error(data?.message || 'Failed to schedule service');
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to schedule service',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedVehicle = (vehicles ?? []).find(v => v.id === formData.vehicleId);
  const selectedServiceCenter = (serviceCenters ?? []).find(sc => sc.name === formData.serviceCenter);

  const getMinDateTime = () => {
    return format(new Date(), "yyyy-MM-dd'T'HH:mm");
  };

  const getSuggestedDateTime = () => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(9, 0, 0, 0); // 9 AM tomorrow
    return format(tomorrow, "yyyy-MM-dd'T'HH:mm");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" gutterBottom>
            Schedule Service
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule maintenance or repair service for a vehicle
          </Typography>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column - Service Details */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <ServiceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Service Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Autocomplete
                      options={vehicles || []}
                      getOptionLabel={(vehicle: any) => {
                        if (!vehicle) return '';
                        const reg = vehicle.registrationNumber || vehicle.vehicleNumber || `#${vehicle.id}`;
                        const oem = vehicle?.model?.oem?.name || vehicle?.model?.oemName || vehicle?.oem?.name || '';
                        const model = vehicle?.model?.name || vehicle?.modelName || '';
                        const rest = [oem, model].filter(Boolean).join(' ');
                        return rest ? `${reg} - ${rest}` : `${reg}`;
                      }}
                      value={selectedVehicle || null}
                      onChange={(_, newValue) => {
                        setFormData({...formData, vehicleId: newValue?.id || ''});
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Vehicle"
                          required
                          helperText="Search by registration number or model"
                        />
                      )}
                      renderOption={(props, vehicle: any) => (
                        <Box component="li" {...props}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.light' }}>
                            <VehicleIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="body1" fontWeight="bold">
                              {vehicle?.registrationNumber || vehicle?.vehicleNumber || `#${vehicle?.id}`}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {(vehicle?.model?.oem?.name || vehicle?.modelName || '')}
                              {vehicle?.model?.name ? ` ${vehicle.model.name}` : ''}{' '}
                              • {vehicle?.mileage ?? 'N/A'} km
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Service Type</InputLabel>
                      <Select
                        value={formData.serviceType}
                        onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                      >
                        {serviceTypes.map((type) => (
                          <MenuItem key={type} value={type}>{type}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      >
                        {priorityOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Chip label={option.label} color={option.color} size="small" />
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Scheduled Date & Time"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinDateTime() }}
                      helperText="Minimum: Tomorrow 9:00 AM"
                      required
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Estimated Cost (₹)"
                      type="number"
                      value={formData.estimatedCost}
                      onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
                      helperText="Optional: Enter expected service cost"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Service Description"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the service requirements, issues, or specific work needed..."
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Mechanic Preference"
                      value={formData.mechanicPreference}
                      onChange={(e) => setFormData({...formData, mechanicPreference: e.target.value})}
                      placeholder="Preferred mechanic name (optional)"
                      helperText="Leave blank for automatic assignment"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      multiline
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any additional instructions or notes..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Service Center & Summary */}
          <Grid item xs={12} md={4}>
            {/* Service Center Selection */}
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Service Center
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControl fullWidth required>
                  <InputLabel>Select Service Center</InputLabel>
                  <Select
                    value={formData.serviceCenter}
                    onChange={(e) => setFormData({...formData, serviceCenter: e.target.value})}
                  >
                    {serviceCenters.map((center) => (
                      <MenuItem key={center.id} value={center.name}>
                        {center.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {selectedServiceCenter && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedServiceCenter.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📍 {selectedServiceCenter.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      🏭 Capacity: {selectedServiceCenter.capacity} vehicles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Specialties:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {selectedServiceCenter.specialties.map((specialty) => (
                        <Chip
                          key={specialty}
                          label={specialty}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Suggested Time"
                      secondary="Tomorrow 9:00 AM"
                      onClick={() => setFormData({...formData, scheduledDate: getSuggestedDateTime()})}
                      sx={{ cursor: 'pointer' }}
                    />
                  </ListItem>
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading || !formData.vehicleId || !formData.serviceType || !formData.scheduledDate}
                  startIcon={<SaveIcon />}
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Scheduling...' : 'Schedule Service'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ mt: 1 }}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceScheduleForm;
