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
        comments: []
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

    console.log(this.props);
    try {
      //set all the GET params done
      // this.state.postId = this.props.match.params.id;
      // this.state.feedId = this.props.history.location.state.feedId;
      this.setState({ isLoading: true });

      //set myInit
      this.myInit.queryStringParameters.feedId = this.props.history.location.state.feedId;
      this.myInit.queryStringParameters.postId = this.props.match.params.id;

      let attachmentURL = null;
      
      // get the single post
      let post = await this.getPost();
      console.log("After fetch post.");
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
      // this.setState({ isLoading: true });
      //get all the comments
      console.log("Before getch comments");
      let comments = await this.getComments();
      console.log("After fetch comments");
      comments = JSON.parse(comments.body);
      console.log(comments);
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

  renderPostContent(content) {
    return (
      <div className="Content">
        <h1>{content}</h1>
      </div>
    );
  }

  renderCommentsList(comments) {
    console.log(comments[0]);
    let tmp_comments = [{}].concat(comments).sort((comment_a, comment_b) => comment_a.timestamp - comment_b.timestamp);
    
    console.log(tmp_comments);
    return tmp_comments.map(
      (comment, i) =>
          i !== 0
          ? <LinkContainer
              key={comment.commentId}
              to={{
                pathname: "/homepage",
                state: {
                  CommentId: comment.commentId
                }
              }}
            >
              <ListGroupItem header={comment.content.trim().split("\n")[0]}>
                {"Created: " + new Date(comment.timestamp).toLocaleString()}
              </ListGroupItem>
            </LinkContainer>
          : <h1>hello, No.0 comment.</h1>
    );
    // return (<h1>{ comments.commentId }</h1>);
    // return null;
  }

  renderComments() {
    return (
      <div className="Comments">
        <PageHeader>Comments</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderCommentsList(this.state.comments)}
        </ListGroup>
      </div>
    )
  }

  render() {
    console.log(this.state);
    return (
      <div className="Post">
        {this.props.isAuthenticated && this.renderPostContent(this.state.content)}
        {this.props.isAuthenticated && this.renderCommentsList(this.state.comments)}
      </div>
    );
  }

}
