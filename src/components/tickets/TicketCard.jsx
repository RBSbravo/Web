import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  PriorityHigh as PriorityHighIcon,
  Remove as PriorityMediumIcon,
  LowPriority as PriorityLowIcon,
} from '@mui/icons-material';
import { getTicketMaturityColor, getTicketMaturityText, getUserDisplayName, getDepartmentName, formatDate } from '../../utils/ticketUtils';

const TicketCard = ({ 
  ticket, 
  departments, 
  users,
  activeTab, 
  onViewTicket, 
  onEditTicket, 
  onDeleteTicket,
  getPriorityColor,
  getPriorityIcon,
  getStatusColor,
  getTicketFiles,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Helper function to get user name by ID or user object
  const getUserName = (userIdOrUser) => {
    if (!userIdOrUser) return 'Unknown';
    
    // If it's already a user object (from association), use it directly
    if (typeof userIdOrUser === 'object' && userIdOrUser.firstname) {
      return getUserDisplayName(userIdOrUser);
    }
    
    // If it's a user ID, find the user in the users array
    const user = users.find(u => u.id === userIdOrUser);
    return getUserDisplayName(user);
  };

  if (!isMobile) {
    return null; // Desktop uses table instead
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, wordBreak: 'break-word' }}>
              {ticket.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
              {ticket.description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={ticket.priority}
            size="small"
            color={getPriorityColor(ticket.priority)}
            icon={(() => {
              const iconName = getPriorityIcon(ticket.priority);
              switch (iconName) {
                case 'PriorityHigh': return <PriorityHighIcon sx={{ fontSize: 14 }} />;
                case 'Remove': return <PriorityMediumIcon sx={{ fontSize: 14 }} />;
                case 'LowPriority': return <PriorityLowIcon sx={{ fontSize: 14 }} />;
                default: return <PriorityMediumIcon sx={{ fontSize: 14 }} />;
              }
            })()}
            sx={{ fontSize: '0.75rem', fontWeight: 600, borderRadius: 2 }}
          />
          <Chip
            label={ticket.status.replace('_', ' ')}
            size="small"
            color={getStatusColor(ticket.status)}
            sx={{ fontSize: '0.75rem', fontWeight: 600, borderRadius: 2 }}
          />
          {(() => {
            const maturityColor = getTicketMaturityColor(ticket);
            const maturityText = getTicketMaturityText(ticket);
            
            if (!maturityColor || !maturityText) {
              return null;
            }
            
            return (
              <Chip
                label={maturityText}
                size="small"
                color={maturityColor}
                sx={{ fontSize: '0.75rem', fontWeight: 600, borderRadius: 2 }}
              />
            );
          })()}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>{activeTab === 0 ? 'Send To' : activeTab === 1 ? 'Sent By' : activeTab === 2 ? 'Forwarded To' : 'Created By'}:</strong> {
              activeTab === 0 
                ? getUserName(ticket.ticketAssignee || ticket.assignedTo || ticket.assigned_to)
                : activeTab === 1 
                  ? getUserName(ticket.ticketCreator || ticket.createdBy || ticket.created_by)
                  : activeTab === 2 
                    ? getUserName(ticket.forwarded_to_id)
                    : getUserName(ticket.ticketCreator || ticket.createdBy || ticket.created_by)
            }
          </Typography>
          {ticket.due_date && (
            <Typography variant="body2" color="text.secondary">
              <strong>Due Date:</strong> {formatDate(ticket.due_date)}
            </Typography>
          )}
        </Box>

        {getTicketFiles(ticket.id).length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AttachFileIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {getTicketFiles(ticket.id).length} file(s) attached
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, flexWrap: 'wrap', justifyContent: 'flex-end', bgcolor: 'action.selected', borderRadius: 2, px: 1, py: 0.5, boxShadow: 1 }}>
            <Tooltip title="View Details">
              <span>
                <IconButton 
                  color="primary" 
                  size="small" 
                  onClick={() => onViewTicket(ticket)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Edit Ticket">
              <span>
                <IconButton 
                  color="secondary" 
                  size="small" 
                  onClick={() => onEditTicket(ticket)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete Ticket">
              <span>
                <IconButton 
                  color="error" 
                  size="small" 
                  onClick={() => onDeleteTicket(ticket)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TicketCard;
