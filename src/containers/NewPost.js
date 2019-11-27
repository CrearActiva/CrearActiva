import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config";
import "./NewPost.css";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";


export default class newpost extends Component {
  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: null,
      postId: "",
      content: "",
      feedId: ""
    };
  }

  validateForm() {
    return this.state.content.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleFileChange = event => {
    this.file = event.target.files[0];
  }

  handleSubmit = async event => {
    event.preventDefault();

    if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
      alert(`Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE/1000000} MB.`);
      return;
    }

    this.setState({ isLoading: true});
    
    try {
      const attachment = this.file
        ? await s3Upload(this.file)
        : null;

      //test
      await this.createPost({
        content: this.state.content,
        attachment,
        pathParameters: {
          feedId: this.state.feedId,   //fix it later, needed to pass a para here!    //fixed
          postId: this.state.postId   //typed in by user    //fixed
        }
      });

      this.props.history.push('/homepage/');   
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }


  createPost(post) {
    return API.post("posts", "/posts", {
      body: post
    });
  }


  render() {
    // console.log(this.props.history.location.state.feedId);
    this.state.feedId = this.props.history.location.state.feedId;
    console.log(this.state.feedId);

    return (
      <div className="newpost">
        <form onSubmit={this.handleSubmit}>
        <FormGroup controlId="postId">
            <FormControl
              onChange={this.handleChange}
              value={this.state.postId}
              componentClass="textarea"
              placeholder="Please type in yout post ID."
            />
          </FormGroup>
          <FormGroup controlId="content">
            <FormControl
              onChange={this.handleChange}
              value={this.state.content}
              componentClass="textarea"
              placeholder="Please type in your content."
            />
          </FormGroup>
          <FormGroup controlId="file">
            <ControlLabel>Attachment</ControlLabel>
            <FormControl onChange={this.handleFileChange} type="file" />
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
    );
  }
}
