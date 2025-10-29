import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Alert,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  FileUpload as FileUploadIcon,
  Comment as CommentIcon,
  Settings as SettingsIcon,
  Star as StarIcon,
  Help as HelpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

const UserGuide = () => {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
        📚 Comprehensive User Guide
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
        Welcome to the Ticketing and Task Management System! This guide will help you navigate and utilize all the features effectively.
      </Typography>

      {/* Navigation Overview */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MenuIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Navigation & Layout
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Sidebar Navigation
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Dashboard</strong> - Overview of your tasks, tickets, and performance metrics
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Tickets</strong> - Submit, view, and manage support tickets
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Tasks</strong> - Create, manage, and track your assigned tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Kanban Board</strong> - Visual task management with drag-and-drop
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Analytics</strong> - Performance insights and reports
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Reports</strong> - Generate detailed reports
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Employees</strong> - Manage team members (Admin/Department Head only)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Settings</strong> - Account settings (Edit Profile, Change Password)
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Header Features
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Menu Button</strong> - Toggle sidebar on mobile/tablet
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Department Badge</strong> - Shows your current department
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Theme Toggle</strong> - Switch between light/dark mode
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Notifications</strong> - View system notifications
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Profile Menu</strong> - Access  logout
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Dashboard Guide */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DashboardIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Dashboard Overview
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The dashboard provides a comprehensive overview of your work status and performance metrics.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Key Metrics Cards
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Total Tickets</strong> - All Department tickets received.
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Open Tickets</strong> - Currently active tickets
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Closed Tickets</strong> - Completed tickets
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Overdue Tickets</strong> - Tickets past due date
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Total Tasks</strong> - All Department tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Completed Tasks</strong> - Finished tasks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Overdue Tasks</strong> - Tasks past due date
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Active Users</strong> - Department users
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Recent Activity
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Recent Tickets</strong> - Latest ticket updates
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Recent Tasks</strong> - Latest task activities
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Team Performance</strong> - Department efficiency metrics
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Performance Rating</strong> - Your efficiency score
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Tasks Management */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tasks Management
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Create, assign, and track tasks efficiently with our comprehensive task management system.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Creating Tasks
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  1. Click the <strong>"New Task"</strong> button
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  2. Fill in task details (title, description, priority)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  3. Assign to team members
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  4. Set due date and status
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  5. Upload relevant files (optional)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  6. Click <strong>"Create Task"</strong>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Task Management
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>View</strong> - Click eye icon to see full details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Edit</strong> - Click edit icon to modify task
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Delete</strong> - Click delete icon to remove task
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Status Updates</strong> - Change status from dropdown
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Priority Changes</strong> - Update priority level
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Comments</strong> - Add progress updates
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'primary.main' }}>
            Task Statuses
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Completed
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Tickets Management */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ConfirmationNumberIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tickets Management
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Submit, track, and manage support tickets with comprehensive workflow management.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Creating Tickets
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  1. Click <strong>"New Ticket"</strong> button
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  2. Enter ticket title and description
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  3. Select priority level (Low, Medium, High)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  4. Choose target department
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  5. Set due date
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  6. Upload supporting files
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  7. Click <strong>"Create Ticket"</strong>
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Ticket Operations
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>View</strong> - See full ticket details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Edit</strong> - Modify ticket information
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Forward</strong> - Send to another department
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Comments</strong> - Add updates and remarks
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Management</strong> - Upload/download files
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Status Tracking</strong> - Monitor progress
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'primary.main' }}>
            Ticket Priorities
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Low
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Medium
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  High
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, mt: 3, color: 'primary.main' }}>
            Ticket Statuses
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
                <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Pending
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  In Progress
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'success.light', borderRadius: 2 }}>
                <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
                <ErrorIcon sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Declined
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* File Management */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FileUploadIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              File Management
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Upload, manage, and organize files for tasks and tickets efficiently.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Supported File Types
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>PDF Documents</strong> - PDF files only
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Images</strong> - JPG, PNG, GIF, WEBP, BMP
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                File Operations
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Upload</strong> - Drag & drop or click to upload
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Download</strong> - Click download icon
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Delete</strong> - Remove unwanted files
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Preview</strong> - View files in browser
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Size Limit</strong> - Max 10MB per file
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Restrictions</strong> - Only PDF and image files accepted
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Important:</strong> Only PDF and image files are accepted for uploads. When uploading or deleting files during task/ticket editing, you must provide remarks explaining the changes. The cancel button will be disabled until you complete the update with remarks.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Comments & Communication */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CommentIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Comments & Communication
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Keep track of progress and communicate effectively with your team through comments and updates.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Adding Comments
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  1. Open task or ticket details
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  2. Scroll to comments section
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  3. Type your comment
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  4. Click <strong>"Add Comment"</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  5. Comments appear in chronological order
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Comment Types
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Regular Comments</strong> - General updates
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Status Updates</strong> - Progress changes
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Remarks</strong> - Required for file operations
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>System Updates</strong> - Automatic notifications
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> Remarks comments (system-generated updates) cannot be deleted. Only regular comments can be removed by their authors.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>

      {/* Responsive Design */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Responsive Design Features
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 3 }}>
            The application is fully responsive and optimized for all device types.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Mobile View
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Collapsible sidebar
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Card-based layouts
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Touch-friendly buttons
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Optimized typography
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Tablet View
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Collapsible sidebar
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Card-based layouts
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Full-width content
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Enhanced touch targets
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Desktop View
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Permanent sidebar
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Table-based layouts
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Full feature access
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Keyboard shortcuts
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Tips & Best Practices */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StarIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tips & Best Practices
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                General Tips
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Use descriptive titles for tasks and tickets
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Set realistic due dates
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Update status regularly
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Add meaningful comments
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Use appropriate priority levels
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Upload relevant supporting files
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Security Best Practices
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Use strong passwords
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Log out when finished
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Don't share login credentials
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Report suspicious activity
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Keep personal info updated
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • Use secure networks
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Support Information */}
      <Accordion sx={{ mb: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Need Help?
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body1" sx={{ mb: 3 }}>
            If you need additional assistance or have questions not covered in this guide, please contact your system administrator or IT support team.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Common Issues
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Login Problems</strong> - Check credentials or reset password
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>File Upload Issues</strong> - Check file size and format (PDF/images only)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Performance Issues</strong> - Clear browser cache
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Display Problems</strong> - Try refreshing the page
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Contact Information
              </Typography>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>IT Support</strong> - For technical issues
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Department Head</strong> - For workflow questions
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>System Admin</strong> - For account issues
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>User Guide</strong> - This comprehensive guide
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Thank you for using the Ticketing and Task Management System!</strong> This guide is regularly updated to reflect new features and improvements.
            </Typography>
          </Alert>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default UserGuide;
