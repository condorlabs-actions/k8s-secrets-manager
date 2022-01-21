/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 598:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(257);
const awsHelper = __nccwpck_require__(907);
const YAML = __nccwpck_require__(517);
const fs = __nccwpck_require__(147);

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
          name: config.output_secret_name,
          ...(outputSecretNamespace ? { namespace: outputSecretNamespace } : {}),
        },
        type: 'Opaque',
        stringData: secretFromAWS,
      };
      
      const helmPolicy = core.getInput('output_helm_policy');
      if(helmPolicy){
        secretFormat.metadata.annotations = {
          "helm.sh/resource-policy": helmPolicy,
        };
      }

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


/***/ }),

/***/ 907:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const AWS = __nccwpck_require__(885);

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


/***/ }),

/***/ 257:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 885:
/***/ ((module) => {

module.exports = eval("require")("aws-sdk");


/***/ }),

/***/ 517:
/***/ ((module) => {

module.exports = eval("require")("json-to-pretty-yaml");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(598);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;