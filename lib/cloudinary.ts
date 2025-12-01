
// Cloudinary Configuration
// In production, these should be set in Vercel Environment Variables

// Safely access environment variables
const env = (import.meta as any).env || {};

const CLOUD_NAME = env.VITE_CLOUDINARY_CLOUD_NAME || 'Onlyhelio'; 
const UPLOAD_PRESET = env.VITE_CLOUDINARY_UPLOAD_PRESET || 'onlyhelio_uploads';

interface CloudinaryResponse {
    secure_url: string;
    [key: string]: any;
}

/**
 * Uploads a file to Cloudinary using the unsigned upload preset.
 * @param file The file object to upload
 * @returns Promise resolving to the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to upload image');
        }

        const data: CloudinaryResponse = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};
