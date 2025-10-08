/**
 * Bulk Actions Toolbar Component
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  CircularProgress
} from '@mui/material';

const BulkActionsToolbar = ({
  selectedCount,
  bulkUpdating,
  onClearSelection,
  onBulkStatusUpdate,
  onBulkPriorityUpdate,
  onBulkDelete
}) => {
  const [bulkActionAnchor, setBulkActionAnchor] = useState(null);

  const handleBulkActionClick = (event) => {
    setBulkActionAnchor(event.currentTarget);
  };

  const handleBulkActionClose = () => {
    setBulkActionAnchor(null);
  };

  const handleStatusUpdate = (status) => {
    onBulkStatusUpdate(status);
    handleBulkActionClose();
  };

  const handlePriorityUpdate = (priority) => {
    onBulkPriorityUpdate(priority);
    handleBulkActionClose();
  };

  const handleDelete = () => {
    onBulkDelete();
    handleBulkActionClose();
  };

  if (selectedCount === 0) return null;

  return (
    <Box sx={{ 
      mb: 2, 
      p: 2, 
      bgcolor: 'primary.light', 
      borderRadius: 2, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 2,
      flexWrap: 'wrap'
    }}>
      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
        {selectedCount} task{selectedCount !== 1 ? 's' : ''} selected
      </Typography>
      
      <Button
        size="small"
        variant="contained"
        onClick={handleBulkActionClick}
        disabled={bulkUpdating}
        sx={{ 
          bgcolor: 'white', 
          color: 'primary.main', 
          '&:hover': { bgcolor: 'grey.100' } 
        }}
      >
        Bulk Actions
      </Button>
      
      <Button
        size="small"
        variant="outlined"
        onClick={onClearSelection}
        disabled={bulkUpdating}
        sx={{ 
          color: 'white', 
          borderColor: 'white', 
          '&:hover': { 
            borderColor: 'white', 
            bgcolor: 'rgba(255,255,255,0.1)' 
          } 
        }}
      >
        Clear Selection
      </Button>
      
      {bulkUpdating && (
        <CircularProgress size={20} sx={{ color: 'white' }} />
      )}
      
      <Menu
        anchorEl={bulkActionAnchor}
        open={Boolean(bulkActionAnchor)}
        onClose={handleBulkActionClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        {/* Status Updates */}
        <MenuItem onClick={() => handleStatusUpdate('pending')}>
          Set Status: Pending
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('in_progress')}>
          Set Status: In Progress
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('completed')}>
          Set Status: Completed
        </MenuItem>
        
        <Divider />
        
        {/* Priority Updates */}
        <MenuItem onClick={() => handlePriorityUpdate('low')}>
          Set Priority: Low
        </MenuItem>
        <MenuItem onClick={() => handlePriorityUpdate('medium')}>
          Set Priority: Medium
        </MenuItem>
        <MenuItem onClick={() => handlePriorityUpdate('high')}>
          Set Priority: High
        </MenuItem>
        
        <Divider />
        
        {/* Delete */}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          Delete Selected
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BulkActionsToolbar; 