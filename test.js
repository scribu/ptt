var assert = require('assert');

describe('minutesToTime', function() {
	var minutesToTime = require('./src/utils.js').minutesToTime;

	it('should format time', function() {
		assert.equal('0h', minutesToTime(undefined));
		assert.equal('0h', minutesToTime(0));
		assert.equal('1h', minutesToTime(60));
		assert.equal('1h 5m', minutesToTime(65));
		assert.equal('2h 35m', minutesToTime(155));
	});
});

describe('Controller', function() {
	var Controller = require('./src/controller.js');

	var controller = new Controller(['reading', 'writing']);

	it('should show current status', function() {
		assert.equal('Loading...', controller.menuItemText('writing'));
		assert.equal('Loading...', controller.menuItemText('reading'));

		controller.minutesLogged = {};
		controller.selectedTask = 'writing';

		assert.equal('Tracking...', controller.menuItemText('writing'));
		assert.equal('0h this week.', controller.menuItemText('reading'));

		controller.minutesLogged = {};
		controller.switchTask('reading');

		assert.equal('0h this week.', controller.menuItemText('writing'));
		assert.equal('Tracking...', controller.menuItemText('reading'));
	});
});
