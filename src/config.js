export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    REGION: "us-east-1",
    BUCKET: "crear-activa-pictures"
  },
  apiGateway: {
    REGION: "us-east-1",
    URL: "https://s3zlrdow02.execute-api.us-east-1.amazonaws.com/dev"
  },

  //Account
  cognito: {
        REGION: "us-east-1",
        USER_POOL_ID: "us-east-1_nOHKitkP7",
        APP_CLIENT_ID: "3lcge58kbvgrgph0or784rqn4f",
        IDENTITY_POOL_ID: "us-east-1:ecae9c09-5b41-4042-b3fc-8f39b974df0b" 
  }
  // //cognito identity pool for users
  // cognito: {
  //   REGION: "us-east-1",
  //   USER_POOL_ID: "us-east-1_ZKez8OEYq",
  //   APP_CLIENT_ID: "2krdrbcl578er168qe337c5uga",
  //   IDENTITY_POOL_ID: "us-east-1:ecae9c09-5b41-4042-b3fc-8f39b974df0b"
  // },
  //cognito identity pool for admins
  // cognito_admin:{
  //   REGION: "us-east-1",
  //   USER_POOL_ID: "us-east-1_z1FRLNUFA",
  //   APP_CLIENT_ID: "7uf71mjh7n1adtqvq0hnj9g850",
  //   IDENTITY_POOL_ID: "us-east-1:4b0b79fc-3cd8-4989-8c5b-fbce3a1e740d"
  // }
};