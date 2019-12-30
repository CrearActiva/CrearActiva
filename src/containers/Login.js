import React, { Component } from "react";
import {FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import { Auth } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import Amplify from "aws-amplify";
import { strict } from "assert";

//This function is to decrpt the JWT token that is returned from login function call
function parseJwt (token) {
  let base64Url = String(token).split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
        isLoading: false,
        username: "",
        password: ""
    };
  }

  async componentDidMount() {
    console.log(this.props);
    console.log(this.state);
    console.log("Credentials");
    console.log(Auth.currentCredentials());
    console.log("Session");
    console.log(Auth.currentSession());
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });
    try {
      const user = await Auth.signIn(this.state.username, this.state.password);
      this.props.userHasAuthenticated(true);
      const idToken = user.signInUserSession.idToken;
      const cognitoroles = parseJwt(idToken.jwtToken)["cognito:roles"][0];
      console.log(cognitoroles);
      if (cognitoroles.indexOf("Cognito_crearactiva_admins_identityAuth_Role") > -1) {
        //Account is admin
        console.log("Account is admin");
        this.props.adminHasAuthenticated(true);
      }
      else{
        //Account is regular user
        console.log("Account is a regular user");
      }
    } catch (err) {
      console.log(err);
      if (err.code === 'UserNotConfirmedException') {
          // The error happens if the user didn't finish the confirmation step when signing up
          // In this case you need to resend the code and confirm the user
          // About how to resend the code and confirm the user, please check the signUp part
      } else if (err.code === 'PasswordResetRequiredException') {
          // The error happens when the password is reset in the Cognito console
          // In this case you need to call forgotPassword to reset the password
          // Please check the Forgot Password part.
      } else if (err.code === 'NotAuthorizedException') {
          // The error happens when the incorrect password is provided
      } else if (err.code === 'UserNotFoundException') {
          // The error happens when the supplied username/email does not exist in the Cognito user pool
      } else {

      }
      this.setState({ isLoading: false });
    }

  }

  render() {
    return (
      <div className="Login">
        {/* user login button */}
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="username" bsSize="large">
            <ControlLabel>Account Username</ControlLabel>
            <FormControl
              autoFocus
              type="username"
              value={this.state.username}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <LoaderButton
            block
            bsSize="large"
            onclick={this.handleSubmit}
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Login"
            id="userlogin"
            loadingText="Logging in…"
          />
        </form>
      </div>
    );
  }
}
