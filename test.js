var minutesToTime = require('./src/utils.js').minutesToTime;
var assert = require('assert');

assert.equal('0h', minutesToTime(undefined));
assert.equal('0h', minutesToTime(0));
assert.equal('1h', minutesToTime(60));
assert.equal('1h 5m', minutesToTime(65));
assert.equal('2h 35m', minutesToTime(155));

console.log('All good.');
