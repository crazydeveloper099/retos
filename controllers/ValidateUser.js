//jshint esversion:6
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

const userPoolId="us-east-2_ZziRfzq2R";
const region="us-east-2";
const clientId="50ai330m6l388tuj2rk0linfd";


const poolData = {
   UserPoolId: userPoolId,
   ClientId: clientId
};
const pool_region = region;
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

const userData = {
    Username: 'username',
    Pool: userPool,
};

const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
cognitoUser.confirmRegistration('123456', true, function(err, result) {
    if (err) {
        alert(err.message || JSON.stringify(err));
        return;
    }
    console.log('call result: ' + result);
});
