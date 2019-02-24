const axios = require("axios");
const { google } = require("googleapis");

FIGMA_PERSONAL_ACCESS_TOKEN = "8543-648ac531-7da7-4c0b-b484-e8b0c4617092";
FIGMA_FILE_ID = "WaVrWlWpSAZrTJiA0GMZCfNQ";

GOOGLE_PRESENTATION_ID = "1sImag8qfZErDDt8JnUdAJEz_xOe9T5lVD6MZwYbRdqs";
const googleServiceAccount = require("./Figma-To-Slides-00e2cb247f6d.json");

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
      return;
    } else {
      console.log("Successfully connected to Google API.");
    }
  });
  return jwtClient;
}

function deleteExistingPresentationSlides() {
  slideService.presentations.get(
    {
      auth: jwtClient,
      presentationId: GOOGLE_PRESENTATION_ID,
      fields: "slides"
    },
    (err, response) => {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      const slides = response.data.slides;
      console.log("Anzahl an Slides", slides.length);
      // TODO: perform delete action
    }
  );
}

function createSlidesWithFigmaImage(jwtClient, imageUrls) {
  const requests = [];

  let objectId = 123456;
  imageUrls.forEach(imageUrl => {
    const createSlide = {
      createSlide: {
        objectId: String(objectId),
        slideLayoutReference: {
          predefinedLayout: "BLANK"
        }
      }
    };
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
    requests.push(createSlide);
    requests.push(addImage);

    objectId++;
  });

  google.slides("v1").presentations.batchUpdate(
    {
      auth: jwtClient,
      presentationId: GOOGLE_PRESENTATION_ID,
      resource: {
        requests
      }
    },
    (err, presentation) => {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      console.log("Successfully performed batch update to Google API.");
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

    console.log("Creating slides in Google Slides...");
    const jwtClient = authenticateGoogleApi();
    // deleteExistingPresentationSlides();
    createSlidesWithFigmaImage(jwtClient, imageUrls);
  });
});
