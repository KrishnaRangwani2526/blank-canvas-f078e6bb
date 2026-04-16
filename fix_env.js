const fs = require('fs');
let c = fs.readFileSync('.env', 'utf8');
c = c.split('\n').filter(l => !l.includes('V I T E')).join('\n');
c += '\nVITE_GEMINI_API_KEY="AIzaSyAGFd_sKa3U3uBN9MIkmsVKlfvlwZUCMp8"';
fs.writeFileSync('.env', c);
