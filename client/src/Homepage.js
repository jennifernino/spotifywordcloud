import React, { Component } from 'react';
import ResultsImage from './ResultsImage.js';
import logo from './images/MicrosoftImage.png';
const querystring = require('querystring');

class Homepage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loginLink: ""
    }
  }

  generateRandomString() {
    var text = '';
    var chars = "abcdefghijkmnpqrstuvwxyz23456789";
    for (var i = 0; i < 16; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return text;
  }

  componentDidMount() {
    let input = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    let uri = "http://localhost:8080/login_credentials";

    fetch(uri, input)
      .then(res => res.json())
      .then(info => {
        let str = querystring.stringify({
          client_id: info.client_id,
          redirect_uri: info.redirect_uri,
          scope: info.curr_scope,
          response_type: "code",
          show_dialog:true
        });

        this.setState({
          loginLink: info.auth_endpoint + str
        });
      });
  }

  render() {
    return (
      <div className="Homepage">
        <div className="HomeHeader">
          <h1>Welcome to MusicWordCloud</h1>
        </div>
        <a href={this.state.loginLink} class="isButton">Login to Spotify</a>
      </div>
    );
  }
}

export default Homepage;
