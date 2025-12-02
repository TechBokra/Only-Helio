
// Cloudinary Configuration
// HARDCODED CREDENTIALS TO BYPASS VERCEL ENV VAR ISSUES
const CLOUD_NAME = 'dwg0hr34g'; 
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
    // NOTE: For unsigned uploads, do NOT include api_key or timestamp signature

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    console.log(`[Cloudinary] Starting upload to: ${url}`);
    console.log(`[Cloudinary] Preset: ${UPLOAD_PRESET}, Cloud: ${CLOUD_NAME}`);
    console.log(`[Cloudinary] File: ${file.name} (${file.size} bytes)`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Cloudinary Upload Failed:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            // Return explicit error message from Cloudinary
            throw new Error(errorData.error?.message || `Upload failed with status ${response.status}`);
        }

        const data: CloudinaryResponse = await response.json();
        console.log(`[Cloudinary] Upload successful: ${data.secure_url}`);
        return data.secure_url;
    } catch (error: any) {
        console.error('Network/Upload Error in uploadToCloudinary:', error);
        throw new Error(error.message || 'Failed to connect to image server');
    }
};
