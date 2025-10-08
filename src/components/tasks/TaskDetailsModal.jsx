/**
 * Task Details Modal Component
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Divider,
  Button
} from '@mui/material';
import {
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { 
  getPriorityColor, 
  getStatusColor, 
  formatAssigneeName,
  getTaskMaturityColor,
  getTaskMaturityText
} from '../../utils/taskUtils';
import { formatDate } from '../../utils/ticketUtils';
import CommentSection from '../CommentSection';
import FileUploadSection from '../FileUploadSection';
import { commentAPI } from '../../services';
import { fileAPI } from '../../services/api';

const TaskDetailsModal = ({
  open,
  onClose,
  task,
  departmentUsers = [],
  user
}) => {
  if (!task) return null;

  // Find the assigned user from departmentUsers
  const assignedUser = task && task.assignedToId && departmentUsers.find(u => u.id === task.assignedToId);
  const assignedToName = formatAssigneeName(assignedUser);

  // Add the download handler for ticket files
  const handleTicketFileDownload = async (file) => {
    const url = file.url || `/api/files/${file.id}/download`;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to download file');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = file.file_name || file.name || 'attachment';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert('Failed to download file');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Task Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {task.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {task.description}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
            <Chip 
              label={task.priority} 
              color={getPriorityColor(task.priority)} 
              size="small" 
            />
            <Chip 
              label={(task.status || '').replace('_', ' ')} 
              color={getStatusColor(task.status)} 
              size="small" 
            />
          </Box>
          
          <Typography variant="body2">
            <b>Assigned To:</b> {assignedToName}
          </Typography>
          
          {task.dueDate && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <CalendarIcon sx={{ fontSize: 16 }} color="action" />
                <Typography variant="body2">
                  <b>Due Date:</b> {formatDate(task.dueDate)}
                </Typography>
              </Box>
              {(() => {
                const maturityColor = getTaskMaturityColor(task);
                const maturityText = getTaskMaturityText(task);
                if (!maturityColor || !maturityText) return null;
                return (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={maturityText}
                      size="small"
                      color={maturityColor}
                      sx={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 600, 
                        borderRadius: 2, 
                        px: 0.5, 
                        height: 18, 
                        boxShadow: 1, 
                        minWidth: 60, 
                        justifyContent: 'center' 
                      }}
                    />
                  </Box>
                );
              })()}
            </>
          )}
          
          {/* Show related ticket details if present */}
          {task.relatedTicket && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'background.default', 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider' 
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Related Ticket
              </Typography>
              <Typography variant="body2">
                <b>Title:</b> {task.relatedTicket.title}
              </Typography>
              <Typography variant="body2">
                <b>Description:</b> {task.relatedTicket.description}
              </Typography>
              <Typography variant="body2">
                <b>Status:</b> {task.relatedTicket.status}
              </Typography>
              <Typography variant="body2">
                <b>Priority:</b> {task.relatedTicket.priority}
              </Typography>
              {task.relatedTicket.due_date && (
                <Typography variant="body2">
                  <b>Due Date:</b> {task.relatedTicket.due_date}
                </Typography>
              )}
              
              {/* Ticket Attachments */}
              {Array.isArray(task.relatedTicket.attachments) && 
               task.relatedTicket.attachments.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Attachments:
                  </Typography>
                  {task.relatedTicket.attachments.map(file => (
                    <Box key={file.id || file.file_name} sx={{ mb: 0.5 }}>
                      <span
                        style={{ 
                          color: 'primary.main', 
                          textDecoration: 'underline', 
                          fontSize: '0.95em', 
                          cursor: 'pointer' 
                        }}
                        onClick={() => handleTicketFileDownload(file)}
                      >
                        {file.file_name || file.name}
                      </span>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
        
        {/* Comments Section */}
        <CommentSection
          entityId={task.id}
          fetchComments={commentAPI.fetchComments}
          addComment={commentAPI.addComment}
          deleteComment={commentAPI.deleteComment}
          user={user}
        />
        
        {/* File Upload Section */}
        <FileUploadSection
          entityId={task.id}
          fetchFiles={(id) => fileAPI.getByEntity('task', id)}
          uploadFile={(id, file) => fileAPI.upload(file, 'task', id)}
          deleteFile={(id, fileId) => fileAPI.delete(fileId)}
          entityType="task"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsModal; 