const axios = require("axios");
require("dotenv").config();

const figma = require("./src/figma.js");
const googleSlides = require("./src/google-slides.js");

console.log("Pulling images from Figma...");
figma.getNodes().then(nodeIds => {
  const figmaImageRequests = nodeIds.map(nodeId => figma.getImage(nodeId));
  axios.all(figmaImageRequests).then(figmaImageUrls => {
    console.log(`${figmaImageUrls.length} images pulled from Figma.\n`);

    console.log("Authenticating with Google API...");
    const jwtClient = googleSlides.authenticate();

    console.log("Deleting existing slides...");
    googleSlides.deleteExistingSlides(jwtClient);

    console.log("Creating new slides...");
    googleSlides.createSlidesFromImages(jwtClient, figmaImageUrls);
  });
});
