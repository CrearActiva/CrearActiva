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
      feedId: "",
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
      this.myInit.queryStringParameters.feedId = this.props.match.params.id;
      this.setState({feedId: this.props.match.params.id});
      let posts = await this.getPosts();
      posts = JSON.parse(posts.body);

      // console.log("hello in didmount");
      this.setState({ posts });
      // console.log("hello, after set posts state.");
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
    // console.log("hello, last setting state.");
  }

  getPosts() {
    return API.get("posts", "/posts", this.myInit);
  }

  renderPostsList(posts) {
    let tmp_posts = [{}].concat(posts).sort((post_a, post_b) => post_a.timestamp - post_b.timestamp);
    
    return tmp_posts.map(
      (post, i) =>
          i !== 0
          ? <LinkContainer
              key={post.postId}
              to={{
                  pathname: `/posts/${post.postId}`,
                  state: {
                    feedId: this.myInit.queryStringParameters.feedId,
                    postId: post.postId
                   }
               }}
            >
              <ListGroupItem header={post.postId.trim().split("\n")[0]}>
                {"Created: " + new Date(post.timestamp).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          : [<div>{this.props.adminIsAuthenticated ? <LinkContainer
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
            </LinkContainer>:<div></div>} </div>]
    );
  }

  renderLander() {
    return (
      <div className="Feedlander">
        <h1>Scratch</h1>
        <p>CrearActiva</p>
      </div>
    );
  }

  renderPosts() {
    return (
      <div className="posts">
        <PageHeader>{this.state.feedId}</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderPostsList(this.state.posts)}
        </ListGroup>
      </div>
    );
  }

  render() {
    // console.log(this.state);
    return (
      <div className="Listfeed">
        {this.props.isAuthenticated ? this.renderPosts() : this.renderLander()}
      </div>
    );
  }
}
