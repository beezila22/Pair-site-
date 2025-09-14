
/**
 * Clean mega.js for Maki-pair project
 * - Uses environment variables: MEGA_EMAIL, MEGA_PW
 * - Exposes uploadFile(filePath, remoteName) and getFileLink(fileShare) helpers
 *
 * Install dependency: megajs (already in package.json)
 *
 * Usage (example):
 *   const mega = require('./mega');
 *   await mega.uploadFile('./session.json', 'session.json')
 *
 * NOTE: Do NOT hardcode credentials in this file. Set them on Render or your host:
 *   MEGA_EMAIL and MEGA_PW
 */
const { Storage } = require('megajs');
const path = require('path');
const fs = require('fs');

function getClient() {
  const email = process.env.MEGA_EMAIL;
  const password = process.env.MEGA_PW;
  if (!email || !password) {
    throw new Error('MEGA_EMAIL and MEGA_PW environment variables must be set.');
  }
  // Storage is a constructor that returns a storage object with login and upload methods
  return new Storage({ email, password });
}

/**
 * Upload a local file to the root of your Mega account.
 * @param {string} localPath - path to local file
 * @param {string} remoteName - desired name on Mega (optional; defaults to basename of localPath)
 * @returns {Promise<string>} - public link (URL) to the uploaded file
 */
async function uploadFile(localPath, remoteName) {
  if (!fs.existsSync(localPath)) throw new Error(`Local file not found: ${localPath}`);
  remoteName = remoteName || path.basename(localPath);

  const client = getClient();

  return new Promise((resolve, reject) => {
    client.on('ready', async () => {
      try {
        const root = client.root;
        const fileStream = fs.createReadStream(localPath);
        const uploaded = root.upload(fileStream, { name: remoteName }, (err, file) => {
          if (err) {
            client.close();
            return reject(err);
          }
          // Once uploaded, get the public link (file.publicLink is available)
          file.loadAttributes(() => {
            const link = file.publicUrl || (file._downloadLink && file._downloadLink());
            client.close();
            resolve(link);
          });
        });
      } catch (err) {
        client.close();
        reject(err);
      }
    });

    client.on('error', err => {
      reject(err);
    });

    client.login(); // start login
  });
}

/**
 * Create a public link for an existing file node (if you already have the node object).
 * This is a placeholder in case other parts of the app expect it.
 */
async function getPublicLinkForNode(node) {
  return new Promise((resolve, reject) => {
    try {
      node.export((err, url) => {
        if (err) return reject(err);
        resolve(url);
      });
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = {
  uploadFile,
  getPublicLinkForNode,
};
