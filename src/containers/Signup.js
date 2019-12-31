import React, { Component } from "react";
import {
  HelpBlock,
  FormGroup,
  FormControl,
  ControlLabel
} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Signup.css";
import { Auth } from "aws-amplify";

export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      connfirmation_page: false,
      username: "",
      password: "",
      name: "",
      confirmPassword: "",
      confirmationCode: "",
      newUser: null
    };
  }

  validateForm() {
    return (
      this.state.username.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
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
      const user = await Auth.signUp({
        username: this.state.username,
        password: this.state.password,
        attributes: {
        email: this.state.email,
        name: this.state.name
        }
      });
      console.log(user);
      this.setState({ newUser: user});
    } catch (e) {
      alert(e.message);
    }
    this.setState({ isLoading: false });
  }

  handleConfirmationSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await Auth.confirmSignUp(this.state.username, this.state.confirmationCode);
      await Auth.signIn(this.state.username, this.state.password);

      this.props.userHasAuthenticated(true);
      this.props.history.push("/");
    } catch (e) {
      alert(e.message);
      this.setState({ isLoading: false });
    }
  }

  handleResendSignup = async event => {
    console.log("Request to resend code");
    Auth.resendSignUp(this.state.username).then(() => {
      console.log('code resent successfully');
    }).catch(e => {
      console.log(e);
    });
  }

  handleRedirectConfirmation = async event => {
    this.setState({ newUser: this.state.username});
  }

  renderConfirmationForm() {
    return (
      <div>
      <form onSubmit={this.handleConfirmationSubmit}>
      <FormGroup controlId="username" bsSize="large">
          <ControlLabel>Username</ControlLabel>
          <FormControl
            autoFocus
            type="text"
            value={this.state.username}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
            autoFocus
            type="tel"
            value={this.state.confirmationCode}
            onChange={this.handleChange}
          />
          <HelpBlock>We've sent a confirmation code to your email, please check it.</HelpBlock>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          onclick = {this.handleConfirmationSubmit}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
      <LoaderButton
        block
        bsSize="large"
        disabled={!this.validateConfirmationForm()}
        type="button"
        isLoading={this.state.isLoading}
        onclick = {this.handleResendSignup}
        text="Resend the code"
        loadingText="Resending...."
      />
    </div>
    );
  }

  renderForm() {
    return (
      <div>
      <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="username" bsSize="large">
          <ControlLabel>Username</ControlLabel>
          <FormControl
            autoFocus
            type="text"
            value={this.state.username}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="name" bsSize="large">
          <ControlLabel>Name</ControlLabel>
          <FormControl
            autoFocus
            type="text"
            value={this.state.name}
            onChange={this.handleChange}
          />
        </FormGroup>
        <FormGroup controlId="email" bsSize="large">
          <ControlLabel>Email</ControlLabel>
          <FormControl
            autoFocus
            type="email"
            value={this.state.email}
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
        <FormGroup controlId="confirmPassword" bsSize="large">
          <ControlLabel>Confirm Password</ControlLabel>
          <FormControl
            value={this.state.confirmPassword}
            onChange={this.handleChange}
            type="password"
          />
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateForm()}
          onclick={this.handleSubmit}
          type="submit"
          isLoading={this.state.isLoading}
          text="Signup"
          loadingText="Signing up…"
        />
      </form>
      <LoaderButton
        bsSize="large"
        disabled={!this.validateForm()}
        onClick={this.handleRedirectConfirmation}
        type="button"
        isLoading={this.state.isLoading}
        text="I want to verify my account"
        loadingText="Redirecting you to account confirmation...."
      />
      </div>
    );
  }

  render() {
    return (
      <div className="Signup">
        {this.state.newUser === null
          ? this.renderForm()
          : this.renderConfirmationForm()}
      </div>
    );
  }
}
