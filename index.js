const core = require('@actions/core');
const github = require('@actions/github');
const awsHelper = require('./src/aws-helpers')
const YAML = require('json-to-pretty-yaml');

// const fs = require('fs');
// const json = require('input.json');
 
// const data = YAML.stringify(json);
// fs.writeFile('output.yaml', data);

const run = async ()=>{
  try {
    // Connect with AWS 
    const secretFromAWS = await awsHelper.getSecretsCredentialsFrom(core.getInput('aws_secrets_name'), {
      accessKeyId: core.getInput('AWS_EKS_ACCESS_KEY'),
      secretAccessKey: core.getInput('AWS_EKS_SECRET_KEY')
    });
  
    const outputSecretName = core.getInput('output_secret_name')
    const outputSecretNamespace = core.getInput('output_secret_namespace')
  
    const secretFormat = {
      apiVersion: 'v1',
      kind: 'Secret', 
      metadata: {
        name: outputSecretName,
        ...(outputSecretNamespace ? {namespace: outputSecretNamespace} : {} )
      },
      type: 'Opaque',
      stringData: secretFromAWS
    }
    
    const outputType = core.getInput('output_type'); 
    if(outputType === 'yaml'){
      console.log(YAML.stringify(secretFormat))
    }else{
      console.log(JSON.stringify(secretFormat))
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
