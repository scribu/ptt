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
	var Controller = require('./src/controller.js');

	var controller = new Controller(['reading', 'writing'], function(){});

	it('should show current status', function() {
		assert.equal('Loading...', controller.menuItemText('writing'));
		assert.equal('Loading...', controller.menuItemText('reading'));

		controller.secondsLogged = {};

		controller.selectedTask = 'writing';

		assert.equal('Tracking...', controller.menuItemText('writing'));
		assert.equal('0h this week.', controller.menuItemText('reading'));

		controller.secondsLogged = {'writing': 5 * 60};
		controller.switchTask('reading');

		assert.equal('0h 5m this week.', controller.menuItemText('writing'));
		assert.equal('Tracking...', controller.menuItemText('reading'));
	});
});
