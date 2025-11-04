/**
 * TempMail Cloudflare Worker
 * Serverless backend for temporary email service
 */

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

// Generate random email address
function generateEmail() {
  const randomStr = Math.random().toString(36).substring(2, 12);
  return `${randomStr}@ainewmail.online`;
}

// Main Worker handler
export default {
  // Email handler for incoming emails
  async email(message, env, ctx) {
    const to = message.to;
    const from = message.from;
    const subject = message.headers.get('subject') || 'No Subject';
    
    // Extract email body using proper parsing
    let body = '';
    let htmlBody = '';
    
    try {
      // Get both HTML and plain text versions
      if (message.html) {
        htmlBody = await message.html();
        // Strip HTML tags to get plain text for body field
        body = htmlBody
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, ' ')
          .trim();
      } else if (message.text) {
        body = await message.text();
        htmlBody = body.replace(/\n/g, '<br>'); // Convert newlines to HTML
      } else {
        // Fallback: parse raw email
        const reader = message.raw.getReader();
        const decoder = new TextDecoder();
        let rawEmail = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          rawEmail += decoder.decode(value, { stream: true });
        }
        
        // Extract body after double newline (end of headers)
        const parts = rawEmail.split('\n\n');
        if (parts.length > 1) {
          // Get everything after headers
          body = parts.slice(1).join('\n\n');
          
          // Remove email headers that might be in body
          body = body
            .replace(/^Received:.*$/gm, '')
            .replace(/^ARC-.*$/gm, '')
            .replace(/^DKIM-.*$/gm, '')
            .replace(/^Authentication-Results:.*$/gm, '')
            .replace(/^X-.*$/gm, '')
            .replace(/^Content-Type:.*$/gm, '')
            .replace(/^Content-Transfer-Encoding:.*$/gm, '')
            .replace(/^MIME-Version:.*$/gm, '')
            .replace(/^\s*from.*outbound-mail\.sendgrid\.net.*$/gm, '')
            .replace(/^\s*by cloudflare.*$/gm, '')
            .replace(/^\s*for.*$/gm, '')
            .trim();
          
          // Remove multiple consecutive blank lines
          body = body.replace(/\n{3,}/g, '\n\n');
          
          // Limit body length
          if (body.length > 5000) {
            body = body.substring(0, 5000) + '\n\n[Email truncated...]';
          }
        }
      }
      
      // Clean up body
      body = body.trim() || 'No content';
      htmlBody = htmlBody.trim() || body.replace(/\n/g, '<br>');
      
      // Save email to database with both HTML and plain text
      await env.DB.prepare(
        'INSERT INTO inbox (email_address, from_address, subject, body, html_body, timestamp, read) VALUES (?, ?, ?, ?, ?, ?, 0)'
      ).bind(to, from, subject, body, htmlBody, Date.now()).run();
      
      console.log(`Email received: ${from} -> ${to}`);
    } catch (error) {
      console.error('Error saving email:', error);
    }
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    try {
      // Clean up expired emails (run in background)
      ctx.waitUntil(cleanupExpiredEmails(env.DB));

      // Route: Generate new email
      if (pathname === '/api/generate' && request.method === 'POST') {
        return await handleGenerateEmail(env.DB);
      }

      // Route: Get inbox for email
      if (pathname.startsWith('/api/inbox/') && request.method === 'GET') {
        const email = decodeURIComponent(pathname.split('/')[3]);
        return await handleGetInbox(env.DB, email);
      }

      // Route: Mark email as read
      if (pathname.match(/\/api\/email\/.*\/.*\/read/) && request.method === 'PUT') {
        const parts = pathname.split('/');
        const emailId = parts[parts.length - 2];
        return await handleMarkAsRead(env.DB, emailId);
      }

      // Route: Delete email
      if (pathname.startsWith('/api/delete/') && request.method === 'DELETE') {
        const emailId = pathname.split('/')[3];
        return await handleDeleteEmail(env.DB, emailId);
      }

      // Route: Simulate receiving email (for testing)
      if (pathname === '/api/simulate-receive' && request.method === 'POST') {
        const body = await request.json();
        return await handleSimulateEmail(env.DB, body.to);
      }

      // 404 Not Found
      return new Response(JSON.stringify({ error: 'Not Found' }), {
        status: 404,
        headers: corsHeaders
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }
};

// Handler: Generate new email
async function handleGenerateEmail(db) {
  const email = generateEmail();
  const now = Date.now();
  const expiresAt = now + (60 * 60 * 1000); // 1 hour

  try {
    // Insert new email into database
    await db.prepare(
      'INSERT INTO emails (address, created_at, expires_at) VALUES (?, ?, ?)'
    ).bind(email, now, expiresAt).run();

    return new Response(JSON.stringify({
      email,
      expiresIn: 3600000 // 1 hour in milliseconds
    }), {
      headers: corsHeaders
    });
  } catch (error) {
    // If email already exists, generate a new one
    if (error.message.includes('UNIQUE constraint')) {
      return handleGenerateEmail(db);
    }
    throw error;
  }
}

// Handler: Get inbox for email
async function handleGetInbox(db, email) {
  // Check if email exists and is not expired
  const emailRecord = await db.prepare(
    'SELECT * FROM emails WHERE address = ? AND expires_at > ?'
  ).bind(email, Date.now()).first();

  if (!emailRecord) {
    return new Response(JSON.stringify({ 
      error: 'Email not found or expired' 
    }), {
      status: 404,
      headers: corsHeaders
    });
  }

  // Get all emails in inbox
  const result = await db.prepare(
    'SELECT * FROM inbox WHERE email_address = ? ORDER BY timestamp DESC'
  ).bind(email).all();

  return new Response(JSON.stringify({ emails: result.results || [] }), {
    headers: corsHeaders
  });
}

// Handler: Mark email as read
async function handleMarkAsRead(db, emailId) {
  await db.prepare(
    'UPDATE inbox SET read = 1 WHERE id = ?'
  ).bind(emailId).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: corsHeaders
  });
}

