
INSTRUCTIONS FOR DEPLOYING ON RENDER
-----------------------------------

1) Do NOT put your Mega credentials in the repo. Use environment variables.
   On Render, go to your service -> Environment -> Environment Variables and add:
     MEGA_EMAIL  -> your_mega_email@example.com
     MEGA_PW     -> your_mega_password
   Also set NODE_ENV=production if needed.

2) The repo now includes a safe `mega.js` which reads credentials from process.env.
   Example use (inside your project):
     const mega = require('./mega');
     await mega.uploadFile('./session.json', 'session.json');

3) Ensure `package.json` includes "start" command (e.g. "node index.js" or as appropriate).
   Render will run `npm start` by default for a Node service. If using a web service, set the correct start command in Render settings.

4) After you set environment variables on Render, push this repo to GitHub (if not already)
   and connect the GitHub repo to Render for auto-deploy or deploy manually using their UI.

5) If you get "Internal Server Error", check Render logs (Logs tab) for the exact stack trace.
   Common issues: missing env vars, wrong node version, or the app crashing on startup.

If you want, after deploying I can help read the logs and suggest fixes.
