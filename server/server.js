const express = require('express');
const colors = require('colors');
const path = require('path');
const cors = require('cors');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const creds = require('./creds.js');

const GET_URI = "/v1/me/top";
const TRACKS = "/tracks";
const ARTIST = "/artists";

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get('/login_credentials', (request, response) => {
  response.json(
    {
      client_id: creds["client_id"],
      auth_endpoint: creds["auth_endpoint"],
      curr_scope: creds["scope"],
      redirect_uri: cred["redirect_uri"],
    }
  )
});
app.get('/:token', (request, response) => {
  console.log('- request received:', request.method.cyan, request.url.underline);
  response.status(200).type('html');

  let authorization_token = request.params.token;

  var spawn = require("child_process").spawn;

  var process = spawn('python',
    ["./CreateWordCloud.py",
    authorization_token,
    cred["redirect_uri"],
    creds["client_id"],
    creds["auth_endpoint"]]);
  process.stdout.on('data', function(data) {
    console.log(data.toString());
    response.json(
      {
        data : {
          "hello" : "world"
        }
      });
  });
});

app.listen(8080);
console.log('App is listening on port 8080'.grey);
