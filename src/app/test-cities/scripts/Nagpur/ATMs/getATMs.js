//68a068205e44e978673dcdfb

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
    const collection = db.collection("Nagpur"); // your collection

    // Fetch the single document by ObjectId
    const doc = await collection.findOne({ _id: new ObjectId("68a07c8f5e44e978673dcdfd") });

    if (!doc) {
      console.log("Document not found!");
      return;
    }

    const geojson = doc; // your single ATM GeoJSON

    const cityMapData = {};

    geojson.features.forEach(feature => {
      if (
        feature.geometry?.type === "Point" &&
        feature.properties?.amenity === "atm"
      ) {
        const coords = [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

      const name = `${feature.properties.name || 'ATM'} ${hashString(feature.properties['@id'] || '')}`; 

        if (!cityMapData["nagpur"]) {
          cityMapData["nagpur"] = [];
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

        cityMapData["nagpur"].push({
          coords,
          name,
          description,
          url: props.website,
          category: "atm",
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
    const outputPath = path.join(__dirname, "NagpurCityATMMDBData.js");
    const outputCode = `export const NagpurCityATMMDBData = ${JSON.stringify(cityMapData, null, 2)};`;
    fs.writeFileSync(outputPath, outputCode);

    console.log("✅ Nagpur ATM data generated successfully from MongoDB ObjectID!");
  } finally {
    await client.close();
  }
}

run().catch(console.error);