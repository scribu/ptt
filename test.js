var chai = require('chai');
chai.config.includeStack = true;
var assert = chai.assert;

var RSVP = require('./src/rsvp.js');

describe('secondsToTime', function() {
	var secondsToTime = require('./src/utils.js').secondsToTime;

	it('should format time', function() {
		assert.equal('0h', secondsToTime(undefined));
		assert.equal('0h', secondsToTime(0));
		assert.equal('1h', secondsToTime(3600));
		assert.equal('1h 5m', secondsToTime(3600 + 5*60));
		assert.equal('2h 32m', secondsToTime(2*3600 + 32*60));
		assert.equal('2h 32m', secondsToTime(2*3600 + 32*60 + 3));
	});
});

describe('Controller', function() {
	// mock
	var _options = {};
	function getOption(key) {
		return _options[key];
	}

	var response;
	function request(method, endpoint, payload) {
		return response.promise;
	}

	beforeEach(function() {
		response = RSVP.defer();
	});

	var Controller = require('./src/controller.js');

	_options.tasks = ['reading', 'writing'];
	var controller = new Controller(getOption, request);

	it('should show loading status', function() {
		assert.equal('Loading...', controller.getStatus('writing'));
		assert.equal('Loading...', controller.getStatus('reading'));
	});

	it('should show tracking status', function() {
		controller.isLoading = false;
		controller.secondsLogged = {'writing': 5 * 60};

		controller.switchTask('reading');

		assert.equal('Week: 0h 5m', controller.getStatus('writing'));
		assert.equal('Week: 0h', controller.getStatus('reading'));
	});

	it('should show elapsed time', function() {
		controller.startedOn = Date.now()/1000 - 3600;

		assert.equal('Week: 1h', controller.getStatus('reading'));
	});

	it('should handle the tracking transition', function() {
		controller.switchTask('reading');

		assert.isTrue(controller.savingTracking('reading'));

		assert.equal('Week: 1h', controller.getStatus('reading'));

		response.resolve({
			this_week: {
				reading: 3600 + 5*60,
			}
		});
	});

	it('should handle the tracking transition 2', function() {
		assert.isFalse(controller.savingTracking('reading'));

		assert.equal('Week: 1h 5m', controller.getStatus('reading'));
	});

	it('should show errors', function() {
		controller.switchTask('reading');

		response.reject(['<html>Internal server error', 500]);
	});

	it('should show errors 2', function() {
		assert.equal('[Syncing error]', controller.getStatus('reading'));
	});
});
