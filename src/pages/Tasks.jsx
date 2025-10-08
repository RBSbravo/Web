/**
 * Tasks Page - Refactored with clean architecture
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Fade,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import TaskListItem from '../components/tasks/TaskListItem';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetailsModal from '../components/tasks/TaskDetailsModal';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskTableView from '../components/tasks/TaskTableView';
import TaskCardView from '../components/tasks/TaskCardView';
import { useTasks } from '../hooks/useTasks';
import PageHeader from '../components/layout/PageHeader';

const Tasks = () => {
  // Custom hook handles all task-related state and operations
  const {
    filteredTasks,
    departmentUsers,
    pendingTickets,
    loadingState,
    filter,
    searchQuery,
    selectedTask,
    detailsOpen,
    selectedTasks,
    updatingStatus,
    updatingPriority,
    creatingTask,
    successMessage,
    setFilter,
    setSearchQuery,
    setSelectedTask,
    setDetailsOpen,
    setSuccessMessage,
    loadPendingTickets,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskPriority,
    selectTask,
    closeDetails,
    canUpdateTask,
    user
  } = useTasks();

  // Local UI state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Handlers
  const handleCreateTask = () => {
    loadPendingTickets();
    setShowCreateForm(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    loadPendingTickets();
    setShowEditForm(true);
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const handleSubmitCreate = async (taskData) => {
    await createTask(taskData);
    setShowCreateForm(false);
  };

  const handleSubmitEdit = async (taskData) => {
    await updateTask(editingTask.id, taskData);
    setShowEditForm(false);
    setEditingTask(null);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await deleteTask(taskToDelete.id);
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    }
  };


  if (loadingState) {
    return <LoadingSpinner overlay message="Loading tasks..." />;
  }

    return (
        <Box sx={{ 
      flexGrow: 1, 
      pt: { xs: 7, sm: 3, md: 4 }, 
      px: { xs: 1, sm: 2, md: 3 }, 
            display: 'flex', 
            flexDirection: 'column', 
      height: '100%' 
    }}>
      <PageHeader 
        title="Tasks" 
        subtitle="Manage and track your department's tasks efficiently"
        emoji="✅"
        color="success"
        actionButton={{
          text: 'Add Task',
          icon: <AddIcon />,
          onClick: handleCreateTask,
        }}
      />

      {/* Scrollable Content */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto' }}>
        <Fade in={true} timeout={800}>
          <Box>
            {/* Filters */}
            <TaskFilters
              searchQuery={searchQuery}
              filter={filter}
              onSearchChange={setSearchQuery}
              onFilterChange={setFilter}
            />


            {/* Tasks List */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, px: 1 }}>
                All Tasks ({filteredTasks.length})
              </Typography>
              
              {filteredTasks.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography variant="body1">
                    No tasks found. Try adjusting your filters or add a new task.
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Table view for desktop */}
                  <TaskTableView
                    tasks={filteredTasks}
                    departmentUsers={departmentUsers}
                    canUpdateTask={canUpdateTask}
                    selectedTasks={selectedTasks}
                    updatingStatus={updatingStatus}
                    updatingPriority={updatingPriority}
                    onSelectTask={selectTask}
                    onViewDetails={handleViewDetails}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onUpdateStatus={updateTaskStatus}
                    onUpdatePriority={updateTaskPriority}
                  />
                  
                  {/* Card view for mobile */}
                  <TaskCardView
                    tasks={filteredTasks}
                    departmentUsers={departmentUsers}
                    canUpdateTask={canUpdateTask}
                    selectedTasks={selectedTasks}
                    updatingStatus={updatingStatus}
                    updatingPriority={updatingPriority}
                    onSelectTask={selectTask}
                    onViewDetails={handleViewDetails}
                    onEditTask={handleEditTask}
                    onDeleteTask={handleDeleteTask}
                    onUpdateStatus={updateTaskStatus}
                    onUpdatePriority={updateTaskPriority}
                  />
                </>
              )}
                                  </Box>
                  </Box>
        </Fade>
                                </Box>

      {/* Create Task Form */}
      <TaskForm
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleSubmitCreate}
        departmentUsers={departmentUsers}
        pendingTickets={pendingTickets}
        loading={creatingTask}
        mode="create"
      />

      {/* Edit Task Form */}
      <TaskForm
        open={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingTask(null);
        }}
        onSubmit={handleSubmitEdit}
        initialData={editingTask}
        departmentUsers={departmentUsers}
        pendingTickets={pendingTickets}
        loading={false}
        mode="edit"
      />

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        task={selectedTask}
        departmentUsers={departmentUsers}
        user={user}
      />

      {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>Delete Task</DialogTitle>
              <DialogContent>
          <Typography>
            Are you sure you want to delete this task? This action cannot be undone.
          </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
            disabled={creatingTask}
          >
            Delete
          </Button>
              </DialogActions>
            </Dialog>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        ContentProps={{
          sx: { backgroundColor: 'success.main', color: 'white', fontWeight: 600 }
        }}
      />
    </Box>
  );
};

export default Tasks; 