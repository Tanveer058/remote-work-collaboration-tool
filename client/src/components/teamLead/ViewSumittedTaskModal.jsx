import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import VideoFileIcon from '@mui/icons-material/VideoFile';
import AudioFileIcon from '@mui/icons-material/AudioFile';

const ViewSubmittedTaskModal = ({ tasks, onClose, initialTask = null }) => {
  const [selectedTask, setSelectedTask] = useState(initialTask || tasks[0]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Safe date formatting function
  const safeFormatDate = (dateString, formatString = 'MMM dd, yyyy HH:mm') => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';
      return format(date, formatString);
    } catch (error) {
      return '—';
    }
  };

  // Safe file icon function with Material-UI icons
  const getFileIcon = (filename) => {
    if (!filename || typeof filename !== 'string') return <InsertDriveFileIcon className="h-4 w-4" />;
    
    try {
      const ext = filename.split('.').pop().toLowerCase();
      const iconMap = {
        pdf: <PictureAsPdfIcon className="h-4 w-4 text-red-500" />,
        doc: <DescriptionIcon className="h-4 w-4 text-blue-500" />,
        docx: <DescriptionIcon className="h-4 w-4 text-blue-500" />,
        xls: <TableChartIcon className="h-4 w-4 text-green-500" />,
        xlsx: <TableChartIcon className="h-4 w-4 text-green-500" />,
        ppt: <SlideshowIcon className="h-4 w-4 text-orange-500" />,
        pptx: <SlideshowIcon className="h-4 w-4 text-orange-500" />,
        zip: <FolderZipIcon className="h-4 w-4 text-gray-500" />,
        rar: <FolderZipIcon className="h-4 w-4 text-gray-500" />,
        jpg: <ImageIcon className="h-4 w-4 text-purple-500" />,
        jpeg: <ImageIcon className="h-4 w-4 text-purple-500" />,
        png: <ImageIcon className="h-4 w-4 text-purple-500" />,
        gif: <ImageIcon className="h-4 w-4 text-purple-500" />,
        mp4: <VideoFileIcon className="h-4 w-4 text-red-400" />,
        mp3: <AudioFileIcon className="h-4 w-4 text-green-400" />,
      };
      return iconMap[ext] || <InsertDriveFileIcon className="h-4 w-4 text-gray-500" />;
    } catch (error) {
      console.error('Error getting file icon:', error);
      return <InsertDriveFileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    if (!fileUrl) {
      alert('File URL is not available');
      return;
    }
    
    try {
      // For Cloudinary URLs, open in new tab for download
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: open in new tab
      window.open(fileUrl, '_blank');
    }
  };

  // Safe file size formatting
  const formatFileSize = (bytes) => {
    if (!bytes || typeof bytes !== 'number' || bytes === 0) return 'Size not available';
    
    try {
      if (bytes < 1024) return bytes + ' Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    } catch (error) {
      return 'Size not available';
    }
  };

  // Check if file is an image - using both resource_type and filename
  const isImageFile = (file) => {
    if (!file) return false;
    
    // First check resource_type from Cloudinary
    if (file.resource_type === 'image') return true;
    
    // Fallback: check filename extension
    if (file.name) {
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name);
    }
    
    return false;
  };

  // Get all image files from submission
  const getImageFiles = (files) => {
    if (!files || !Array.isArray(files)) return [];
    return files.filter(file => isImageFile(file) && file.url);
  };

  // Get other files (non-images)
  const getOtherFiles = (files) => {
    if (!files || !Array.isArray(files)) return [];
    return files.filter(file => !isImageFile(file) && file.url);
  };

  // Image preview functions
  const openImagePreview = (imageIndex) => {
    setSelectedImageIndex(imageIndex);
    setZoomLevel(1);
    setIsFullscreen(false);
  };

  const closeImagePreview = () => {
    setSelectedImageIndex(null);
    setZoomLevel(1);
    setIsFullscreen(false);
  };

  const nextImage = () => {
    const images = getImageFiles(selectedTask?.submission?.files || []);
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % images.length);
      setZoomLevel(1);
    }
  };

  const prevImage = () => {
    const images = getImageFiles(selectedTask?.submission?.files || []);
    if (images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setZoomLevel(1);
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle keyboard navigation for image preview
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'Escape':
          closeImagePreview();
          break;
        case '+':
        case '=':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        case '0':
          resetZoom();
          break;
        case 'f':
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    if (selectedImageIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImageIndex]);

  // Get files directly from the selected task
  const files = selectedTask?.submission?.files || [];
  const imageFiles = getImageFiles(files);
  const otherFiles = getOtherFiles(files);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <VisibilityIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Task Submissions
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Review submitted work from your team members
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <CloseIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="flex h-[calc(90vh-140px)]">
            {/* Sidebar - Task List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <div className="p-4 space-y-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  All Submissions ({tasks.length})
                </h3>
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedTask?._id === task._id
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-600'
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                        {task.title || 'Untitled Task'}
                      </h4>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 flex-shrink-0 ml-2">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Submitted
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <PersonIcon className="h-3 w-3 mr-1" />
                      {task.assignedTo?.name || 'Unknown'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {safeFormatDate(task.submission?.submittedAt)}
                    </div>
                    {task.submission?.files && task.submission.files.length > 0 && (
                      <div className="mt-2 flex items-center text-xs text-blue-600 dark:text-blue-400">
                        <span className="flex items-center">
                          <AttachFileIcon className="h-3 w-3 mr-1" />
                          {task.submission.files.length} file(s)
                        </span>
                        {getImageFiles(task.submission.files).length > 0 && (
                          <span className="ml-2 text-green-600 dark:text-green-400 flex items-center">
                            <ImageIcon className="h-3 w-3 mr-1" />
                            {getImageFiles(task.submission.files).length} image(s)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content - Submission Details */}
            <div className="flex-1 overflow-y-auto">
              {selectedTask ? (
                <div className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Task Header */}
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedTask.title || 'Untitled Task'}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <PersonIcon className="h-4 w-4" />
                          <span>Submitted by: {selectedTask.assignedTo?.name || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <AssignmentIcon className="h-4 w-4" />
                          <span>Assigned by: {selectedTask.assignedBy?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Submitted on</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {safeFormatDate(selectedTask.submission?.submittedAt, 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {safeFormatDate(selectedTask.submission?.submittedAt, 'HH:mm')}
                      </p>
                    </div>
                  </div>

                  {/* Original Task Description */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Task Description
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTask.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Submission Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Submission Details
                    </h4>
                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedTask.submission?.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Image Gallery */}
                  {imageFiles.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Screenshots & Images ({imageFiles.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {imageFiles.map((file, index) => (
                          <div 
                            key={index} 
                            className="group relative border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                            onClick={() => openImagePreview(index)}
                          >
                            <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative">
                              <img
                                src={file.url}
                                alt={file.name || 'Screenshot'}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMzBWNjBaIiBmaWxsPSIjOEU5MEEyIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjExMCIgcj0iMjAiIGZpbGw9IiM4RTkwQTIiLz4KPC9zdmc+';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                  <ZoomInIcon className="h-8 w-8 text-white" />
                                </div>
                              </div>
                            </div>
                            <div className="p-3 bg-white dark:bg-gray-800">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {file.name || 'Screenshot'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <LightbulbIcon className="h-4 w-4 mr-1 text-blue-500" />
                        <span>Click on any image to open full-screen preview with zoom controls</span>
                      </div>
                    </div>
                  )}

                  {/* Other Files */}
                  {otherFiles.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Other Files ({otherFiles.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {getFileIcon(file.name)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {file.name || 'Unnamed file'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {file.url && (
                                <>
                                  <button
                                    onClick={() => window.open(file.url, '_blank')}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                                    title="Preview file"
                                  >
                                    <VisibilityIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDownload(file.url, file.name)}
                                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors duration-200"
                                    title="Download file"
                                  >
                                    <DownloadIcon className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Files Message */}
                  {files.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No files attached to this submission.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <VisibilityIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a submission to view details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImageIndex !== null && imageFiles[selectedImageIndex] && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className={`${isFullscreen ? 'w-full h-full' : 'max-w-5xl max-h-[90vh]'} relative bg-black`}>
            {/* Image */}
            <div className="flex items-center justify-center h-full">
              <img
                src={imageFiles[selectedImageIndex].url}
                alt={imageFiles[selectedImageIndex].name || 'Preview'}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoomLevel})` }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEgxMjBWODBIMzBWNjBaIiBmaWxsPSIjOEU5MEEyIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjExMCIgcj0iMjAiIGZpbGw9IiM4RTkwQTIiLz4KPC9zdmc+';
                }}
              />
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={zoomIn}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                title="Zoom In (+)"
              >
                <ZoomInIcon className="h-6 w-6" />
              </button>
              <button
                onClick={zoomOut}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                title="Zoom Out (-)"
              >
                <ZoomOutIcon className="h-6 w-6" />
              </button>
              <button
                onClick={resetZoom}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                title="Reset Zoom (0)"
              >
                <span className="text-sm font-bold">1:1</span>
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <FullscreenExitIcon className="h-6 w-6" /> : <FullscreenIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={closeImagePreview}
                className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                title="Close (ESC)"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Arrows */}
            {imageFiles.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                  title="Previous (←)"
                >
                  <NavigateBeforeIcon className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-all duration-200"
                  title="Next (→)"
                >
                  <NavigateNextIcon className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium truncate">
                    {imageFiles[selectedImageIndex].name || 'Image'}
                  </p>
                  <p className="text-sm opacity-75">
                    {selectedImageIndex + 1} of {imageFiles.length} • Zoom: {Math.round(zoomLevel * 100)}%
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(imageFiles[selectedImageIndex].url, imageFiles[selectedImageIndex].name)}
                  className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-all duration-200 flex items-center space-x-2"
                  title="Download"
                >
                  <DownloadIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded-lg text-sm opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="space-y-1">
                <p>← → : Navigate</p>
                <p>+ - : Zoom</p>
                <p>0 : Reset Zoom</p>
                <p>F : Fullscreen</p>
                <p>ESC : Close</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewSubmittedTaskModal;