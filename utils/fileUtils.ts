
// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dwg0hr34g'; 
const CLOUDINARY_UPLOAD_PRESET = 'onlyhelio_uploads'; 
const CLOUDINARY_API_KEY = '532568532962456'; 

/**
 * Uploads a file to Cloudinary.
 * @param file The file to upload
 * @returns A Promise that resolves with the secure URL of the uploaded image
 */
const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('api_key', CLOUDINARY_API_KEY);

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
 * If Cloudinary fails, falls back to Base64.
 * 
 * @param file The file to process
 * @returns A Promise that resolves with the image URL (Cloudinary or Base64)
 */
export const fileToBase64 = async (file: File): Promise<string> => {
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET) {
        try {
            return await uploadToCloudinary(file);
        } catch (error) {
            console.warn('Cloudinary upload failed, falling back to Base64.', error);
        }
    } else {
        console.warn('Cloudinary configuration missing, falling back to Base64.');
    }

    return convertToBase64(file);
};
