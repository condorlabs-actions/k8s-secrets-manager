require('dotenv').config({ path: './.envMock' });
const chai = require('chai');
const expect = chai.expect;

global.chai = chai;
global.expect = expect;
