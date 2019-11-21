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
            feedId: 'testFeed'
        }
    };

  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      console.log(this.props.match.params.id);
      const posts = await this.getPosts();
      console.log(posts);
      this.setState({ posts });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  getPosts() {
    return API.get("posts", "posts/testPost5");
  }


  renderPostsList(posts) {
    // console.log(posts);
    return [{}].concat(posts).map(
      (post, i) =>
        i !== 0
          ? <LinkContainer
              key={post.postId}
              to={`/posts/${post.postId}`}
            >
              <ListGroupItem header={post.content.trim().split("\n")[0]}>
                {"Created: " + new Date(post.createdAt).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to="/posts/new"
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> Create a new post
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
