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
      let feedval = await this.getfeeds();
      feedval = JSON.parse(feedval.body);
      this.setState({ feeds: feedval });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  getfeeds() {
    return API.get("posts", "/feeds");
  }


  renderFeedsList(feeds) {
    // console.log(feeds);
    return [{}].concat(feeds).map(
      (feed, i) =>
        i !== 0
          ? <LinkContainer
              key={feed}
              to={`/feeds/${feed}`}
            >
              <ListGroupItem header={feed.feedId}>
                {feed.description}
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
