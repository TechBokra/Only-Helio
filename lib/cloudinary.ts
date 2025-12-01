
// Cloudinary Configuration
// We are hardcoding these temporarily to ensure functionality in the dev/preview environment.
const CLOUD_NAME = 'onlyhelio'; // Must be lowercase for API URLs
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
    // Note: We do NOT append api_key for unsigned uploads.

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    console.log(`[Cloudinary] Uploading to ${url} with preset: ${UPLOAD_PRESET}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Cloudinary Upload Error Details:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            // Throw a specific error message from Cloudinary if available
            throw new Error(errorData.error?.message || `Upload failed: ${response.status} ${response.statusText}`);
        }

        const data: CloudinaryResponse = await response.json();
        return data.secure_url;
    } catch (error: any) {
        console.error('Network/Upload Error in uploadToCloudinary:', error);
        throw new Error(error.message || 'Failed to upload image to Cloudinary');
    }
};
