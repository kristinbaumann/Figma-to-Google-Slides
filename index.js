const axios = require("axios");
const { google } = require("googleapis");
require("dotenv").config();
const googleServiceAccount = require("./google-service-account.json");

/**
 *  Figma
 */

figmaApiConfig = {
  headers: { "X-Figma-Token": process.env.FIGMA_PERSONAL_ACCESS_TOKEN }
};

console.log(process.env.FIGMA_FILE_ID);
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

/**
 *  Google Slides
 */

function authenticateGoogleApi() {
  // configure a JWT auth client
  const jwtClient = new google.auth.JWT(
    googleServiceAccount.client_email,
    null,
    googleServiceAccount.private_key,
    ["https://www.googleapis.com/auth/presentations"]
  );

  //authenticate request
  jwtClient.authorize((err, tokens) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Successfully connected to Google API.");
    }
  });
  return jwtClient;
}

function deleteExistingPresentationSlides(jwtClient) {
  google.slides("v1").presentations.get(
    {
      auth: jwtClient,
      presentationId: process.env.GOOGLE_PRESENTATION_ID,
      fields: "slides"
    },
    (err, response) => {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      const slides = response.data.slides;
      if (slides.length <= 0) {
        console.log("No slides to delete");
        return;
      }
      google.slides("v1").presentations.batchUpdate(
        {
          auth: jwtClient,
          presentationId: process.env.GOOGLE_PRESENTATION_ID,
          resource: {
            requests: slides.map(({ objectId }) => ({
              deleteObject: {
                objectId
              }
            }))
          }
        },
        (err, presentation) => {
          if (err) {
            console.log("The API returned an error: " + err);
            return;
          }
          console.log(`Successfully deleted all slides.`);
        }
      );
    }
  );
}
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function createSlidesWithFigmaImage(jwtClient, imageUrls) {
  const requests = [];

  let objectId = getRandomInt(10000, 500000);
  imageUrls.forEach(imageUrl => {
    const createSlide = {
      createSlide: {
        objectId: String(objectId),
        slideLayoutReference: {
          predefinedLayout: "BLANK"
        }
      }
    };
    requests.push(createSlide);
    const addImage = {
      updatePageProperties: {
        objectId: String(objectId),
        pageProperties: {
          pageBackgroundFill: {
            stretchedPictureFill: {
              contentUrl: imageUrl
            }
          }
        },
        fields: "pageBackgroundFill"
      }
    };
    requests.push(addImage);

    objectId++;
  });

  google.slides("v1").presentations.batchUpdate(
    {
      auth: jwtClient,
      presentationId: process.env.GOOGLE_PRESENTATION_ID,
      resource: {
        requests
      }
    },
    (err, presentation) => {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      console.log(`Successfully created ${imageUrls.length} slides.`);
    }
  );
}

/**
 * Script
 */

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
