// Reference for this page
//https://branchv34--serverless-stack.netlify.com/chapters/call-the-list-api.html
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
      const feedval = await this.getfeeds();
      console.log("load feed");
      this.setState({ feeds: feedval });
      console.log(feedval.body);
      console.log(this.feeds);
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  getfeeds() {
    return API.get("posts", "/feeds");
  }


  renderFeedsList(feeds) {
    console.log("Feeds"+feeds);
    return [{}].concat(feeds).map(
      (feed, i) =>
        i !== 0
          ? <LinkContainer
              key={feed.feedId}
              to={`/feeds/${feed.feedId}`}
            >
              <ListGroupItem header={feed.feedId}>
                {"Created: " + (feed.feedId)}
              </ListGroupItem>
            </LinkContainer>
          : <LinkContainer
              key="new"
              to="/feeds/new"
            >
              <ListGroupItem>
                <h4>
                  <b>{"\uFF0B"}</b> Create a new feed
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
