import React, { Component } from "react";
import {FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import { Auth } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import Amplify from "aws-amplify";
// let button = "user";

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
    // console.log(button);
    console.log(this.props);
    console.log(this.state);
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
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: config.cognito.REGION,
          userPoolId: config.cognito.USER_POOL_ID,
          identityPoolId: config.cognito.IDENTITY_POOL_ID,
          userPoolWebClientId: config.cognito.APP_CLIENT_ID
        },
        Storage: {
          region: config.s3.REGION,
          bucket: config.s3.BUCKET,
          identityPoolId: config.cognito.IDENTITY_POOL_ID
        },
        API: {
          endpoints: [
            {
              name: "posts",
              endpoint: config.apiGateway.URL,
              region: config.apiGateway.REGION
            },
          ]
        }
      });
      await Auth.signIn(this.state.username, this.state.password);
      this.props.userHasAuthenticated(true);
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }

  }

  handleUserSubmit = async event => {
    console.log("User login.");
    event.preventDefault();

    this.setState({ isLoading: true });
    try {
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: config.cognito.REGION,
          userPoolId: config.cognito.USER_POOL_ID,
          identityPoolId: config.cognito.IDENTITY_POOL_ID,
          userPoolWebClientId: config.cognito.APP_CLIENT_ID
        },
        Storage: {
          region: config.s3.REGION,
          bucket: config.s3.BUCKET,
          identityPoolId: config.cognito.IDENTITY_POOL_ID
        },
        API: {
          endpoints: [
            {
              name: "posts",
              endpoint: config.apiGateway.URL,
              region: config.apiGateway.REGION
            },
          ]
        }
      });
      await Auth.signIn(this.state.username, this.state.password);
      this.props.userHasAuthenticated(true);
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }

  }

  handleAdminSubmit = async event => {
    console.log("Admin login.");

    event.preventDefault();

    this.setState({ isLoading: true });
    try {
      Amplify.configure({
        Auth: {
          mandatorySignIn: true,
          region: config.cognito_admin.REGION,
          userPoolId: config.cognito_admin.USER_POOL_ID,
          identityPoolId: config.cognito_admin.IDENTITY_POOL_ID,
          userPoolWebClientId: config.cognito_admin.APP_CLIENT_ID
        },
        Storage: {
          region: config.s3.REGION,
          bucket: config.s3.BUCKET,
          identityPoolId: config.cognito_admin.IDENTITY_POOL_ID
        },
        API: {
          endpoints: [
            {
              name: "posts",
              endpoint: config.apiGateway.URL,
              region: config.apiGateway.REGION
            },
          ]
        }
      });
      await Auth.signIn(this.state.username, this.state.password);
      this.props.adminHasAuthenticated(true);
    } catch (e) {
      alert(e.message);
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
        {/* admin login button */}
        <form onSubmit={this.handleSubmit}>
          <LoaderButton
            block
            bsSize="large"
            onclick={this.handleAdminSubmit}
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Admin Login"
            id="adminlogin"
            loadingText="Logging in…"
          />
        </form>
      </div>
    );
  }
}
