//This page lists all the posts within a feed.
//Reference page: https://serverless-stack.com/chapters/list-all-the-notes.html

import React, { Component } from "react";
import "./ListFeed.css";
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
        // headers: {}, // OPTIONAL
        // response: true, // OPTIONAL (return the entire Axios response object instead of only response.data)
        queryStringParameters: {  // OPTIONAL
            feedId: ""
        }
    };

  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      // console.log(this.props);
      this.myInit.queryStringParameters.feedId = this.props.match.params.id;
      let posts = await this.getPosts();
      posts = JSON.parse(posts.body);
      // console.log(posts[1])
      this.setState({ posts });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  getPosts() {
    return API.get("posts", "/posts", this.myInit);
  }


  renderPostsList(posts) {
    this.props.history.location.state = "testFeed";

    console.log(this.props);
    return [{}].concat(posts).map(
      (post, i) =>
          i !== 0
          ? <LinkContainer
              key={post.postId}
              to={`/posts/${post.postId}`}
            >
              <ListGroupItem header={post.content.trim().split("\n")[0]}>
                {"Created: " + new Date(post.timestamp).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to={{
                pathname: "/posts/new",
                state: {feedId: this.myInit.queryStringParameters.feedId}
              }}    //use this nested json to pass params
            >
              <ListGroupItem> 
                <h4>
                  <b>{"\uFF0B"}</b> Create a new posts
                </h4>
              </ListGroupItem>
            </LinkContainer>
    );
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p>CrearActiva</p>
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
