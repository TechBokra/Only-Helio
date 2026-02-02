
// Cloudinary Configuration
// TODO: Move these to .env file in production (VITE_CLOUDINARY_CLOUD_NAME, etc.)
const CLOUDINARY_CLOUD_NAME = 'dwg0hr34g'; 
const CLOUDINARY_UPLOAD_PRESET = 'onlyhelio_uploads'; // Unsigned preset
const CLOUDINARY_API_KEY = '532568532962456'; 

/**
 * Uploads a file to Cloudinary.
 * Returns the secure URL.
 */
const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('api_key', CLOUDINARY_API_KEY);
    // Note: Do NOT send api_secret from frontend.

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
            throw new Error(errorData.error?.message || 'Cloudinary upload failed');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Fallback: Converts a File object to a Base64 string.
 * Used if Cloudinary is misconfigured or network fails.
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
 * Strategy: Try Cloudinary -> Fallback to Base64.
 */
export const fileToBase64 = async (file: File): Promise<string> => {
    // Check if Cloudinary is configured
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
        try {
            const url = await uploadToCloudinary(file);
            return url;
        } catch (error) {
            console.warn('Cloudinary upload failed, falling back to Base64.', error);
        }
    } else {
        console.warn('Cloudinary configuration missing, falling back to Base64.');
    }

    return convertToBase64(file);
};
