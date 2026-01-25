"use client";

import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

/**
 * PhotoUpload Component
 * Allows users to upload photos to a specific city
 *
 * Features:
 * - Drag & drop support
 * - File validation
 * - Progress indication
 * - Preview before upload
 * - Responsive design
 *
 * Props:
 * - cityId: string (required) - The city identifier
 * - onUploadSuccess: function (optional) - Callback when upload succeeds
 * - onUploadError: function (optional) - Callback when upload fails
 */
export default function PhotoUpload({ cityId, onUploadSuccess, onUploadError }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error'
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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

  const handleFileSelect = (file) => {
    const validation = validateFile(file);

    if (!validation.valid) {
      setUploadStatus('error');
      setStatusMessage(validation.error);
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
    setStatusMessage('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
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

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus(null);
    setStatusMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('cityId', cityId);

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Upload failed');
      }

      setUploadStatus('success');
      setStatusMessage('Photo uploaded successfully!');

      // Clear selection after success
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadStatus(null);
        setStatusMessage('');
      }, 3000);

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess(data.photo);
      }

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setStatusMessage(error.message || 'Failed to upload photo. Please try again.');

      // Call error callback
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus(null);
    setStatusMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Upload Area */}
      {!selectedFile && (
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

      {/* Preview & Upload */}
      {selectedFile && (
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
              disabled={uploading}
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* File Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <ImageIcon className="w-5 h-5 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold text-white
              transition-all duration-200 flex items-center justify-center gap-2
              ${uploading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }
            `}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload Photo
              </>
            )}
          </button>
        </div>
      )}

      {/* Status Messages */}
      {uploadStatus && (
        <div
          className={`
            mt-4 p-4 rounded-lg flex items-start gap-3
            ${uploadStatus === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
            }
          `}
        >
          {uploadStatus === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              uploadStatus === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {statusMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
