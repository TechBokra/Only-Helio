
// Configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (Cloudinary allows larger files)
// Using hardcoded credentials to ensure immediate functionality without Env Var issues
const CLOUDINARY_CLOUD_NAME = 'dwg0hr34g'; 
const CLOUDINARY_UPLOAD_PRESET = 'onlyhelio_uploads';

/**
 * Validates a file before processing
 */
const validateFile = (file: File): void => {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size too large. Max allowed is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
};

/**
 * Uploads a file to Cloudinary via Unsigned Upload
 */
const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    // folder is optional, helps organize images in your Cloudinary dashboard
    formData.append('folder', 'onlyhelio_properties'); 

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        const data = await response.json();
        return data.secure_url; // Returns the HTTPS URL of the uploaded image
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Converts a File object to a Base64 encoded string (Fallback method).
 */
const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

/**
 * Main file handler. 
 * Tries to upload to Cloudinary first.
 * Falls back to Base64 if upload fails.
 * 
 * @param file The file to process
 * @returns A Promise that resolves with the image URL
 */
export const fileToBase64 = async (file: File): Promise<string> => {
    validateFile(file);

    try {
        // Attempt upload to Cloudinary
        const url = await uploadToCloudinary(file);
        return url;
    } catch (error) {
        console.warn('Cloudinary upload failed, falling back to local Base64.', error);
        return convertToBase64(file);
    }
};
