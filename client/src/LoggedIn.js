import React, { Component } from 'react';
import ResultsImage from './ResultsImage.js';
import Loader from 'react-loader-spinner'
import logo from './images/MicrosoftImage.png';
const QUERYSTRING = require('querystring');

try {
  var results = require('./images/ResultsImage.png');
} catch (ex) {
    // console.log(ex);
}

function getImage() {
  try {
    var results = require('./images/ResultsImage.png');
    return results;
  } catch (ex) {
      // console.log(ex);
    return null;
  }
}
class LoggedIn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: "",
      loader: false,
      imageCreated: true,
      access_token: null,
      error: false,
      errorMessage: "",
      logoutLink:""
    }
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
    let access_token = this.parseAccessToken(this.props.location.search);

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
        
        // TODO: Get name
        if (access_token == null) {
          this.setState({
            loader:false,
            error:true,
            errorMessage:"Invalid access token! Unable to access your Spotify."
          });
        } else {
          this.setState({
            loader:false,
            access_token:access_token,
            error:false,
            errorMessage:"",
            logoutLink: info.auth_endpoint + str
          });
        }
      });
  }

  parseAccessToken(str) {
    if (str.substring(0,6) === "?code=") {
      return str.substring(6,str.length);
    }
    return null;
  }

  generateImage() {
    this.setState({
      loader:true
    });
    let input = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    let uri = "http://localhost:8080/" + this.state.access_token;
    fetch(uri, input)
      .then(res => res.json())
      .then(info => {
        this.setState({loader:false});
      });
  }

  render() {
    return (
      <div className="Homepage">
        <div className="leftContent">
          <div className="HomeHeader">
            <img src={logo} className="MusicWordCloud-logo" alt="Image not available" />
            <h1>Welcome {this.state.name}</h1>
          </div>
          <div className="HomeContent">
            <button className="submitButton" onClick={this.generateImage.bind(this)}>Generate Image</button>
            <a href={this.state.logoutLink} class="isButton">Different user?</a>
          </div>
        </div>
        <div className="rightContent">
          { this.state.error ?
            (
              <div className="Error">
                <p>{this.state.errorMessage}</p>
              </div>
            ) :
            (
              this.state.loader ?
              (<Loader type="Circles" color="white" height={80} width={80}/>) :
              (this.state.imageCreated ?
                (<img src={results} className="ResultsImage" />) :
                (<p></p>))
            )
          }
        </div>
      </div>
    );
  }
}

export default LoggedIn;