// Handler: Delete email
async function handleDeleteEmail(db, emailId) {
  await db.prepare(
    'DELETE FROM inbox WHERE id = ?'
  ).bind(emailId).run();

  return new Response(JSON.stringify({ success: true }), {
    headers: corsHeaders
  });
}

// Handler: Simulate receiving email (for testing)
async function handleSimulateEmail(db, email) {
  // Check if email exists
  const emailRecord = await db.prepare(
    'SELECT * FROM emails WHERE address = ? AND expires_at > ?'
  ).bind(email, Date.now()).first();

  if (!emailRecord) {
    return new Response(JSON.stringify({ 
      error: 'Email not found or expired' 
    }), {
      status: 404,
      headers: corsHeaders
    });
  }

  // Generate random demo email
  const subjects = [
    'Welcome to Our Service!',
    'Verify Your Email Address',
    'Your Verification Code',
    'Account Confirmation Required',
    'Complete Your Registration'
  ];

  const bodies = [
    'Thank you for signing up! Please verify your email address by clicking the link below.',
    'Your verification code is: 123456. This code will expire in 10 minutes.',
    'Welcome! To complete your registration, please confirm your email address.',
    'Your account has been created successfully. Click here to get started.',
    'Please verify your email to activate your account and access all features.'
  ];

  const from = `noreply@${['example.com', 'service.com', 'app.io', 'platform.net'][Math.floor(Math.random() * 4)]}`;
  const subject = subjects[Math.floor(Math.random() * subjects.length)];
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const htmlBody = `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <p style="color: #333; line-height: 1.6;">${body.replace(/\n/g, '<br>')}</p>
  </div>`;

  // Insert simulated email
  const result = await db.prepare(
    'INSERT INTO inbox (email_address, from_address, subject, body, html_body, timestamp, read) VALUES (?, ?, ?, ?, ?, ?, 0)'
  ).bind(email, from, subject, body, htmlBody, Date.now()).run();

  // Get the inserted email
  const newEmail = await db.prepare(
    'SELECT * FROM inbox WHERE id = ?'
  ).bind(result.meta.last_row_id).first();

  return new Response(JSON.stringify(newEmail), {
    headers: corsHeaders
  });
}

// Background task: Clean up expired emails
async function cleanupExpiredEmails(db) {
  try {
    const now = Date.now();
    
    // Get expired email addresses
    const expiredEmails = await db.prepare(
      'SELECT address FROM emails WHERE expires_at <= ?'
    ).bind(now).all();

    if (expiredEmails.results && expiredEmails.results.length > 0) {
      // Delete inbox entries for expired emails
      for (const email of expiredEmails.results) {
        await db.prepare(
          'DELETE FROM inbox WHERE email_address = ?'
        ).bind(email.address).run();
      }

      // Delete expired email records
      await db.prepare(
        'DELETE FROM emails WHERE expires_at <= ?'
      ).bind(now).run();

      console.log(`Cleaned up ${expiredEmails.results.length} expired emails`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
