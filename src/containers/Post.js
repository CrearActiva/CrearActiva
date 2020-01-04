import { TextareaAutosize } from "react-autosize-textarea";
import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel, ListGroup, ListGroupItem, Image } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./Post.css";
import { s3Upload } from "../libs/awsLib";
import { LinkContainer } from "react-router-bootstrap";

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
      console.log(this.props);
      console.log(this.props.userName);
      await this.createComment({
        content: this.state.new_comment,
        pathParameters: {
          commentId: String(Date.now()),
          postId: this.state.postId,
          userId: this.props.userName
        },
        requestContext: {
          identity: {
            cognitoIdentityId: this.props.userName
          }
        }
      });
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

  // handler when click on delete a single comment
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

  savePost(content_val,attachment_val) {
    console.log(this.state.postId);
    return API.put("posts", `/posts/${this.state.postId}`, {
      body: {
        pathParameters: {
          feedId: this.state.feedId,
          postId: this.state.postId
        },
        attachment: attachment_val,
        content: content_val,
        requestContext: {
          identity: {
            cognitoIdentityId: this.props.userName
          }
        }
      }
    })
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
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
      let rtval = await this.savePost(this.state.content,attachment);

      console.log(rtval);
      this.props.history.push(`/posts/${this.state.postId}`);
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  renderPostId(){
    return (
      <div className="Post">
      <LinkContainer
        key={"back2" + this.state.feedId}
        to={{
            pathname: `/feeds/${this.state.feedId}`,
            state: {
              feedId: this.state.feedId,
              postId: this.state.postId
             }
         }}
      >
      <LoaderButton
        style={{float: 'left'}}
        variant="danger"
        type="submit"
        text="Back"
        id="back2feed" 
      />

      </LinkContainer>
      <h1>{this.state.postId}</h1>
      <FormGroup>
        <FormControl.Static>
          <Image
            src={this.state.attachmentURL}
            responsive
          />
        </FormControl.Static>
      </FormGroup>
      {this.props.adminIsAuthenticated && this.state.post &&
        <form onSubmit={this.handleUpdatePost}>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={this.state.content}
              componentClass="textarea"
            />
          </FormGroup>
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
        </form>}
    </div>
    )
  }

  renderCommentsList(comments) {
    let tmp_comments = [{}].concat(comments).sort((comment_a, comment_b) => comment_a.timestamp - comment_b.timestamp);
    return tmp_comments.map(
      (comment, i) =>
          i !== 0
          ?   <ListGroupItem header={comment.content.trim().split("\n")[0]}>
                {"Created by " + comment.userId + " at " + new Date(comment.timestamp).toLocaleString() + " "}
                <LoaderButton
                  style={{float: 'right'}}
                  variant="danger"
                  type="submit"
                  text="Delete"
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
    return (
      <div className="Post">
        {this.props.isAuthenticated && this.renderPostId()}
        <h3>Comments</h3>
        {this.props.isAuthenticated && this.renderComments()}
      </div>
    );
  }

}
