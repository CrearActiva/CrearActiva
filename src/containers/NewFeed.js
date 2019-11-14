import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./NewFeed.css";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";

export default class NewFeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: null,
      feedId: "",
      discription: ""
    };
  }

  validateForm() {
    return this.state.feedId.length > 0 && this.state.discription.length > 0;
  }

  handleChange = event => {
    // console.log(event.target.id);
    this.setState({
      [event.target.id]: event.target.value   //return controlId(int)
    });
  }

  handleSubmit = async event=> {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.createFeed({
        FeedId: this.state.FeedId,
        discription: this.state.discription
      });
      this.props.history.push("/");   //what's this function
    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  createFeed(feed) {
    return API.post("feeds", "/feeds", {
      body: feed
    });
  }

  render() {
    return (
      <div className="NewFeed">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="feedId">
            <FormControl
              onChange={this.handleChange}
              value={this.state.feedId}
              placeholder="Please type in your feed ID"
              componentClass="textarea"
            />
          </FormGroup>
          <FormGroup controlId="discription">
            <ControlLabel>Discription</ControlLabel>
            <FormControl 
              onChange={this.handleChange}
              value={this.state.discription}
              placeholder="Please type in your discription"
              componentClass="textarea"
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
    );
  }
}
