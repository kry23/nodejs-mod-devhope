import { writeFileSync } from 'fs';
import figlet from 'figlet';

const message = 'Node JS Module';
figlet(message, (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  const readme = `# My Project

This is a really cool project!

${data}`;

  writeFileSync('README.md', readme);
  console.log('README.md file written successfully');
});