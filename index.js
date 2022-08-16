const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const SpotifyWebApi = require("spotify-web-api-node");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;

app.use("/production", require("./routes/login"));

app.post("/api/refresh", (req, res) => {
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

app.post("/api/login", (req, res) => {
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

app.post("/api/search", (req, res) => {
  const { q } = req.body;
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
  });
  spotifyApi.setAccessToken(req.headers.authorization.split(" ")[1]);
  spotifyApi.searchTracks(q).then(
    function (data) {
      res.status(200).json(data.body);
    },
    function (err) {
      res.json(err.body);
    }
  );
});

app.listen(port, () => console.log("Server listening on port 8080"));
