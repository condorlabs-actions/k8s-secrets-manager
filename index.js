const core = require('@actions/core');
const awsHelper = require('./src/aws-helpers');
const YAML = require('json-to-pretty-yaml');
const fs = require('fs');

const run = async () => {
  const secretCollections = [];
  try {
    let AwsSecretsConfigs;
    try {
      const configJSONString = core.getInput('eks_secrets_configs');
      AwsSecretsConfigs = JSON.parse(configJSONString);
    } catch (error) {
      return core.setFailed('Invalid JSON String on eks_secrets_configs.');
    }

    if (!AwsSecretsConfigs.length) {
      return core.setFailed('No config provided.');
    }

    const outputSecretNamespace = core.getInput('output_secret_namespace');
    for (const config of AwsSecretsConfigs) {
      // eslint-disable-next-line
      const secretFromAWS = await awsHelper.getSecretsCredentialsFrom(config.secret_name, {
        accessKeyId: core.getInput('AWS_EKS_ACCESS_KEY'),
        secretAccessKey: core.getInput('AWS_EKS_SECRET_KEY'),
      });

      const secretFormat = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          annotations: {
            "helm.sh/resource-policy": core.getInput('output_helm_policy'),
          },
          name: config.output_secret_name,
          ...(outputSecretNamespace ? { namespace: outputSecretNamespace } : {}),
        },
        type: 'Opaque',
        stringData: secretFromAWS,
      };

      const outputType = core.getInput('output_type');
      let secretFinalOutput = null;
      if (outputType === 'yaml') {
        secretFinalOutput = YAML.stringify(secretFormat);
      } else {
        secretFinalOutput = JSON.stringify(secretFormat);
      }

      secretCollections.push(secretFinalOutput);
    }

    const finalFile = secretCollections.join('\n---\n');
    core.setOutput('final_string', finalFile);
    fs.writeFileSync(core.getInput('output_file_name'), finalFile);
  } catch (error) {
    core.setFailed(error.message);
  }
};

if (process.env.NODE_ENV !== 'test') {
  run();
}

module.exports.run = run;
