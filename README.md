# Figma to Google Slides (with Node.js)

**Convert <a href="https://figma.com">Figma</a> frames into a Google Slides presentation**

Forked from https://github.com/alyssaxuu/Figma-to-Google-Slides and adapted to use Node.js instead of PHP.

# Setup

1. Clone the repository.
2. Install the Node Modules with `npm install` or `yarn install`.
3. Duplicate the `.env.example` file and name it `.env`. This file will store the necessary credentials.
4. Figma Setup
   - Get your personal Figma Access Token (Go to the [API documentation](https://www.figma.com/developers/docs), scroll down to the "Access Tokens" section, and click on "Get personal access token".) and paste it in the `.env` file for `FIGMA_PERSONAL_ACCESS_TOKEN`.
   - Create a new Figma project and copy the file id from the URL in the `.env` file for `FIGMA_FILE_ID`.
5. Google API Setup
   - Create a service API key in the [Google API Console](https://console.cloud.google.com/apis/), download the JSON key file and place it in the `/config` folder with the name `google-service-account.json`.
   - Create a new Google Slides project and share it with your previously generated service account email address (with edit permissions).
   - Copy the presentation id from the URL in the `.env` file for `GOOGLE_PRESENTATION_ID`.
6. Add two example frames (e.g. with the dimensions 960x540px) to your Figma project with background colors and some text.
7. Run the script with `npm start` and see how the slides update in your Google presentation.

# Hints

- The order of the slides is determined by the frame hierarchy in Figma, from bottom to top. That means that the first slide is the one placed on the bottom of the "Layers" panel, and the last one is the one on the top.
- Figma Frame Dimensions: 960x540px for Widescreen (16:9) or 960x720px for Standard (4:3) presentations
