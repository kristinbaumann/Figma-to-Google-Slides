const axios = require("axios");
require("dotenv").config();

const { getFigmaNodes, getFigmaImage } = require("./figma.js");
const {
  authenticateGoogleApi,
  deleteExistingPresentationSlides,
  createSlidesWithFigmaImage
} = require("./google-slides.js");

console.log("Pulling images from Figma...");
getFigmaNodes().then(nodeIds => {
  const figmaImageCalls = nodeIds.map(nodeId => getFigmaImage(nodeId));
  axios.all(figmaImageCalls).then(imageUrls => {
    console.log(`${imageUrls.length} images pulled from Figma.\n`);

    console.log("Authenticating with Google API...");
    const jwtClient = authenticateGoogleApi();

    console.log("Deleting existing slides...");
    deleteExistingPresentationSlides(jwtClient);

    console.log("Creating new slides...");
    createSlidesWithFigmaImage(jwtClient, imageUrls);
  });
});
