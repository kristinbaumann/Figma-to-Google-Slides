/**
 *  Google Slides
 */
const googleServiceAccount = require("../config/google-service-account.json");
const { google } = require("googleapis");

const slideService = google.slides("v1");

function authenticate() {
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

function deleteExistingSlides(jwtClient) {
  slideService.presentations.get(
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
      slideService.presentations.batchUpdate(
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

function createSlidesFromImages(jwtClient, imageUrls) {
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

  slideService.presentations.batchUpdate(
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

module.exports = {
  authenticate,
  deleteExistingSlides,
  createSlidesFromImages
};
