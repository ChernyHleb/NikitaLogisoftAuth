<h2>Testing Auth API using Postman:</h2>

<ol>
  <h4><li>Login request</li></h4>
  New access and refresh tokens for specified user are created, refresh token stored in user table
  <br>
  <img src="./info/login.png" width="600">
  <br>
  MySQL Database:
  <br>
  <img src="./info/loginDB.png" width="400">
  
  
  <h4><li>Token request</li></h4>
  New access token created using refresh token
  <br>
  <img src="./info/token.png" width="600">
  
  <h4><li>Logout request</li></h4>
  Refresh token will be deleted, so it wont be used to update access token
  <img src="./info/logout.png" width="600">
  <br>
  The token is also deleted from DB:
  <br>
  <img src="./info/logoutDB.png" width="400">
  <br>
  Creating new access tokens using deleted refresh token is forbidden:
  <br>
  <img src="./info/logoutTryToken.png" width="600">
  <br>
  
</ol>
