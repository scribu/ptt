var utils = require('./utils.js');

function now() {
	return Date.now() / 1000;
}

function Controller(getOption, trackAction) {
	this.getOption = getOption;
	this.trackAction = trackAction;

	this.secondsLogged = null;

	this.trackingTask = null;
	this.startedOn = null;

	this.errors = {};
}

Controller.prototype = {
	tasks: function() {
		return this.getOption('tasks') || [];
	},

	hasTasks: function() {
		return this.tasks().length;
	},

	isTracking: function(task) {
		return this.trackingTask === task;
	},

	switchTask: function(task) {
		var oldTask = this.trackingTask;

		if (this.isTracking(task)) {
			this.trackingTask = null;
			this.startedOn = null;
			this.trackAction('stop', task, now());
		} else {
			this.trackingTask = task;
			this.startedOn = now();
			this.trackAction('start', task, this.startedOn);
		}

		return oldTask;
	},

	getStatus: function(task) {
		var errorArgs = this.errors[task];

		if (errorArgs) {
			var error = errorArgs[0];
			var statusCode = errorArgs[1];

			if (statusCode === 500) {
				return '[Syncing error]';
			} else {
				return JSON.stringify(error);
			}
		} else if (!this.secondsLogged) {
			return 'Loading...';
		} else {
			var seconds = this.secondsLogged[task] || 0;

			if (this.isTracking(task)) {
				var elapsed = now() - this.startedOn;
				seconds += elapsed;
			}

			return 'Week: ' + utils.secondsToTime(seconds);
		}
	},
}

module.exports = Controller;
