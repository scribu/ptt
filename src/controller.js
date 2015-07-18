var utils = require('./utils.js');

function now() {
	return Date.now() / 1000;
}

function Controller(getOption, trackAction) {
	this.getOption = getOption;
	this.trackAction = trackAction;

	this.secondsLogged = null;

	this.selectedTask = null;
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

	switchTask: function(task) {
		if (this.selectedTask === task) {
			this.selectedTask = null;
			this.startedOn = null;
			this.trackAction('stop', task, now());
		} else {
			this.selectedTask = task;
			this.startedOn = now();
			this.trackAction('start', task, this.startedOn);
		}
	},

	menuItems: function() {
		var that = this;
		return this.getOption('tasks').map(function(task) {
			return {
				'title': task,
				'subtitle': that.menuItemText(task),
			};
		});
	},

	menuItemText: function(task) {
		var errorArgs = this.errors[task];

		if (errorArgs) {
			var error = errorArgs[0];
			var statusCode = errorArgs[1];

			if (statusCode === 500) {
				return '[Syncing error]';
			} else {
				return JSON.stringify(error);
			}
		} else if (this.selectedTask === task) {
			var text = 'Tracking...';

			var elapsed = now() - this.startedOn;

			if (elapsed > 60) {
				text += ' (' + utils.secondsToTime(elapsed) + ')';
			}

			return text;
		} else if (!this.secondsLogged) {
			return 'Loading...';
		} else {
			var seconds = this.secondsLogged[task];

			return utils.secondsToTime(seconds) + ' this week.';
		}
	},
}

module.exports = Controller;
