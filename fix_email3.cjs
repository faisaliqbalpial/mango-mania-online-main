const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /const handleSubmit = async \(e: React\.FormEvent\) => \{[\s\S]*?\n  \};/;

const newSubmit = `const handleSubmit = (e: React.FormEvent) => {
    if (!form.name || !form.mobile || !form.area || !form.address) {
      e.preventDefault();
      toast.error(t.fillAll);
      return;
    }
  };`;

content = content.replace(regex, newSubmit);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Successfully updated handleSubmit');
