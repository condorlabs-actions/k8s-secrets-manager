const AWS = require('aws-sdk');

module.exports.getSecretsCredentialsFrom = async (secretName, { accessKeyId, secretAccessKey }) => {
  if (!secretName) {
    throw Error('Missing secret name.');
  }

  const SecretManagerClient = new AWS.SecretsManager({
    region: 'us-east-1',
    accessKeyId,
    secretAccessKey,
  });

  let secretJSON;
  const SecretResult = await SecretManagerClient.getSecretValue({ SecretId: secretName }).promise();

  if ('SecretString' in SecretResult) {
    secretJSON = JSON.parse(SecretResult.SecretString);
  } else {
    const buff = new Buffer(SecretResult.SecretBinary, 'base64');
    secretJSON = JSON.parse(buff.toString('ascii'));
  }
  return secretJSON;
};
