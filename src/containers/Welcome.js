import React, { Component } from "react";
import { LinkContainer } from "react-router-bootstrap";
import "./Welcome.css";

export default class Welcome extends Component {
  render() {
    return (
      <div className="Welcome">
        <div className="lander">
          <h1>Welcome</h1>
          <h2>Crear Activa</h2>
          <LinkContainer to="/login"><p>Sign in</p></LinkContainer>
          <LinkContainer to="/signup"><p>Don't have an account? Sign up here</p></LinkContainer>
        </div>
      </div>
    );
  }
}

