import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Typography,
  Avatar,
  useTheme,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as TaskIcon,
  ConfirmationNumber as TicketIcon,
  Build as CustomIcon,
  ExpandMore as ExpandMoreIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon
} from '@mui/icons-material';
import { CUSTOM_REPORT_FIELDS, validateReportParameters } from '../../utils/reportUtils';

const NewReportDialog = ({
  open,
  onClose,
  newReport,
  onNewReportChange,
  onAddReport,
  loading,
  users,
  selectedUserId,
  onSelectedUserIdChange
}) => {
  const theme = useTheme();
  
  // State for custom report field selection
  const [selectedFields, setSelectedFields] = useState([]);
  const [errors, setErrors] = useState([]);

  // Initialize selected fields when report type changes
  useEffect(() => {
    if (newReport.type === 'custom') {
      setSelectedFields(newReport.parameters?.selectedFields || []);
    } else {
      setSelectedFields([]);
    }
  }, [newReport.type, newReport.parameters?.selectedFields]);

  const handleFieldToggle = (fieldKey) => {
    const newSelectedFields = selectedFields.includes(fieldKey)
      ? selectedFields.filter(f => f !== fieldKey)
      : [...selectedFields, fieldKey];
    
    setSelectedFields(newSelectedFields);
    
    // Update the report parameters
    onNewReportChange({
      target: {
        name: 'parameters',
        value: {
          ...newReport.parameters,
          selectedFields: newSelectedFields
        }
      }
    });
  };

  const handleSelectAll = (category) => {
    const categoryFields = CUSTOM_REPORT_FIELDS[category].map(field => field.key);
    const newSelectedFields = [...new Set([...selectedFields, ...categoryFields])];
    
    setSelectedFields(newSelectedFields);
    onNewReportChange({
      target: {
        name: 'parameters',
        value: {
          ...newReport.parameters,
          selectedFields: newSelectedFields
        }
      }
    });
  };

  const handleDeselectAll = (category) => {
    const categoryFields = CUSTOM_REPORT_FIELDS[category].map(field => field.key);
    const newSelectedFields = selectedFields.filter(field => !categoryFields.includes(field));
    
    setSelectedFields(newSelectedFields);
    onNewReportChange({
      target: {
        name: 'parameters',
        value: {
          ...newReport.parameters,
          selectedFields: newSelectedFields
        }
      }
    });
  };

  const handleSubmit = () => {
    const validationErrors = validateReportParameters(newReport);
    
    // Add user selection validation for user reports
    if (newReport.type === 'user' && !selectedUserId) {
      validationErrors.push('User selection is required for user reports');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setErrors([]);
    onAddReport();
  };

  const getReportTypeIcon = (type) => {
    switch (type) {
      case 'ticket':
        return <TicketIcon color="error" />;
      case 'task':
        return <TaskIcon color="primary" />;
      case 'user':
        return <PersonIcon color="secondary" />;
      case 'department':
        return <BusinessIcon color="info" />;
      case 'custom':
        return <CustomIcon color="default" />;
      default:
        return <AssessmentIcon />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 3,
        pt: 3,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2
      }}>
        <AssessmentIcon sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
        <Box sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          Generate New Report
        </Box>
      </DialogTitle>
            <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">
              {errors.join(', ')}
            </Typography>
          </Alert>
        )}
        
              <Grid container spacing={3}>
          {/* Report Type */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Report Type</InputLabel>
              <Select
                label="Report Type"
                name="type"
                value={newReport.type}
                onChange={onNewReportChange}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="task">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TaskIcon color="primary" />
                    Task Reports
                  </Box>
                </MenuItem>
                <MenuItem value="ticket">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TicketIcon color="error" />
                    Ticket Reports
                  </Box>
                </MenuItem>
                <MenuItem value="user">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon color="secondary" />
                    User Reports
                  </Box>
                </MenuItem>
                <MenuItem value="department">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon color="info" />
                    Department Reports
                  </Box>
                </MenuItem>
                <MenuItem value="custom">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CustomIcon color="default" />
                    Custom Reports
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* User Selection for User Reports */}
          {newReport.type === 'user' && (
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontSize: '0.875rem', fontWeight: 500 }}>Select User</InputLabel>
                <Select
                  label="Select User"
                  value={selectedUserId}
                  onChange={(e) => onSelectedUserIdChange(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {user.firstname?.[0]}{user.lastname?.[0]}
                        </Avatar>
                        {user.firstname} {user.lastname}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}



          {/* Report Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Report Title"
              name="title"
              value={newReport.title}
              onChange={onNewReportChange}
              required
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>

          {/* Report Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newReport.description}
              onChange={onNewReportChange}
              multiline
              rows={3}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>

          {/* Date Range */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              name="startDate"
              value={newReport.parameters?.startDate || ''}
              onChange={(e) => onNewReportChange({
                target: {
                  name: 'parameters',
                  value: {
                    ...newReport.parameters,
                    startDate: e.target.value
                  }
                }
              })}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              name="endDate"
              value={newReport.parameters?.endDate || ''}
              onChange={(e) => onNewReportChange({
                target: {
                  name: 'parameters',
                  value: {
                    ...newReport.parameters,
                    endDate: e.target.value
                  }
                }
              })}
              InputLabelProps={{ shrink: true }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Grid>

          {/* Custom Report Field Selection */}
          {newReport.type === 'custom' && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                Select Fields to Include
              </Typography>
              
              {Object.entries(CUSTOM_REPORT_FIELDS).map(([category, fields]) => (
                <Accordion key={category} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getReportTypeIcon(category.replace('Metrics', ''))}
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {category.replace('Metrics', ' Metrics')}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Button 
                        size="small" 
                        onClick={() => handleSelectAll(category)}
                      >
                        Select All
                      </Button>
                      <Button 
                        size="small" 
                        onClick={() => handleDeselectAll(category)}
                      >
                        Deselect All
                      </Button>
                    </Box>
                    <FormGroup>
                      {fields.map(field => (
                        <FormControlLabel
                          key={field.key}
                          control={
                            <Checkbox
                              checked={selectedFields.includes(field.key)}
                              onChange={() => handleFieldToggle(field.key)}
                              icon={<CheckBoxOutlineBlankIcon />}
                              checkedIcon={<CheckBoxIcon />}
                            />
                          }
                          label={field.label}
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        pt: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        gap: 2,
        justifyContent: 'flex-end'
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={<AssessmentIcon />}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600
          }}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewReportDialog;
