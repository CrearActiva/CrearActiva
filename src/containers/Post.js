import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { PageHeader, FormGroup, FormControl, ControlLabel, ListGroup, ListGroupItem } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Post.css";
import { thisTypeAnnotation } from "@babel/types";

export default class Notes extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
        isLoading: null,
        isDeleting: null,
        postId: "",
        feedId: "",
        content: "",
        attachmentURL: null,
        comments: [],
        new_comment: ""
      };

      this.myInit = {
        queryStringParameters: {
          feedId: "",
          postId: ""
        }
      }
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      //set all the GET params done
      this.setState({ isLoading: true });

      //set myInit
      this.myInit.queryStringParameters.feedId = this.props.history.location.state.feedId;
      this.myInit.queryStringParameters.postId = this.props.match.params.id;

      let attachmentURL = null;
      
      // get the single post
      let post = await this.getPost();
      post = JSON.parse(post.body)[0];
      const attachment = post.attachment;

      // set all the states of the single post
      if (attachment) {
        attachmentURL = await Storage.vault.get(attachment);
      }
      // this.state.content = post.content;
      // this.state.attachmentURL = attachmentURL;
      this.setState({
        content: post.content,
        attachmentURL: attachmentURL,
        feedId: this.props.history.location.state.feedId,
        postId: this.props.match.params.id
      });

    } catch (e) {
      alert(e);
    }

    try {
      this.setState({ isLoading: true });
      //get all the comments
      let comments = await this.getComments();
      comments = JSON.parse(comments.body);
      this.setState({ comments: comments });
      // console.log(this.state.comments);
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  getPost() {
    return API.get("posts", `/posts/${this.props.match.params.id}`, this.myInit);
  }

  getComments() {
    return API.get("posts", "/comments", { 
      queryStringParameters: {
          postId: this.state.postId
      }})
  }

  createComment(comment) {
    return API.post("posts", "/comments", {
      body: comment
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      let rtval = await this.createComment({
        content: this.state.new_comment,
        pathParameters: {
          commentId: String(Date.now()),
          postId: this.state.postId,
        },
        requestContext: {
          identity: {
            cognitoIdentityId: "USER-SUB-1234-exit1"
          }
        }
      });

      console.log(this.props.history);
      this.props.history.goBack();

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }
  
  handleDelete = async event => {
    event.preventDefault();

    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    this.setState({ isDeleting: true });
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  renderPostContent(content) {
    return (
      <div className="Content">
        <h1>{content}</h1>
      </div>
    );
  }

  renderCommentsList(comments) {
    let tmp_comments = [{}].concat(comments).sort((comment_a, comment_b) => comment_a.timestamp - comment_b.timestamp);
    
    return tmp_comments.map(
      (comment, i) =>
          i !== 0
          ?   <ListGroupItem header={comment.content.trim().split("\n")[0]}>
                {"Created: " + new Date(comment.timestamp).toLocaleString()}
              </ListGroupItem>
          : null
    );
  }

  renderComments() {
    return (
      <div className="Comments">
        <ListGroup>
          {!this.state.isLoading && this.renderCommentsList(this.state.comments)}
        </ListGroup>
        <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="new_comment">
            <FormControl
              onChange={this.handleChange}
              value={this.state.new_comment}
              componentClass="textarea"
              placeholder="Please leave your comment here."
            />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Create"
            loadingText="Creating…"
          />
        </form>
      </div>
    )
  }

  render() {
    return (
      <div className="Post">
        {this.props.isAuthenticated && this.renderPostContent(this.state.content)}
        {this.props.isAuthenticated && this.renderComments()}
      </div>
    );
  }

}
