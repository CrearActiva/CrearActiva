import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { PageHeader, FormGroup, FormControl, ControlLabel, ListGroup, ListGroupItem, Button } from "react-bootstrap";
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
          userId: this.props.username
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
  
  handlePostDelete = async event => {
    event.preventDefault();

    console.log("Trying to delete a single post and all sub comments!!!");
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

  // handler when click on delete a single comment
  handleCommentDelete = (comment) => async event => {
    event.preventDefault();

    console.log(event);
    console.log("Trying to delete a single comment!!!");
    const confirmed = window.confirm(
      "Are you sure you want to delete thist single comment?"
    )

    console.log(confirmed);
    if (!confirmed) {
      return;
    }
    
    console.log(comment);

    try {
      await this.deleteComment(comment);
    } catch(e) {
      alert(e);
    }
  }

  deleteComment(comment) {
    console.log(comment);
    // console.log(`/comments/${comment.postId}`);
    let rtval = API.del("posts", `/comments/${comment.commentId}`, {
      queryStringParameters: {
        commentId: comment.commentId,
        postId: comment.postId
      }
    });
    console.log(rtval);
    return;
  }

  renderPostId(postId){
    return (
      <div>
        <h1>{postId}</h1>
      </div>
    )
  }
  renderPostContent(content) {
    return (
      <div className="Content">
        {content}
      </div>
    );
  }

  renderCommentsList(comments) {
    let tmp_comments = [{}].concat(comments).sort((comment_a, comment_b) => comment_a.timestamp - comment_b.timestamp);
    
    return tmp_comments.map(
      (comment, i) =>
          i !== 0
          ?   <ListGroupItem header={comment.content.trim().split("\n")[0]}>
                {/* display who and when created the comment */}
                {"Created by " + comment.userId + " at " + new Date(comment.timestamp).toLocaleString()}
                <LoaderButton 
                  block
                  bsSize="large"
                  type="submit"   
                  text="Delete"   
                  variant="outline-light" 
                  onClick={this.handleCommentDelete(comment)}
                  id="commentDelete"
                />
              </ListGroupItem>

          : <LinkContainer
          key="new"
          to={{
            pathname: "/feed/new",
            state: {feedId: this.myInit.queryStringParameters.feedId}
          }}    //use this nested json to pass params
        >
          <ListGroupItem> 
            <h4>
              <b>{"\uFF0B"}</b> Create a new comment
            </h4>
          </ListGroupItem>
        </LinkContainer>
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
    console.log(this.props);
    return (
      <div className="Post">
        {this.props.isAuthenticated && this.renderPostId(this.state.postId)}
        {this.props.isAuthenticated && this.renderPostContent(this.state.content)}
        {this.props.isAuthenticated && this.renderComments()}
      </div>
    );
  }

}
