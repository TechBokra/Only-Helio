
// Cloudinary Configuration
// We are hardcoding these temporarily to ensure functionality in the dev/preview environment.
const CLOUD_NAME = 'Onlyhelio';
const UPLOAD_PRESET = 'onlyhelio_uploads';

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

    // Ensure cloud name is handled correctly (URLs are usually case-sensitive or lowercase)
    // We try to use the name exactly as provided.
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Cloudinary Upload Error:", {
                status: response.status,
                statusText: response.statusText,
                details: errorData
            });
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
        }

        const data: CloudinaryResponse = await response.json();
        return data.secure_url;
    } catch (error: any) {
        console.error('Network/Upload Error in uploadToCloudinary:', error);
        throw new Error(error.message || 'Failed to upload image to Cloudinary');
    }
};
