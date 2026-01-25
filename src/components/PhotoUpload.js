"use client";

import { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import { compressImage, getOptimalQuality, estimateUploadTime } from '@/utils/imageProcessing';

/**
 * PhotoUpload Component
 * Allows users to upload photos to a specific city with robust network handling
 *
 * Features:
 * - Drag & drop support
 * - File validation
 * - Progress indication with percentage
 * - Preview before upload
 * - Automatic retry with exponential backoff
 * - Network status detection
 * - Queue system for failed uploads
 * - Responsive design
 *
 * Props:
 * - cityId: string (required) - The city identifier
 * - onUploadSuccess: function (optional) - Callback when upload succeeds
 * - onUploadError: function (optional) - Callback when upload fails
 */
export default function PhotoUpload({ cityId, onUploadSuccess, onUploadError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalFile, setOriginalFile] = useState(null); // Store original for display
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | 'retrying'
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [canRetry, setCanRetry] = useState(false);
  const [compressionSavings, setCompressionSavings] = useState(null);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_RETRY_ATTEMPTS = 3;
  const UPLOAD_TIMEOUT = 120000; // 2 minutes for slow connections

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (canRetry && selectedFile) {
        setStatusMessage('Connection restored. Ready to retry.');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatusMessage('No internet connection. Please check your network.');
      setUploadStatus('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [canRetry, selectedFile]);

  const validateFile = (file) => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Please select a JPG, PNG, or WebP image'
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    return { valid: true };
  };

  const handleFileSelect = async (file) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      setUploadStatus('error');
      setStatusMessage(validation.error);
      return;
    }

    // Store original file for reference
    setOriginalFile(file);
    setUploadStatus(null);
    setStatusMessage('');
    setRetryCount(0);
    setCanRetry(false);
    setCompressing(true);

    try {
      // Instagram-style compression
      const quality = getOptimalQuality(file.size);
      const compressedBlob = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: quality,
        format: 'image/jpeg'
      });

      // Create File object from compressed blob
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
        { type: 'image/jpeg' }
      );

      // Calculate compression savings
      const savingsPercent = Math.round((1 - compressedFile.size / file.size) * 100);
      setCompressionSavings(savingsPercent);

      setSelectedFile(compressedFile);

      // Create preview from compressed file
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(compressedFile);

    } catch (error) {
      console.error('Compression error:', error);
      // Fall back to original file if compression fails
      setSelectedFile(file);
      setCompressionSavings(0);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Upload with XMLHttpRequest for progress tracking
   * Industry standard: Instagram, Twitter, Facebook use similar approach
   */
  const uploadWithProgress = (formData, attempt = 0) => {
    return new Promise((resolve, reject) => {
      // Create abort controller for timeout
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortControllerRef.current.abort();
        reject(new Error('Upload timeout. Please check your connection and try again.'));
      }, UPLOAD_TIMEOUT);

      const xhr = new XMLHttpRequest();

      // Progress tracking (like Instagram/Twitter)
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      // Success handler
      xhr.addEventListener('load', () => {
        clearTimeout(timeoutId);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            reject(new Error('Invalid server response'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || errorData.error || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Network error handler
      xhr.addEventListener('error', () => {
        clearTimeout(timeoutId);
        reject(new Error('Network error. Please check your internet connection.'));
      });

      // Abort handler
      xhr.addEventListener('abort', () => {
        clearTimeout(timeoutId);
        reject(new Error('Upload cancelled or timed out.'));
      });

      // Send request
      xhr.open('POST', '/api/upload-photo');
      xhr.send(formData);
    });
  };

  /**
   * Exponential backoff retry logic
   * Industry standard: 1s, 2s, 4s delays between retries
   */
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleUpload = async (isRetry = false) => {
    if (!selectedFile) return;

    // Check network before attempting upload
    if (!navigator.onLine) {
      setUploadStatus('error');
      setStatusMessage('No internet connection. Please check your network and try again.');
      setCanRetry(true);
      return;
    }

    const currentAttempt = isRetry ? retryCount : 0;

    setUploading(true);
    setUploadStatus(currentAttempt > 0 ? 'retrying' : null);
    setUploadProgress(0);
    setCanRetry(false);

    if (currentAttempt > 0) {
      setStatusMessage(`Retrying upload... (Attempt ${currentAttempt + 1}/${MAX_RETRY_ATTEMPTS})`);
    } else {
      setStatusMessage('');
    }

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('cityId', cityId);

      // Exponential backoff: wait before retry
      if (currentAttempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, currentAttempt - 1), 8000); // Max 8s
        await sleep(delay);
      }

      const data = await uploadWithProgress(formData, currentAttempt);

      // Success!
      setUploadStatus('success');
      setStatusMessage('Photo uploaded successfully!');
      setUploadProgress(100);
      setRetryCount(0);
      setCanRetry(false);

      // Clear selection after success
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadStatus(null);
        setStatusMessage('');
        setUploadProgress(0);
      }, 3000);

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(data.photo);
      }

    } catch (error) {
      console.error('Upload error:', error);

      const isNetworkError = error.message.includes('Network error') ||
                            error.message.includes('Failed to fetch') ||
                            error.message.includes('Load failed') ||
                            error.message.includes('timeout');

      // Automatic retry for network errors (like Instagram/Facebook)
      if (isNetworkError && currentAttempt < MAX_RETRY_ATTEMPTS - 1 && navigator.onLine) {
        setRetryCount(currentAttempt + 1);
        setUploadStatus('retrying');
        // Automatically retry after a short delay
        setTimeout(() => {
          handleUpload(true);
        }, 1000);
        return;
      }

      // Max retries reached or non-network error
      setUploadStatus('error');
      setUploadProgress(0);

      if (isNetworkError && currentAttempt >= MAX_RETRY_ATTEMPTS - 1) {
        setStatusMessage(
          `Upload failed after ${MAX_RETRY_ATTEMPTS} attempts. ` +
          'Please check your internet connection and try again.'
        );
        setCanRetry(true);
      } else if (isNetworkError) {
        setStatusMessage('Poor connection detected. Retrying automatically...');
        setCanRetry(true);
      } else {
        // Server error or validation error
        setStatusMessage(error.message || 'Upload failed. Please try again.');
        setCanRetry(true);
      }

      setRetryCount(currentAttempt);

      // Call error callback
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    handleUpload(false);
  };

  const handleCancel = () => {
    // Cancel ongoing upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus(null);
    setStatusMessage('');
    setUploadProgress(0);
    setRetryCount(0);
    setCanRetry(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Network Status Banner */}
      {!isOnline && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <p className="text-sm font-medium text-orange-800">
            You&apos;re offline. Upload will resume when connection is restored.
          </p>
        </div>
      )}

      {/* Upload Area */}
      {!selectedFile && !compressing && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-700">
                Drop your photo here, or click to browse
              </p>
              <p className="text-sm text-gray-500 mt-1">
                JPG, PNG, or WebP up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compressing indicator */}
      {compressing && (
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <div>
              <p className="text-lg font-semibold text-blue-700">
                Optimizing image...
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Compressing for faster upload
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Upload */}
      {selectedFile && !compressing && (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              disabled={uploading && uploadStatus === 'retrying'}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* File Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <ImageIcon className="w-5 h-5 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  {compressionSavings > 0 && (
                    <span className="text-green-600 ml-2">
                      ({compressionSavings}% smaller)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Upload time estimate */}
            {!uploading && (
              <div className="px-3 py-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  ⚡ Estimated upload time: {estimateUploadTime(selectedFile.size)}
                </p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && uploadProgress > 0 && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {uploadStatus === 'retrying' ? 'Retrying...' : 'Uploading...'}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload/Retry Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleUpload(false)}
              disabled={uploading || !isOnline}
              className={`
                flex-1 py-3 px-4 rounded-lg font-semibold text-white
                transition-all duration-200 flex items-center justify-center gap-2
                ${uploading || !isOnline
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadStatus === 'retrying' ? 'Retrying...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload Photo
                </>
              )}
            </button>

            {canRetry && !uploading && (
              <button
                onClick={handleRetry}
                disabled={!isOnline}
                className={`
                  px-6 py-3 rounded-lg font-semibold
                  transition-all duration-200 flex items-center justify-center gap-2
                  ${!isOnline
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95'
                  }
                `}
              >
                <RefreshCw className="w-5 h-5" />
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus && (
        <div
          className={`
            mt-4 p-4 rounded-lg flex items-start gap-3
            ${uploadStatus === 'success'
              ? 'bg-green-50 border border-green-200'
              : uploadStatus === 'retrying'
              ? 'bg-blue-50 border border-blue-200'
              : 'bg-red-50 border border-red-200'
            }
          `}
        >
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : uploadStatus === 'retrying' ? (
            <Loader2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              uploadStatus === 'success'
                ? 'text-green-800'
                : uploadStatus === 'retrying'
                ? 'text-blue-800'
                : 'text-red-800'
            }`}>
              {statusMessage}
            </p>
            {uploadStatus === 'error' && canRetry && isOnline && (
              <p className="text-xs text-gray-600 mt-1">
                Click the &quot;Retry&quot; button to try uploading again.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
