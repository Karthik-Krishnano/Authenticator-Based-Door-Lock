const express = require('express');
const authenticator = require('authenticator');
const qrcode = require('qrcode');
const { createCanvas } = require('canvas');

const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Render the login form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Generate QR code and secret
app.post('/generate', async (req, res) => {
  const { id } = req.body;

  const secret = authenticator.generateKey();
  const otpAuthUrl = authenticator.generateTotpUri(secret, id, 'Your App');

  try {
    const qrCodeDataUrl = await generateQRCodeDataUrl(otpAuthUrl);
    res.send({ secret: secret, qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).send('Error generating QR code');
  }
});

// Validate PIN
app.post('/login', (req, res) => {
  const { id, pin, secret } = req.body;

  const isValid = authenticator.verifyToken(secret, pin);

  if (isValid) {
    res.send('PIN is valid');
  } else {
    res.send('Invalid PIN');
  }
});

// Generate QR code data URL
async function generateQRCodeDataUrl(data) {
  const canvas = createCanvas(300, 300);
  await qrcode.toCanvas(canvas, data);
  return canvas.toDataURL();
}

// Start the server
app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
