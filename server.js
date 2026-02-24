// server.js
const express = require('express');
const ftp = require('basic-ftp');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/download-ftp-zip', async (req, res) => {
  const { host, port, user, password, path: remotePath } = req.body;

  const client = new ftp.Client();
  const localPath = path.join(__dirname, 'temp_video.zip');

  try {
    await client.access({
      host: host || 'ftpupload.net',
      port: port || 21,
      user,
      password,
      secure: false
    });

    console.log(`Connected to FTP. Downloading ${remotePath}...`);

    await client.downloadTo(localPath, remotePath);

    // Send the downloaded ZIP file to the browser
    res.download(localPath, 'video.zip', async (err) => {
      if (err) {
        console.error('Send error:', err);
      }
      // Clean up temporary file
      await fs.unlink(localPath).catch(() => {});
    });
  } catch (err) {
    console.error('FTP error:', err);
    res.status(500).json({ error: err.message || 'Failed to download from FTP' });
  } finally {
    client.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
