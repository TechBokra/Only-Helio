
import { useToast } from '../components/shared/ToastContext';

// This service simulates sending transactional emails.
// In a production environment, this would call a Serverless Function (e.g., Supabase Edge Function)
// which wraps an email provider like SendGrid, Resend, or AWS SES.

interface EmailOptions {
    to: string;
    subject: string;
    body: string; // Plain text or HTML
    templateId?: string;
    data?: any;
}

export const sendEmail = async ({ to, subject, body }: EmailOptions): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Log to console for debugging/demo purposes
    console.group('📧 [Mock Email Service] Sending Email');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.groupEnd();

    // In a real app, we would return true/false based on API response
    return true;
};

// --- Preset Email Templates ---

export const sendWelcomeEmail = async (name: string, email: string) => {
    const subject = "Welcome to ONLY HELIO Partner Network! 🚀";
    const body = `
Dear ${name},

Thank you for applying to join ONLY HELIO. We have received your application and it is currently under review by our Partner Relations team.

We will notify you once your account status changes.

Best regards,
The ONLY HELIO Team
    `;
    return sendEmail({ to: email, subject, body });
};

export const sendStatusUpdateEmail = async (name: string, email: string, requestType: string, status: string, notes?: string) => {
    const subject = `Update on your request: ${requestType}`;
    const body = `
Dear ${name},

The status of your ${requestType} has been updated to: **${status.toUpperCase()}**.

${notes ? `Additional Notes:\n${notes}` : ''}

Please log in to your dashboard to view more details.

Best regards,
ONLY HELIO Support
    `;
    return sendEmail({ to: email, subject, body });
};

export const sendPropertyApprovalEmail = async (name: string, email: string, propertyTitle: string) => {
    const subject = "Your Property Listing has been Approved! 🎉";
    const body = `
Dear ${name},

Great news! Your property listing "${propertyTitle}" has been approved and is now live on ONLY HELIO.

You can view your listing here: https://onlyhelio.com/properties

Best regards,
Listings Team
    `;
    return sendEmail({ to: email, subject, body });
};
