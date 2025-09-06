// Remove duplicates by 'name'
const uniqueFormatted = [];
const seenNames = new Set();

formatted.forEach(item => {
  if (!seenNames.has(item.name)) {
    seenNames.add(item.name);
    uniqueFormatted.push(item);
  }
});

console.log(`✅ Removed duplicates. ${uniqueFormatted.length} unique items remain.`);

// Save the unique JSON
fs.writeFileSync(outputFile, JSON.stringify(uniqueFormatted, null, 2));