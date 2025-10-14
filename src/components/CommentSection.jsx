import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, TextField, Button, CircularProgress, Divider, IconButton, Dialog, DialogTitle, DialogActions, useTheme } from '@mui/material';
import { Person as PersonIcon, Delete as DeleteIcon } from '@mui/icons-material';

/**
 * Props:
 * - entityId: string (ticketId or taskId)
 * - fetchComments: (id) => Promise<{data: Array<{id, author, content, createdAt, userId}>}>
 * - addComment: (id, comment) => Promise
 * - deleteComment: (commentId) => Promise
 * - user: current user object
 */
const CommentSection = ({ entityId, fetchComments, addComment, deleteComment, user }) => {
  const theme = useTheme();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');


  // Helper functions for comment highlighting
  const isOwnComment = (comment) => {
    if (!user) return false;
    return comment.author_id === user.id || 
           comment.authorId === user.id || 
           comment.userId === user.id ||
           (comment.author && comment.author.id === user.id) ||
           (comment.commentUser && comment.commentUser.id === user.id);
  };

  const canDeleteComment = (comment) => {
    if (!user) return false;
    
    // Don't allow deletion of remarks-comments (update type comments)
    if (comment.comment_type === 'update' || 
        (comment.content && comment.content.startsWith('📝 **Task Updated**'))) {
      return false;
    }
    
    // Only allow users to delete their own regular comments
    return comment.author_id === user.id || 
           comment.authorId === user.id || 
           comment.userId === user.id ||
           (comment.author && comment.author.id === user.id) ||
           (comment.commentUser && comment.commentUser.id === user.id);
  };

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetchComments(entityId);
      // Handle both direct data and Axios response format
      const commentsData = res.data || res || [];
      setComments(commentsData);
    } catch (e) {
      console.error('Error loading comments:', e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) loadComments();
    // eslint-disable-next-line
  }, [entityId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      console.log('Submitting comment:', { entityId, content: comment });
      await addComment(entityId, { content: comment });
      setComment('');
      loadComments();
    } catch (e) {
      let msg = 'Failed to add comment.';
      if (e.response && e.response.data) {
        if (e.response.data.error) msg = e.response.data.error;
        else if (e.response.data.errors && Array.isArray(e.response.data.errors)) msg = e.response.data.errors.map(er => er.msg || er.error || JSON.stringify(er)).join('\n');
        else msg = JSON.stringify(e.response.data);
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteComment(deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
      loadComments();
    } catch (e) {
      // Optionally show error
    }
  };


  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Comments</Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <List dense sx={{ maxHeight: 200, overflowY: 'auto', mb: 2 }}>
          {comments.length === 0 && <Typography variant="body2" color="text.secondary">No comments yet.</Typography>}
          {comments.map((c) => (
            <React.Fragment key={c.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  bgcolor: isOwnComment(c) ? 'primary.light' + '10' : 'transparent',
                  border: isOwnComment(c) ? `1px solid ${theme.palette.primary.light}` : 'none',
                  borderRadius: isOwnComment(c) ? 1 : 0,
                  '&:hover': {
                    bgcolor: isOwnComment(c) ? 'primary.light' + '15' : 'action.hover',
                  }
                }}
                secondaryAction={
                  canDeleteComment(c) && (
                    <IconButton 
                      edge="end" 
                      aria-label="delete comment"
                      onClick={() => handleDelete(c.id)}
                      size="small"
                      sx={{
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: theme.palette.error.light + '20',
                          color: theme.palette.error.dark,
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar><PersonIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography sx={{ fontWeight: 500 }} component="span">
                        {typeof c.commentUser === 'object'
                          ? (c.commentUser.firstname && c.commentUser.lastname
                              ? `${c.commentUser.firstname} ${c.commentUser.lastname}`
                              : c.commentUser.firstName && c.commentUser.lastName
                                ? `${c.commentUser.firstName} ${c.commentUser.lastName}`
                                : c.commentUser.username || c.commentUser.email || c.commentUser.id)
                          : c.commentUser}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" component="span">
                        {new Date(c.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      component="span"
                      sx={{ 
                        lineHeight: 1.5,
                        fontSize: '0.875rem'
                      }}
                    >
                      {c.content && c.content.startsWith('📝 **Task Updated**') ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Task Updated
                          </Typography>
                            <Box
                              sx={{
                                color: theme.palette.text.primary,
                                backgroundColor: '#f5f5f5',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid #e0e0e0`,
                                display: 'inline-block',
                                width: '100%'
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'normal', mb: 0.5, color: theme.palette.text.secondary }}>
                                Remarks:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'normal' }}>
                                {c.content
                                  .replace('📝 **Task Updated**', '')
                                  .replace(/^\n+/, '')
                                  .replace(/^Remarks:\n?/, '')}
                              </Typography>
                            </Box>
                        </Box>
                        ) : c.comment_type === 'update' ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Ticket Updated
                            </Typography>
                            <Box
                              sx={{
                                color: theme.palette.text.primary,
                                backgroundColor: '#f5f5f5',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                borderLeft: `3px solid #e0e0e0`,
                                display: 'inline-block',
                                width: '100%'
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 'normal', mb: 0.5, color: theme.palette.text.secondary }}>
                                Remarks:
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 'normal' }}>
                                {c.content.split('\n').slice(2).join('\n').replace('Remarks:\n', '')}
                              </Typography>
                            </Box>
                          </Box>
                        ) : c.comment_type === 'forward' ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Ticket Forwarded
                            </Typography>
                            <Box
                              sx={{
                                color: theme.palette.info.main,
                                backgroundColor: theme.palette.info.light,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                borderLeft: `4px solid ${theme.palette.info.main}`,
                                display: 'inline-block',
                                mb: 1
                              }}
                            >
                              <Typography variant="body2" sx={{ mb: 0.5 }}>
                                <strong>To:</strong> {c.content.split('\n')[2]?.replace('To: ', '')}
                              </Typography>
                              <Typography variant="body2">
                                <strong>Reason:</strong> {c.content.split('\n')[3]?.replace('Reason: ', '')}
                              </Typography>
                            </Box>
                          </Box>
                      ) : c.comment_type === 'response' ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Forward Response
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 0.5 }}>
                            Action: {c.content.split('\n')[2]?.replace('Action: ', '')}
                          </Typography>
                          {c.content.split('\n')[3] && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              {c.content.split('\n')[3]}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        c.content
                      )}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
      <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Add a comment..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={submitting}
        />
        <Button type="submit" variant="contained" disabled={submitting || !comment.trim()}>
          Post
        </Button>
      </Box>
      {errorMsg && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>{errorMsg}</Typography>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ pb: 1 }}>Delete this comment?</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{
              borderColor: theme.palette.divider,
              color: 'text.secondary',
              '&:hover': {
                borderColor: theme.palette.action.hover,
                backgroundColor: theme.palette.action.hover,
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            color="error" 
            variant="contained" 
            onClick={confirmDelete}
            sx={{
              backgroundColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.dark',
              },
              boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)',
              '&:active': {
                boxShadow: '0 1px 2px rgba(244, 67, 54, 0.3)',
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentSection; 