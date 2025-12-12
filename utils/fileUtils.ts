
// Cloudinary Configuration
// To enable Cloudinary, add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file
// @ts-ignore
const CLOUDINARY_CLOUD_NAME = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || '';
// @ts-ignore
const CLOUDINARY_UPLOAD_PRESET = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Uploads a file to Cloudinary.
 * @param file The file to upload
 * @returns A Promise that resolves with the secure URL of the uploaded image
 */
const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // Add folder if needed, or other tags
    // formData.append('folder', 'onlyhelio_assets'); 

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
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Converts a File object to a Base64 encoded string (Fallback method).
 * @param file The file to convert
 * @returns A Promise that resolves with the Base64 string
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
 * Main file handler. Tries to upload to Cloudinary first.
 * If Cloudinary is not configured or fails, falls back to Base64 (legacy behavior).
 * 
 * @param file The file to process
 * @returns A Promise that resolves with the image URL (Cloudinary or Base64)
 */
export const fileToBase64 = async (file: File): Promise<string> => {
    // Check if Cloudinary config is present
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
        try {
            console.log('Uploading to Cloudinary...');
            const url = await uploadToCloudinary(file);
            console.log('Upload successful:', url);
            return url;
        } catch (error) {
            console.warn('Cloudinary upload failed, falling back to Base64.', error);
        }
    }

    // Fallback to Base64
    return convertToBase64(file);
};