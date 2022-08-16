const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");

const authUser = express.Router();

// respond with "hello world" when a GET request is made to the homepage
authUser.post("/api/login", (req, res) => {
  const code = req.body.code;
  console.log(code);
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      res.status(400).json({ error: err });
    });
});

authUser.post("/api/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;

  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      console.log("The access token has been refreshed!");

      res.status(200).json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((e) => res.sendStatus(400));
});

module.exports = authUser;
