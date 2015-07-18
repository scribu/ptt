var assert = require('assert');

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

	var Controller = require('./src/controller.js');

	_options.tasks = ['reading', 'writing'];
	var controller = new Controller(getOption, function(){});

	it('should show loading status', function() {
		assert.equal('Loading...', controller.menuItemText('writing'));
		assert.equal('Loading...', controller.menuItemText('reading'));
	});

	it('should show tracking status', function() {
		controller.secondsLogged = {'writing': 5 * 60};

		controller.switchTask('reading');

		assert.equal('0h 5m this week.', controller.menuItemText('writing'));
		assert.equal('Tracking...', controller.menuItemText('reading'));
	});

	it('should show elapsed time', function() {
		controller.startedOn = Date.now()/1000 - 3600;

		assert.equal('Tracking... (1h)', controller.menuItemText('reading'));
	});

	it('should show errors', function() {
		controller.errors['reading'] = ['<html>Internal server error', 500];

		assert.equal('[Syncing error]', controller.menuItemText('reading'));
	});
});
