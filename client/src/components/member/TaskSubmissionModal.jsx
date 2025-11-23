import { useState } from 'react';
import { submitTask } from '../../services/taskService';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import WarningIcon from '@mui/icons-material/Warning';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { toast } from 'react-toastify';

const TaskSubmissionModal = ({ task, onClose, onSuccess }) => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const MAX_FILES = 5;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files. You currently have ${files.length} files selected and tried `, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      e.target.value = ''; // Clear the file input
      return;
    }
    
    // Check file sizes and validate
    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum size is 5MB.`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return false;
      }
      return true;
    });
    
    setFiles([...files, ...validFiles]);
    e.target.value = ''; // Clear the file input after selection
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      zip: '🗜️',
      rar: '🗜️',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      mp3: '🎵',
    };
    return iconMap[ext] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please provide a submission description', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    // Final validation before submission
    if (files.length > MAX_FILES) {
      toast.error(`You cannot upload more than ${MAX_FILES} files. Please remove ${files.length - MAX_FILES} file(s).`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append description
      formData.append('description', description.trim());
      
      // Append each file
      files.forEach(file => {
        formData.append('files', file);
      });

      await submitTask(task._id, formData);
      
      // Show success toast
      toast.success('Task submitted successfully! Your team lead will review your work.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(
        error.response?.data?.message || 'Error submitting task. Please try again.', 
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle drag and drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    // Check if adding these files would exceed the limit
    if (files.length + droppedFiles.length > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files. You currently have ${files.length} files and tried to add ${droppedFiles.length} more. Please remove some files first.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    const validFiles = droppedFiles.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum size is 5MB.`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return false;
      }
      return true;
    });
    
    setFiles([...files, ...validFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Calculate remaining file slots
  const remainingFiles = MAX_FILES - files.length;
  const isAtFileLimit = files.length >= MAX_FILES;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Submit Task
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            disabled={loading}
          >
            <CloseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Task Details Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <DescriptionIcon className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Task Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {task.description}
                </p>
              </div>
            </div>
          </div>

          {/* Submission Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              * Submission Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none"
              placeholder="Describe what you've completed, approach taken, challenges faced, and any notes for your team lead..."
              rows="6"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Provide a detailed summary of your work and any important information
            </p>
          </div>

          {/* File Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload Files (Screenshots, Documents, Code, etc.)
              </label>
              <div className={`text-sm font-medium ${
                remainingFiles === 0 ? 'text-red-600 dark:text-red-400' : 
                remainingFiles <= 2 ? 'text-orange-600 dark:text-orange-400' : 
                'text-green-600 dark:text-green-400'
              }`}>
                {remainingFiles} of {MAX_FILES} files remaining
              </div>
            </div>
            
            {/* File Drop Zone */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
                isAtFileLimit 
                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 cursor-not-allowed' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
              }`}
              onDrop={isAtFileLimit ? undefined : handleDrop}
              onDragOver={isAtFileLimit ? undefined : handleDragOver}
            >
              <input
                type="file"
                multiple
                onChange={isAtFileLimit ? undefined : handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp4,.mp3,.txt,.js,.jsx,.ts,.tsx,.css,.html,.py,.java,.cpp,.c,.php,.rb,.go,.rs,.swift,.kt"
                disabled={isAtFileLimit || loading}
              />
              <label 
                htmlFor="file-upload" 
                className={`cursor-pointer ${isAtFileLimit || loading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <div className="flex flex-col items-center justify-center space-y-3">
                  <CloudUploadIcon className={`h-12 w-12 ${
                    isAtFileLimit ? 'text-red-400' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`text-lg font-medium ${
                      isAtFileLimit ? 'text-red-900 dark:text-red-200' : 'text-gray-900 dark:text-white'
                    }`}>
                      {isAtFileLimit ? 'File limit reached' : 'Click to upload files'}
                    </p>
                    <p className={`${
                      isAtFileLimit ? 'text-red-700 dark:text-red-300' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isAtFileLimit ? 'Maximum 5 files allowed' : 'or drag and drop'}
                    </p>
                  </div>
                  <p className={`text-xs ${
                    isAtFileLimit ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    Images, PDFs, Documents, Code files (Max 5MB each)
                  </p>
                </div>
              </label>
            </div>

            {/* File Limit Warning */}
            {isAtFileLimit && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <WarningIcon className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    You've reached the maximum of {MAX_FILES} files. Please remove files if you want to upload different ones.
                  </p>
                </div>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Files ({files.length}/{MAX_FILES}):
                </h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getFileIcon(file.name)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-300 transform hover:scale-110"
                        title="Remove file"
                        disabled={loading}
                      >
                        <DeleteIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <WarningIcon className="h-4 w-4 mr-1" />
              Important: Once you submit this task, it will be marked as completed 
              and sent to your team lead for review. Make sure you've included all necessary details and files.
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
              <AttachFileIcon className="h-3 w-3 mr-1" />
              File Limits: Maximum {MAX_FILES} files, each under 5MB. Supported formats: Images, PDFs, Documents, Code files.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Submit Task</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:cursor-not-allowed text-gray-700 dark:text-gray-200 font-medium py-3 px-6 rounded-lg transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskSubmissionModal;