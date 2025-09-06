const fs = require('fs');
const inputPath = '/Users/devangkankaria/Documents/GitHub/travel-web-ui/src/app/test-cities/scripts/London/data-no-grocery.json'; 
const outputPath = '/Users/devangkankaria/Documents/GitHub/travel-web-ui/src/app/test-cities/scripts/London/data_half_restaurants.json';

fs.readFile(inputPath, 'utf8', (err, data) => {
  if (err) return console.error('Error reading file:', err);

  try {
    const jsonData = JSON.parse(data);

    // Separate restaurants and other items
    const restaurants = jsonData.filter(item => item.category === 'restaurant');
    const otherItems = jsonData.filter(item => item.category !== 'restaurant');

    // Keep only half of the restaurants
    const halfRestaurants = restaurants.slice(0, Math.ceil(restaurants.length / 2));

    // Combine back with other items
    const newData = [...otherItems, ...halfRestaurants];

    fs.writeFile(outputPath, JSON.stringify(newData, null, 2), 'utf8', (err) => {
      if (err) return console.error('Error writing file:', err);
      console.log(`New file created with half the restaurants: ${outputPath}`);
    });
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
  }
});