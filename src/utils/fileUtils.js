/**
 * File utility functions
 */

// Get file icon based on file type
export const getFileIcon = (fileType) => {
  if (fileType.startsWith('image/')) return 'image';
  if (fileType.startsWith('video/')) return 'video_file';
  if (fileType.startsWith('audio/')) return 'audio_file';
  if (fileType.includes('pdf')) return 'picture_as_pdf';
  if (fileType.includes('word') || fileType.includes('document')) return 'description';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'table_chart';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'slideshow';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return 'folder_zip';
  return 'insert_drive_file';
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate file
export const validateFile = (file, options = {}) => {
  const {
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    acceptedTypes = ['*/*'],
    maxFiles = 5,
    currentFileCount = 0
  } = options;

  const errors = [];

  // Check file count
  if (currentFileCount >= maxFiles) {
    errors.push(`Maximum ${maxFiles} files allowed`);
  }

  // Check file size
  if (file.size > maxFileSize) {
    errors.push(`File size must be less than ${formatFileSize(maxFileSize)}`);
  }

  // Check file type
  if (acceptedTypes.length > 0 && acceptedTypes[0] !== '*/*') {
    const isValidType = acceptedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', ''));
      }
      return file.type === type;
    });
    
    if (!isValidType) {
      errors.push(`File type not supported. Allowed: ${acceptedTypes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get file extension from filename
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Determine if file type is previewable
export const isPreviewable = (fileType, filename) => {
  const ext = getFileExtension(filename);
  
  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') return 'pdf';
  if (fileType.startsWith('text/') || ['txt', 'csv', 'json', 'md', 'log'].includes(ext)) return 'text';
  
  return false;
};
