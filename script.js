const axios = require("axios");

FIGMA_PERSONAL_ACCESS_TOKEN = "8543-648ac531-7da7-4c0b-b484-e8b0c4617092";
FIGMA_FILE_ID = "WaVrWlWpSAZrTJiA0GMZCfNQ";

/**
 *  Figma Setup and Functions
 */

figmaApiConfig = {
  headers: { "X-Figma-Token": FIGMA_PERSONAL_ACCESS_TOKEN }
};

function getFigmaNodes() {
  return axios
    .get(`https://api.figma.com/v1/files/${FIGMA_FILE_ID}`, figmaApiConfig)
    .then(response => {
      const nodes = response.data.document.children[0].children;
      return nodes.map(node => node.id);
    })
    .catch(error => {
      console.log(error);
    });
}

function getFigmaImage(nodeId) {
  return axios
    .get(
      `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${nodeId}`,
      figmaApiConfig
    )
    .then(response => {
      return response.data.images[nodeId];
    })
    .catch(error => {
      console.log(error);
    });
}

/**
 *  Google Slides
 */

// TODO

/**
 * Script
 */

console.log("Pull images from Figma...");
getFigmaNodes().then(nodeIds => {
  const calls = nodeIds.map(nodeId => getFigmaImage(nodeId));
  axios.all(calls).then(imageUrls => {
    console.log("imageUrls", imageUrls);
  });
});
