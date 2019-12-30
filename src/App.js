import Routes from "./Routes";
import React, { Component } from "react";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./App.css";
import { Auth } from "aws-amplify";
import { Link, withRouter } from "react-router-dom";



class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: false,
      adminIsAuthenticated: false,
      isAuthenticating: true,
      user: [],
      currentCredentials: [],
      currentSession: []
    };
  }

  async componentDidMount() {
    try {
      await Auth.currentSession();
      this.userHasAuthenticated(true);
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

  adminHasAuthenticated = authenticated => {
    this.setState({ adminIsAuthenticated: authenticated});
  }
  handleLogout = async event => {
    await Auth.signOut();
    this.userHasAuthenticated(false);
    this.adminHasAuthenticated(false);
    this.props.history.push("/");
  }

  render() {
    const childProps = {
      isAuthenticated: this.state.isAuthenticated,
      adminIsAuthenticated: this.state.adminIsAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated,
      adminHasAuthenticated: this.adminHasAuthenticated
    };
    return (
      !this.state.isAuthenticating &&
      <div className="App container">
        <Navbar fluid collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">Scratch</Link>
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

