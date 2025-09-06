const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

const s3 = new AWS.S3({ region: 'eu-west-1' });
const bucketName = 'cityphotoscity';
const localImagesRoot = path.join(__dirname, 'public', 'images'); // adjust if needed

// Read all city folders inside public/images
const cities = fs.readdirSync(localImagesRoot).filter(f => fs.statSync(path.join(localImagesRoot, f)).isDirectory());

cities.forEach(city => {
  const cityFolder = path.join(localImagesRoot, city);
  const files = fs.readdirSync(cityFolder).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));

  files.forEach(async (file) => {
    const filePath = path.join(cityFolder, file);
    const fileStream = fs.createReadStream(filePath);

    const params = {
      Bucket: bucketName,
      Key: `images/${city}/${file}`, // upload inside images/city/
      Body: fileStream,
      //ACL: 'public-read' // optional if you want them publicly accessible
    };

    try {
      await s3.upload(params).promise();
      console.log(`Uploaded ${file} to images/${city}/`);
    } catch (err) {
      console.error(`Error uploading ${file}:`, err);
    }
  });
});

//FOR FOLDER CREATION (KEEP IT)
// const AWS = require('aws-sdk');
// const fs = require('fs');
// const path = require('path');

// // Configure AWS
// AWS.config.update({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// const s3 = new AWS.S3();
// const bucketName = 'cityphotoscity';
// const imagesPath = path.join(__dirname, 'public/images'); // Local folder where your city folders are

// // Get all city folders in local images folder
// const cities = fs.readdirSync(imagesPath).filter(file =>
//   fs.statSync(path.join(imagesPath, file)).isDirectory()
// );

// cities.forEach(city => {
//   const cityFolder = `images/${city}/`; // S3 folder ends with '/'
  
//   const params = {
//     Bucket: bucketName,
//     Key: cityFolder,
//     Body: '', // empty body for a folder
//   };

//   s3.putObject(params, (err, data) => {
//     if (err) {
//       console.error(`Error creating folder ${city}:`, err);
//     } else {
//       console.log(`Folder created: ${city}`);
//     }
//   });
// });