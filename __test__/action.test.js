process.env.NODE_ENV = 'test';
const core = require('@actions/core');
const awsHelper = require('../src/aws-helpers');
const YAML = require('json-to-pretty-yaml');
const fs = require('fs');
const action = require('../');
const sinon = require('sinon');
const { expect } = require('chai');

const NO_VALID_JSON = '{{"name": abc}';
const ERROR_BAD_JSON = 'Invalid JSON String on eks_secrets_configs.';
const ERROR_EMPTY_JSON = 'No config provided.';
const VALID_JSON = '[{ "secret_name": "test/kuntur/bot", "output_secret_name": "name-secret-eks" }]';
const VALID_RESPONSE_FROM_SECRETS = {
  foo: 'bar',
  bar: 'foo',
};

const FINAL_OUTPUT_ACTION = {
  apiVersion: 'v1',
  kind: 'Secret',
  metadata: {
    name: 'name-secret-eks',
    namespace: 'namespace',
  },
  type: 'Opaque',
  stringData: VALID_RESPONSE_FROM_SECRETS,
};
describe('Running Action', () => {
  describe('When no valid JSON string is passed.', () => {
    beforeEach(() => {
      sinon.stub(core, 'getInput').returns(NO_VALID_JSON);
      sinon.stub(core, 'setFailed').returns();
    });
    it('should call to setFailed function to stop the action', async () => {
      action.run();
      expect(core.setFailed.calledOnce).to.equal(true);
      expect(core.setFailed.calledWith(ERROR_BAD_JSON)).to.equal(true);
    });
    afterEach(() => {
      core.getInput.restore();
      core.setFailed.restore();
    });
  });
  describe('When an empty JSON string is passed', () => {
    beforeEach(() => {
      sinon.stub(core, 'getInput').returns('[]');
      sinon.stub(core, 'setFailed').returns();
    });
    it('should call to setFailed function to stop the action', async () => {
      action.run();
      expect(core.setFailed.calledOnce).to.equal(true);
      expect(core.setFailed.calledWith(ERROR_EMPTY_JSON)).to.equal(true);
    });
    afterEach(() => {
      core.getInput.restore();
      core.setFailed.restore();
    });
  });

  describe('When a valid JSON string was passed and Secrets manager fails getting info', () => {
    beforeEach(() => {
      sinon
        .stub(core, 'getInput')
        .onCall(0)
        .returns(VALID_JSON)
        .onCall(1)
        .returns('namespace')
        .onCall(2)
        .returns('aws-access-key')
        .onCall(3)
        .returns('aws-eks-secret-key');

      sinon.stub(core, 'setFailed').returns();
      sinon.stub(awsHelper, 'getSecretsCredentialsFrom').rejects(Error('Invalid params'));
    });
    it('should call to setFailed function to stop the action', async () => {
      await action.run();
      expect(core.setFailed.calledOnce).to.equal(true);
    });
    afterEach(() => {
      core.getInput.restore();
      core.setFailed.restore();
      awsHelper.getSecretsCredentialsFrom.restore();
    });
  });

  describe('When Secrets returns a valid json', () => {
    beforeEach(() => {
      sinon
        .stub(core, 'getInput')
        .onCall(0)
        .returns(VALID_JSON)
        .onCall(1)
        .returns('namespace')
        .onCall(2)
        .returns('aws-access-key')
        .onCall(3)
        .returns('aws-eks-secret-key')
        .onCall(4)
        .returns('yaml');
      sinon.stub(awsHelper, 'getSecretsCredentialsFrom').resolves(VALID_RESPONSE_FROM_SECRETS);
      sinon.stub(core, 'setOutput').returns();
      sinon.stub(fs, 'writeFileSync').returns();
      sinon.stub(core, 'setFailed').returns();
    });
    it('should call to set output and create the file', async () => {
      await action.run();
      expect(core.getInput.called).to.equal(true);
      expect(core.setFailed.called).to.equal(false);
      expect(awsHelper.getSecretsCredentialsFrom.calledOnce).to.equal(true);
      expect(fs.writeFileSync.calledOnce).to.equal(true);
      expect(core.setOutput.calledOnce).to.equal(true);
      expect(core.setOutput.calledWith('final_string', YAML.stringify(FINAL_OUTPUT_ACTION)));
    });
    afterEach(() => {
      core.getInput.restore();
      core.setFailed.restore();
      awsHelper.getSecretsCredentialsFrom.restore();
    });
  });
});
