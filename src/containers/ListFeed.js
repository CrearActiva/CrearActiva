import React, { Component } from "react";
import "./Home.css";
import { API } from "aws-amplify";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";


export default class ListFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      posts: []
    };

    this.myInit = { // OPTIONAL
        headers: {}, // OPTIONAL
        response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        queryStringParameters: {  // OPTIONAL
            name: 'param'
        }
    };

  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const posts = await this.posts();
      this.setState({ posts });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  posts() {
    return API.get("posts", "/posts");
  }


  renderPostsList(notes) {
    return [{}].concat(notes).map(
      (note, i) =>
        i !== 0
          ? <LinkContainer
              key={note.noteId}
              to={`/notes/${note.noteId}`}
            >
              <ListGroupItem header={note.content.trim().split("\n")[0]}>
                {"Created: " + new Date(note.createdAt).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to="/notes/new"
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> Create a new note
                </h4>
              </ListGroupItem>
            </LinkContainer>
    );
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p>A simple post taking app</p>
      </div>
    );
  }

  renderPosts() {
    return (
      <div className="posts">
        <PageHeader>Your Posts</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderPostsList(this.state.posts)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderPosts() : this.renderLander()}
      </div>
    );
  }
}
