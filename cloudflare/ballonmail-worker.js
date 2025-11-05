/**
 * BallonMail Cloudflare Worker
 * Sends bulk emails using Resend API
 * FREE: 3,000 emails/month, 100 emails/day
 */

export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const { recipients, subject, message, fromName } = await request.json();

      // Validation
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Recipients array is required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!subject || !message) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Subject and message are required'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = recipients.filter(email => !emailRegex.test(email));
      
      if (invalidEmails.length > 0) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid email addresses found',
          invalidEmails
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Resend API configuration
      const RESEND_API_KEY = env.RESEND_API_KEY; // Set in Cloudflare Worker environment variables
      const FROM_EMAIL = env.FROM_EMAIL || 'noreply@yourdomain.com'; // Must be verified domain

      // HTML Email Template
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">
                BallonMail<sup style="font-size: 14px;">GB</sup>
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Bulk Email Service</p>
            </div>
            
            <!-- Body -->
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: #1f2937; line-height: 1.6; white-space: pre-wrap;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; margin-top: 20px; padding: 20px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Sent via BallonMail<sup style="font-size: 10px;">GB</sup> - Bulk Email Service
              </p>
              <p style="color: #9ca3af; font-size: 11px; margin: 10px 0 0 0;">
                © 2024 TempMail<sup style="font-size: 9px;">GB</sup>. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send emails using Resend API
      const sendPromises = recipients.map(async (recipient) => {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: `${fromName || 'BallonMail'} <${FROM_EMAIL}>`,
            to: [recipient],
            subject: subject,
            html: htmlTemplate,
            text: message
          })
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to send to ${recipient}: ${error}`);
        }

        return await response.json();
      });

      // Wait for all emails to send
      const results = await Promise.allSettled(sendPromises);
      
      // Count successes and failures
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      const errors = results
        .filter(r => r.status === 'rejected')
        .map(r => r.reason.message);

      return new Response(JSON.stringify({
        success: true,
        message: `Emails sent to ${successful} recipient(s)`,
        sent: successful,
        failed: failed,
        total: recipients.length,
        errors: errors.length > 0 ? errors : undefined
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to send emails',
        details: error.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
