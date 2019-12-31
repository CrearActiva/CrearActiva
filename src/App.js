import Routes from "./Routes";
import React, { Component } from "react";
import { Nav, Navbar, NavItem, Image } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import { Auth } from "aws-amplify";
import { Link, withRouter } from "react-router-dom";

//This function is to decrpt the JWT token that is returned from login function call
function parseJwt (token) {
  let base64Url = String(token).split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAuthenticated: false,
      adminIsAuthenticated: false,
      isAuthenticating: true,
      user: ""
    };
  }

  async componentDidMount() {
    try {
      let session = await Auth.currentSession();
      this.userHasAuthenticated(true);
      const idToken = session.idToken;
      const cognitoroles = parseJwt(idToken.jwtToken)["cognito:roles"][0];
      const user = parseJwt(session.idToken.jwtToken).name;
      this.updateUser(user);
      if (cognitoroles.indexOf("Cognito_crearactiva_admins_identityAuth_Role") > -1) {
        //Account is admin
        console.log("Account is admin");
        this.adminHasAuthenticated(true);
      }
    }
    catch(e) {
      if (e !== 'No current user') {
        alert(e);
      }
    }
    this.setState({ isAuthenticating: false });
  }

  userHasAuthenticated = authenticated => {
    this.setState({ isAuthenticated: authenticated });
  }

  updateUser = username => {
    this.setState({ user: username});
    console.log(this.state.user);
  }

  adminHasAuthenticated = authenticated => {
    this.setState({ adminIsAuthenticated: authenticated});
  }

  handleLogout = async event => {
    await Auth.signOut();
    this.userHasAuthenticated(false);
    this.adminHasAuthenticated(false);
    this.props.history.push("/");
    this.updateUser("");
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      adminIsAuthenticated: this.state.adminIsAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      adminHasAuthenticated: this.adminHasAuthenticated,
      setUserId: this.updateUser,
      userName: this.state.user
    };
    return (
      !this.state.isAuthenticating &&
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Image
                src={"logo.png"}
                responsive
              />
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullLeft>
              <LinkContainer to= {this.state.isAuthenticated ? "/Homepage" : "/"}>
                <NavItem>Home</NavItem>
              </LinkContainer>
            </Nav>
            <Nav pullRight>
              {this.state.isAuthenticated
                ? <NavItem onClick={this.handleLogout}>Logout</NavItem>
                : <NavItem></NavItem>
              }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
	      <Routes childProps={childProps} />
      </div>
    );
  }
}

export default withRouter(App);

