import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Button, 
  CircularProgress, 
  Divider, 
  Dialog, 
  DialogTitle, 
  DialogActions, 
  DialogContent,
  Alert,
  Tooltip,
  TextField,
  useTheme
} from '@mui/material';
import { 
  AttachFile as AttachFileIcon, 
  Delete as DeleteIcon, 
  InsertDriveFile as FileIcon, 
  Visibility as ViewIcon 
} from '@mui/icons-material';
import { formatFileSize, validateFile } from '../utils/fileUtils';

/**
 * Props:
 * - entityId: string (ticketId or taskId)
 * - fetchFiles: (id) => Promise with data array
 * - uploadFile: (id, file) => Promise
 * - deleteFile: (id, fileId) => Promise
 * - maxFiles: number (default: 5)
 * - maxFileSize: number (default: 10MB)
 * - acceptedTypes: array (default: all file types)
 * - disabled: boolean (default: false)
 * - readOnly: boolean (default: false)
 */
const FileUploadSection = ({ 
  entityId, 
  fetchFiles, 
  uploadFile, 
  deleteFile,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['*/*'],
  disabled = false,
  readOnly = false,
  entityType = 'general' // 'task', 'ticket', 'comment', or 'general'
}) => {
  const theme = useTheme();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downloadFileObj, setDownloadFileObj] = useState(null);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewType, setPreviewType] = useState('image');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFiles(entityId);
      const filesData = res.data || res || [];
      
      // Ensure filesData is an array
      if (!Array.isArray(filesData)) {
        console.warn('Files data is not an array:', filesData);
        setFiles([]);
        return;
      }
      
      setFiles(filesData.map(f => ({
        ...f,
        name: f.name || f.file_name,
        file_name: f.file_name || f.name,
        file_size: f.file_size || f.size,
        url: f.url || `/api/files/${f.id}/download`,
        uploadedAt: f.uploadedAt || f.createdAt || f.created_at
      })));
    } catch (e) {
      console.error('Error loading files:', e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFiles, entityId]);

  useEffect(() => {
    if (entityId) {
      loadFiles();
    } else {
      // If no entityId (e.g., creating new ticket), set loading to false and files to empty
      setLoading(false);
      setFiles([]);
    }
    // eslint-disable-next-line
  }, [entityId]);

  const handleFileChange = useCallback(async (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;
    
    // Set file type restrictions based on entity type
    let finalAcceptedTypes = acceptedTypes;
    if (entityType === 'task' && acceptedTypes[0] === '*/*') {
      // For tasks, restrict to PDF and images only
      finalAcceptedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
      ];
    }
    
    // Validate file
    const validation = validateFile(file, {
      maxFileSize,
      acceptedTypes: finalAcceptedTypes,
      maxFiles,
      currentFileCount: files.length
    });
    
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setUploading(true);
    try {
      // If entityId is null (new ticket), the uploadFile function should handle temp files
      // If entityId exists (existing ticket), upload directly to server
      await uploadFile(entityId, file);
      
      // Reload files if we have an entityId, otherwise the parent component handles temp files
      if (entityId) {
        await loadFiles();
      } else {
        // For new tickets, refresh the files from the parent component
        // The parent should update the files prop
        setTimeout(() => {
          if (fetchFiles) {
            fetchFiles(entityId).then(res => {
              const filesData = res.data || res || [];
              if (Array.isArray(filesData)) {
                setFiles(filesData.map(f => ({
                  ...f,
                  name: f.name || f.file_name,
                  file_name: f.file_name || f.name,
                  file_size: f.file_size || f.size,
                  url: f.url || `/api/files/${f.id}/download`,
                  uploadedAt: f.uploadedAt || f.createdAt || f.created_at
                })));
              }
            }).catch(() => {
              // Ignore errors for temp files
            });
          }
        }, 100);
      }
    } catch (err) {
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to upload file';
      if (err.message.includes('Network Error') || err.message.includes('Cannot connect')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running.';
      } else if (err.response?.status === 413) {
        errorMessage = 'File is too large. Maximum size is 10MB.';
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.error || 'Invalid file or request.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Ticket not found. The ticket may have been deleted.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [files.length, maxFiles, maxFileSize, acceptedTypes, uploadFile, entityId, loadFiles, fetchFiles]);

  const handleDelete = (fileId) => {
    setDeleteId(fileId);
    setConfirmOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      // If entityId is null (new ticket), the deleteFile function should handle temp files
      // If entityId exists (existing ticket), delete from server
      await deleteFile(entityId, deleteId);
      setConfirmOpen(false);
      setDeleteId(null);
      
      // Reload files if we have an entityId, otherwise the parent component handles temp files
      if (entityId) {
        await loadFiles();
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
    }
  };

  // Helper for date display
  const getFileDate = (f) => {
    const dateStr = f.uploadedAt || f.createdAt || f.created_at;
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleString();
  };

  // Secure file download with auth header
  const downloadFile = async (file) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(file.url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        alert('Failed to download file');
        return;
      }
      const blob = await response.blob();
      // If we got HTML instead of the file, log the content to see the error
      if (blob.type === 'text/html') {
        throw new Error('Backend returned HTML instead of file. Check server logs.');
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download file');
    }
  };

  const handleDownloadClick = (file) => {
    setDownloadFileObj(file);
    setDownloadDialogOpen(true);
  };
  const confirmDownload = async () => {
    if (downloadFileObj) {
      try {
        // If entityId is null (new ticket), the file is a temp file
        // If entityId exists (existing ticket), download from server
        if (entityId) {
          await downloadFile(downloadFileObj);
        } else {
          // For temp files, use the file object directly
          if (downloadFileObj.file) {
            const url = URL.createObjectURL(downloadFileObj.file);
            const link = document.createElement('a');
            link.href = url;
            link.download = downloadFileObj.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
      } catch (err) {
        console.error('Error downloading file:', err);
        setError('Failed to download file');
      }
    }
    setDownloadDialogOpen(false);
    setDownloadFileObj(null);
  };

  const handleViewFile = async (file) => {
    try {
      let blob, url;
      
      // If entityId is null (new ticket), the file is a temp file
      // If entityId exists (existing ticket), fetch from server
      if (entityId) {
        const finalUrl = `https://backend-ticketing-system.up.railway.app/api/files/${file.id}/download`;
        
        const response = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        blob = await response.blob();

        // Check if the response is HTML (which indicates an error)
        if (blob.type === 'text/html') {
          throw new Error('Backend returned HTML instead of file. Check server logs.');
        }

        url = URL.createObjectURL(blob);
      } else {
        // For temp files, use the file object directly
        if (file.file) {
          blob = file.file;
          url = URL.createObjectURL(file.file);
        } else {
          throw new Error('File object not available for preview');
        }
      }
      
      // Determine file type for preview
      let type = blob.type;
      const fileName = file.file_name || file.name || '';
      const ext = fileName.split('.').pop().toLowerCase();
      
      // Fallback: check file extension if type is missing
      if (!type || type === 'application/octet-stream') {
        if (["jpg","jpeg","png","gif","bmp","webp"].includes(ext)) {
          type = 'image/' + ext;
        } else if (ext === 'pdf') {
          type = 'application/pdf';
        } else if (["txt","csv","json","md","log"].includes(ext)) {
          type = 'text/plain';
        }
      }

      setPreviewUrl(url);
      setPreviewText('');
      setPreviewError('');

      if (type.startsWith('image/')) {
        setPreviewType('image');
      } else if (type === 'application/pdf') {
        setPreviewType('pdf');
      } else if (type.startsWith('text/') || ["txt","csv","json","md","log"].includes(ext)) {
        const text = await blob.text();
        setPreviewText(text);
        setPreviewType('text');
      } else {
        setPreviewType('unsupported');
      }
      
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error viewing file:', error);
      setPreviewError(error.message);
      setPreviewType('error');
      setPreviewOpen(true);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Attachments
      </Typography>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <List dense sx={{ 
          maxHeight: 200, 
          overflowY: 'auto', 
          mb: 2,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' }
        }}>
          {files.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No attachments yet.
            </Typography>
          )}
          {files.map((file) => {
            const fileName = file.file_name || file.name || 'Unknown File';
            
            return (
              <React.Fragment key={file.id}>
                <ListItem
                  secondaryAction={
                    !readOnly && (
                      <Tooltip title="Delete file" arrow>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleDelete(file.id)}
                          color="error"
                          size="small"
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'error.light',
                              color: 'error.contrastText'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemIcon>
                    <FileIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Tooltip title="Click to download or view file" arrow>
                        <Typography
                          component="span"
                          sx={{ 
                            cursor: 'pointer', 
                            color: 'primary.main', 
                            textDecoration: 'underline',
                            '&:hover': { textDecoration: 'none' }
                          }}
                          onClick={() => handleDownloadClick(file)}
                        >
                          {fileName}
                        </Typography>
                      </Tooltip>
                    }
                    secondary={
                      <Typography variant="caption" color="text.disabled">
                        {getFileDate(file)} • {formatFileSize(file.file_size || file.size || 0)}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
            );
          })}
        </List>
      )}

      {!readOnly && (
        <Button
          variant="outlined"
          component="label"
          startIcon={<AttachFileIcon />}
          disabled={disabled || uploading}
          sx={{ mt: 1 }}
        >
          {uploading ? 'Uploading...' : entityType === 'task' ? 'Upload File (PDF & Images Only)' : 'Upload File'}
          <input
            type="file"
            hidden
            onChange={handleFileChange}
            accept={entityType === 'task' ? '.pdf,.jpg,.jpeg,.png,.gif,.webp,.bmp,application/pdf,image/*' : acceptedTypes.join(',')}
            disabled={disabled || uploading}
          />
        </Button>
      )}
      
      {/* File type info for tasks */}
      {!readOnly && entityType === 'task' && (
        <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
          Allowed file types: PDF, JPG, PNG, GIF, WebP, BMP (Max 10MB each)
        </Box>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete this file?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={downloadDialogOpen} onClose={() => setDownloadDialogOpen(false)}>
        <DialogTitle>Download this file?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDownloadDialogOpen(false)}>Cancel</Button>
          <Button startIcon={<ViewIcon />} onClick={() => handleViewFile(downloadFileObj)} disabled={!downloadFileObj}>View</Button>
          <Button variant="contained" onClick={confirmDownload} disabled={!downloadFileObj}>Download</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={previewOpen} onClose={() => { 
        setPreviewOpen(false); 
        setPreviewUrl(null); 
        setPreviewType(null); 
        setPreviewText(''); 
        setPreviewError(''); 
        setPdfLoadFailed(false);
      }} maxWidth="md" fullWidth>
        <DialogTitle>File Preview</DialogTitle>
        <DialogContent sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewType === 'image' && previewUrl && (
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: 500, display: 'block', margin: '0 auto' }} />
          )}
          {previewType === 'pdf' && previewUrl && (
            <Box sx={{ width: '100%', height: 500, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  Open in New Tab
                </Button>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewUrl;
                    a.download = 'document.pdf';
                    a.click();
                  }}
                >
                  Download
                </Button>
              </Box>
              {!pdfLoadFailed ? (
                <Box sx={{ flex: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 1, overflow: 'hidden' }}>
                  <iframe 
                    src={`${previewUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    title="PDF Preview" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    onError={() => {
                      setPdfLoadFailed(true);
                    }}
                    onLoad={() => {
                      setPdfLoadFailed(false);
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      PDF Preview Unavailable
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      The PDF could not be displayed in the preview. Please use the buttons above to view or download the file.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          )}
          {previewType === 'text' && previewText && (
            <Box sx={{ width: '100%', maxHeight: 500, overflow: 'auto', bgcolor: 'background.default', p: 2, borderRadius: 2 }}>
              <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: 14 }}>{previewText}</pre>
            </Box>
          )}
          {previewType === 'unsupported' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Preview not available for this file type
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = previewUrl;
                  a.download = 'file';
                  a.click();
                }}
              >
                Download File
              </Button>
            </Box>
          )}
          {previewType === 'error' && (
            <Box sx={{ textAlign: 'center' }}>
              <Typography color="error" gutterBottom>Error loading file: {previewError}</Typography>
              <Button 
                variant="outlined" 
                onClick={() => window.open(previewUrl, '_blank')}
              >
                Try Opening in New Tab
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setPreviewOpen(false); setPreviewUrl(null); setPreviewType(null); setPreviewText(''); setPreviewError(''); }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUploadSection; 