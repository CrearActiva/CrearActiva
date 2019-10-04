import React, { Component } from "react";
import "./Homepage.css";
import { API } from "aws-amplify";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";


export default class Homepage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      feeds: []
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
      const feeds = await this.feeds();
      this.setState({ feeds });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  feeds() {
    return API.get("posts", "/posts");
  }


  renderFeedsList(posts) {
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
        <h1>Crear Activa</h1>
        <p>Government citizen communication app</p>
      </div>
    );
  }

  renderFeeds() {
    return (
      <div className="feeds">
        <PageHeader>News Feeds</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderFeedsList(this.state.feeds)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderFeeds() : this.renderLander()}
      </div>
    );
  }
}
