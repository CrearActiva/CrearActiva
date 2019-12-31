import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { PageHeader, FormGroup, FormControl, ControlLabel, ListGroup, ListGroupItem, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Post.css";
import { thisTypeAnnotation } from "@babel/types";
import { s3Upload } from "../libs/awsLib";

export default class Notes extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
        isLoading: null,
        isDeleting: null,
        post: null,
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
        post: post,
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
            cognitoIdentityId: this.props.userName 
          }
        }
      });

      console.log(this.props.history);
      window.location.reload();
    } catch (e) {
      alert(e);
    }
    this.setState({ isLoading: false });
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }
  
  handlePostDelete = (postId) => async event => {
    event.preventDefault();
    console.log("Trying to delete a single post and all sub comments!!!");
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirmed) {
      return;
    }
    this.setState({ isDeleting: true });
    try {
      let rtval = await API.del("posts", `/posts/${postId}`, {
        body:{
          pathParameters: {
            feedId: this.state.feedId,
            postId: postId
          }
        }
      });
      console.log("return value");
      console.log(rtval);
      this.props.history.push(`/feeds/${this.state.feedId}`);
    } catch(e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
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
      "Are you sure you want to delete this single comment?"
    )
    if (!confirmed) {
      return;
    }
    this.setState({ isLoading: true });
    try {
      let rtval = await API.del("posts", `/comments/${comment.commentId}`, {
        body:{
          pathParameters: {
            commentId: comment.commentId,
            postId: comment.postId
          }
        }
      });
      console.log("return value");
      console.log(rtval);
    } catch(e) {
      alert(e);
    }
    this.setState({ isLoading: false });
  }

  deleteComment(comment) {
    console.log(comment);
    // console.log(`/comments/${comment.postId}`);
    return;
  }

  savePost(post) {
    console.log(this.state.postId);
    console.log(post);
    return API.put("posts", `/posts/${this.state.postId}`, {
      body: post,
      pathParameters: {
        feedId: this.state.feedId,
        postId: this.state.postId
      },
      requestContext: {
        identity: {
          cognitoIdentityId: this.props.userName 
        }
      }
    })
  }
  
  handleUpdatePost = async event => {
    let attachment = null;
    event.preventDefault();

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`);
      return;
    }

    this.setState({ isLoading: true });

    try {
      if (this.file) {
        attachment = await s3Upload(this.file);
      }


      let rtval = await this.savePost({
            content: this.state.content,
            attachment: attachment
      });

      console.log(rtval);
      this.props.history.push("/");
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  renderPostId(){
    console.log(this.state.post);
    return (
      <div className="Post">
      {this.props.adminIsAuthenticated && this.state.post &&
        <form onSubmit={this.handleUpdatePost}>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={this.state.content}
              componentClass="textarea"
            />
          </FormGroup>
          {this.state.post.attachment &&
            <FormGroup>
              <ControlLabel>Attachment</ControlLabel>
              <FormControl.Static>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={this.state.attachmentURL}
                >
                  {this.formatFilename(this.state.post.attachment)}
                </a>
              </FormControl.Static>
            </FormGroup>}
          <FormGroup controlId="file">
            {!this.state.post.attachment &&
              <ControlLabel>Attachment</ControlLabel>}
            <FormControl onChange={this.handleFileChange} type="file" />
          </FormGroup>
          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Save"
            loadingText="Saving…"
          />
          {/* <LoaderButton
            block
            bsStyle="danger"
            bsSize="large"
            isLoading={this.state.isDeleting}
            onClick={this.handleDelete}
            text="Delete"
            loadingText="Deleting…"
          /> */}
        </form>}
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
                {/* display the username of a single comment. */}
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
            text="Post comment"
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
        {this.props.isAuthenticated && this.renderPostId()}
        {this.props.isAuthenticated && this.renderPostContent(this.state.content)}
        <h3>Comments</h3>
        {this.props.isAuthenticated && this.renderComments()}
      </div>
    );
  }

}
