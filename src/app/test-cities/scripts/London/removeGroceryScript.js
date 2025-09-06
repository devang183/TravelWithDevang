const fs = require('fs');
const inputPath = '/Users/devangkankaria/Documents/GitHub/travel-web-ui/src/app/test-cities/scripts/London/sample.json';       // original JSON file
const outputPath = '/Users/devangkankaria/Documents/GitHub/travel-web-ui/src/app/test-cities/scripts/London/data-no-grocery.json'; // new file without grocery items

fs.readFile(inputPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);

    // Filter out grocery items
    const filteredData = jsonData.filter(item => item.category !== 'grocery');

    // Write the filtered data to a new file
    fs.writeFile(outputPath, JSON.stringify(filteredData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log(`New file created without grocery items: ${outputPath}`);
    });
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
  }
});