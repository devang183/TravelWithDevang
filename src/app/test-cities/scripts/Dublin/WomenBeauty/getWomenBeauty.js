import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash % 100000); // Limit to 5 digits
  }
const uri = "mongodb+srv://kankariadevang:FRg8Euj7xssSKpob@devangdb.2ckz3bw.mongodb.net/";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("hello"); // your DB
    const collection = db.collection("collection1"); // your collection

    // Fetch the single document by ObjectId
    const doc = await collection.findOne({ _id: new ObjectId("68a03dcc5e44e978673dcde5") });

    if (!doc) {
      console.log("Document not found!");
      return;
    }

    const geojson = doc; // your single womenbeauty GeoJSON

    const cityMapData = {};

    geojson.features.forEach(feature => {
      if (
        feature.geometry?.type === "Point" &&
        feature.properties?.shop === "beauty"
      ) {
        const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'Beauty'} ${hashString(feature.properties['@id'] || '')}`; 

        if (!cityMapData["dublin"]) {
          cityMapData["dublin"] = [];
        }

        let details = [];
        const props = feature.properties;

        if (props.housenumber) details.push(`<strong>House Number:</strong> ${props.housenumber}`);
        if (props["building:levels"]) details.push(`<strong>Building Levels:</strong> ${props["building:levels"]}`);
        if (props["addr:street"]) details.push(`<strong>Street:</strong> ${props["addr:street"]}`);
        if (props["addr:city"]) details.push(`<strong>City:</strong> ${props["addr:city"]}`);
        if (props["addr:postcode"]) details.push(`<strong>Postcode:</strong> ${props["addr:postcode"]}`);
        if (props["contact:email"]) details.push(`<strong>Email:</strong> ${props["contact:email"]}`);
        if (props["contact:instagram"]) details.push(`<strong>Instagram:</strong> ${props["contact:instagram"]}`);
        if (props["contact:facebook"]) details.push(`<strong>Facebook:</strong> ${props["contact:facebook"]}`);
        if (props.website) details.push(`<strong>Website:</strong> <a href="${props.website}" target="_blank">${props.website}</a>`);

        const contact = props.phone || props["contact:phone"] || props["phone:mobile"];
        if (contact) details.push(`<strong>Contact:</strong> ${contact}`);
        if (props.opening_hours) details.push(`<strong>Opening Hours:</strong> ${props.opening_hours}`);
        if (props.brand) details.push(`<strong>Brand:</strong> ${props.brand}`);
        if (props.wheelchair) details.push(`<strong>Wheelchair Access:</strong> ${props.wheelchair}`);
        if (props["wheelchair:description"]) details.push(`<strong>Wheelchair Description:</strong> ${props["wheelchair:description"]}`);

        const description = details.length > 0 ? details.join("<br>") : "No additional information available";

        cityMapData["dublin"].push({
          coords,
          name,
          description,
          url: props.website,
          category: "womenbeauty",
          keywords: [
            props["addr:street"],
            props["addr:city"],
            props["addr:postcode"],
            props.phone,
            props["contact:phone"],
            props.brand,
            props.website,
            props["contact:email"],
            props["contact:instagram"],
            props["contact:facebook"],
          ]
            .filter(Boolean)
            .map(k => k.toString().trim().toLowerCase())
        });
      }
    });


        // Current file path
    const __filename = fileURLToPath(import.meta.url);

    // Current folder path
    const __dirname = path.dirname(__filename);
    // Save output
    const outputPath = path.join(__dirname, "DublinCityWomenBeautyMDBData.js");
    const outputCode = `export const DublinCityWomenBeautyMDBData = ${JSON.stringify(cityMapData, null, 2)};`;
    fs.writeFileSync(outputPath, outputCode);

    console.log("✅ Dublin WomenBeauty data generated successfully from MongoDB ObjectID!");
  } finally {
    await client.close();
  }
}

run().catch(console.error);
// function hashString(str) {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//       hash = (hash << 5) - hash + str.charCodeAt(i);
//       hash |= 0; // Convert to 32bit integer
//     }
//     return Math.abs(hash % 100000); // Limit to 5 digits
//   }

//   const fs = require('fs');
// const { default: build } = require('next/dist/build');
//   const path = require('path');
  
//   // Read the GeoJSON file (assumed to be in the same folder)
//   const geojson = JSON.parse(
//     fs.readFileSync(path.join(__dirname, 'women.geojson'))
//   );  
//   const cityMapData = {};
  
//   geojson.features.forEach(feature => {
//     if (
//         feature.geometry.type === 'Point' &&
//         feature.properties.shop === 'beauty'
//       )  {
//       const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

//       const name = `${feature.properties.name || 'Beauty'} ${hashString(feature.properties['@id'] || '')}`; 
//       if (!cityMapData['dublin']) {
//         cityMapData['dublin'] = [];
//       }

//       const url=feature.properties.website; //
//       const housenumber=feature.properties.housenumber; //
//       const street = feature.properties["addr:street"]; //
//       const ccity=feature.properties["addr:city"];
//       const postcode=feature.properties["addr:postcode"]; //
//       const ohours=feature.properties.opening_hours; //
//       const email=feature.properties["contact:email"]; //

//       const phone=feature.properties.phone; //
//       const cphone=feature.properties["contact:phone"];
//       const pmobile=feature.properties["phone:mobile"];

//       const instagram=feature.properties["contact:instagram"];
//       const facebook=feature.properties[ "contact:facebook"];

//       const wheelchair=feature.properties.wheelchair; //
//       const wheelchairdesc=feature.properties["wheelchair:description"];
//       const buildinglevels=feature.properties["building:levels"];
//       const brand=feature.properties.brand;

//     let details = [];

// // Name / House name
// if (housenumber) details.push(`<strong>House Number:</strong> ${housenumber}`);

// // Address
// if (buildinglevels) details.push(`<strong>Building Levels:</strong ${buildinglevels}`);
// if (street) details.push(`<strong>Street:</strong> ${street}`);
// if (ccity) details.push(`<strong>City:</strong> ${ccity}`);
// if (postcode) details.push(`<strong>Postcode:</strong> ${postcode}`);
// if (email) details.push(`<strong>Email:</strong> ${email}`);
// if (instagram) details.push(`<strong>Instagram:</strong> ${instagram}`);
// if (facebook) details.push(`<strong>Facebook:</strong> ${facebook}`);
// if (url) details.push(`<strong>Website:</strong> <a href="${url}" target="_blank">${url}</a>`);

// if (phone || cphone || pmobile) {
//     const contact = phone || cphone || pmobile;
//     details.push(`<strong>Contact:</strong> ${contact}`);
//   }
// // Opening hours
// if (ohours) details.push(`<strong>Opening Hours:</strong> ${ohours}`);
// if (brand) details.push(`<strong>Brand:</strong> ${brand}`);


// // Accessibility
// if (wheelchair) details.push(`<strong>Wheelchair Access:</strong> ${wheelchair}`);
// if (wheelchairdesc) details.push(`<strong>Wheelchair Description:</strong> ${wheelchairdesc}`);
// // Join into HTML
// const description = details.length > 0
//     ? details.join('<br>')
//     : "No additional information available";

//       cityMapData['dublin'].push({
//         coords,
//         name,
//         description,
//         url,
//         category:'womenbeauty',
//         keywords: [street, ccity, postcode, phone, cphone, brand, url, email, instagram, facebook]
//         .filter(Boolean) // removes null/undefined/empty
//         .map(k => k.toString().trim().toLowerCase()) // normalize to lowercase and trim spaces
//       });
//     }
//   });

//     // Write output to DublinCityWomenBeautyData.js
//     const outputPath = path.join(__dirname, 'DublinCityWomenBeautyData.js');
//     const outputCode = `export const DublinCityWomenBeautyData = ${JSON.stringify(cityMapData, null, 2)};`;

//     fs.writeFileSync(outputPath, outputCode);
//     console.log('✅ Dublin WomenBeauty data generated successfully.');