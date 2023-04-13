import fs from 'fs';

const fileName = 'test.txt';
const fileContent = 'Hello World!';

fs.writeFile(fileName, fileContent, (err) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('File created successfully');
});