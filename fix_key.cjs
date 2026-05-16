const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '<input type="hidden" name="access_key" value="YOUR_WEB3FORMS_ACCESS_KEY" />',
  '<input type="hidden" name="access_key" value="b814ca83-3d5c-4008-a828-72c4352e69d7" />'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Fixed access key value.');
