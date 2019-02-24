/**
 *  Figma
 */

const axios = require("axios");

figmaApiConfig = {
  headers: { "X-Figma-Token": process.env.FIGMA_PERSONAL_ACCESS_TOKEN }
};

function getFigmaNodes() {
  return axios
    .get(
      `https://api.figma.com/v1/files/${process.env.FIGMA_FILE_ID}`,
      figmaApiConfig
    )
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
      `https://api.figma.com/v1/images/${
        process.env.FIGMA_FILE_ID
      }?ids=${nodeId}`,
      figmaApiConfig
    )
    .then(response => response.data.images[nodeId])
    .catch(error => {
      console.log(error);
    });
}

module.exports = {
  getFigmaNodes,
  getFigmaImage
};
