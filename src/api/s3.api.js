// api/s3.api.js
import axios from 'axios';
import axiosInstance from './axiosConfig';

const s3Api = {
  // Get presigned URL from backend (uses axiosInstance for auth)
  getPresignedUrl: async (fileName, fileType, folder = 'categories') => {
    console.log('Requesting presigned URL for:', fileName, fileType);
    
    try {
      const response = await axiosInstance.post('/admin/s3/presigned-url', {
        fileName,
        fileType,
        folder
      });
      
      console.log('Presigned URL response:', response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  // Upload file directly to S3
  uploadToS3: async (presignedUrl, file, onProgress) => {
    console.log('Uploading to S3 URL:', presignedUrl);
    console.log('File details:', file.name, file.type, file.size);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      
      // Track upload progress if callback provided
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            console.log('Upload progress:', percentComplete + '%');
            onProgress(percentComplete);
          }
        };
      }
      
      xhr.onload = () => {
        console.log('S3 Upload complete. Status:', xhr.status);
        console.log('S3 Response headers:', xhr.getAllResponseHeaders());
        
        if (xhr.status === 200) {
          resolve({
            status: xhr.status,
            statusText: xhr.statusText,
            headers: xhr.getAllResponseHeaders()
          });
        } else {
          const error = new Error(`S3 Upload failed with status ${xhr.status}: ${xhr.statusText}`);
          console.error('S3 Upload error:', error);
          reject(error);
        }
      };
      
      xhr.onerror = () => {
        const error = new Error('Network error during S3 upload');
        console.error('S3 Network error:', error);
        reject(error);
      };
      
      xhr.ontimeout = () => {
        const error = new Error('S3 upload timeout');
        console.error('S3 Timeout:', error);
        reject(error);
      };
      
      xhr.timeout = 60000; // 60 second timeout
      
      xhr.send(file);
    });
  },

  // Alternative: Using axios for upload
  uploadToS3Simple: async (presignedUrl, file) => {
    console.log('Simple upload to S3:', presignedUrl);
    
    try {
      const response = await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        timeout: 60000,
      });
      
      console.log('Simple upload response:', response.status);
      return response;
    } catch (error) {
      console.error('Simple upload error:', error);
      throw error;
    }
  },
};

export default s3Api;