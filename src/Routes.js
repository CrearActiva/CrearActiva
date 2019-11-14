import React from "react";
import { Route, Switch } from "react-router-dom";
import Welcome from "./containers/Welcome";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import AppliedRoute from "./components/AppliedRoute";
import Signup from "./containers/Signup";
import NewPost from "./containers/NewPost";
import Homepage from "./containers/Homepage";
import Post from "./containers/Post";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";
import ListFeed from "./containers/ListFeed";
import NewFeed from "./containers/NewFeed";

//The "switch" to change to specific pages. The "path" string given by the function call
//Determines where the target script is:
//Reference Page: https://serverless-stack.com/chapters/create-containers.html

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Welcome} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={Login} props={childProps} />
    <UnauthenticatedRoute path="/signup" exact component={Signup} props={childProps} />
    <AuthenticatedRoute path="/posts/new" exact component={NewPost} props={childProps} />
    <AuthenticatedRoute path="/feeds/new" exact component={NewFeed} props={childProps} />

    <AuthenticatedRoute path="/homepage" exact component={Homepage} props={childProps} />
    <AuthenticatedRoute path="/posts/:id" exact component={Post} props={childProps} />
    <AuthenticatedRoute path="/feeds/:id" exact component={ListFeed} props={childProps} />

    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;


