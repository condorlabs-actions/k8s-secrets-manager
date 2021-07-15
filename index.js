const core = require('@actions/core');
const github = require('@actions/github');
const awsHelper = require('./src/aws-helpers')
const YAML = require('json-to-pretty-yaml');

// const fs = require('fs');
// const json = require('input.json');
 
// const data = YAML.stringify(json);
// fs.writeFile('output.yaml', data);

const run = async ()=>{
  let secretCollections = []
  try {
    let AwsSecretsConfigs; 
    try {
      AwsSecretsConfigs = JSON.parse(core.getInput("eks_secrets_configs")); 
      console.log(JSON.stringify(AwsSecretsConfigs))
    } catch (error) {
      return core.setFailed('Invalid JSON String on eks_secrets_configs.')
    }

    if(!AwsSecretsConfigs.length) return core.setFailed('No config provided.');

    const outputSecretNamespace = core.getInput('output_secret_namespace')
    for (const config of AwsSecretsConfigs) {
       // Connect with AWS 
      const secretFromAWS = await awsHelper.getSecretsCredentialsFrom(config.secret_name, {
        accessKeyId: core.getInput('AWS_EKS_ACCESS_KEY'),
        secretAccessKey: core.getInput('AWS_EKS_SECRET_KEY')
      });
      const secretFormat = {
        apiVersion: 'v1',
        kind: 'Secret', 
        metadata: {
          name: config.output_secret_name,
          ...(outputSecretNamespace ? {namespace: outputSecretNamespace} : {} )
        },
        type: 'Opaque',
        stringData: secretFromAWS
      }

      const outputType = core.getInput('output_type'); 
      let secretFinalOutput = null; 
      if(outputType === 'yaml'){
        secretFinalOutput = YAML.stringify(secretFormat);
      }else{
        secretFinalOutput = JSON.stringify(secretFormat);
      }
      
      secretCollections.push(secretFinalOutput)
    }
  
    
  
    // // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput('who-to-greet');
    // console.log(`Hello ${nameToGreet}!`);
    // const time = (new Date()).toTimeString();
    // core.setOutput("time", time);
    // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(github.context.payload, undefined, 2)
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
