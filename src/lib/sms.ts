/**
 * Africa's Talking SMS Utility
 * Handles sending transactional SMS for guest invitations and passes.
 */

const AT_USERNAME = process.env.AT_USERNAME || 'sandbox';
const AT_API_KEY = process.env.AT_API_KEY;
const AT_SENDER_ID = process.env.AT_SENDER_ID; // Optional: specific sender ID/shortcode

export async function sendSMS(to: string, message: string) {
  if (!AT_API_KEY) {
    console.warn('SMS Warning: Africa\'s Talking API Key not set. Message not sent:', { to, message });
    return { success: false, error: 'API Key missing' };
  }

  try {
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': AT_API_KEY,
      },
      body: new URLSearchParams({
        username: AT_USERNAME,
        to: to,
        message: message,
        ...(AT_SENDER_ID ? { from: AT_SENDER_ID } : {}),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('SMS API Error:', result);
      return { success: false, error: result.errorMessage || 'Failed to send SMS' };
    }

    // Africa's Talking returns a nested structure
    const recipientData = result.SMSMessageData?.Recipients?.[0];
    if (recipientData?.status === 'Success') {
      return { success: true, messageId: recipientData.messageId };
    } else {
      return { success: false, error: recipientData?.status || 'Unknown error' };
    }
  } catch (error) {
    console.error('SMS Exception:', error);
    return { success: false, error: 'Network error' };
  }
}
