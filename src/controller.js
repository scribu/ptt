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
				'icon': that.menuItemIcon(task),
			};
		});
	},

	menuItemIcon: function(task) {
		if (this.selectedTask === task) {
			return 'images/record.png';
		} else {
			return null;
		}
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
		} else if (!this.secondsLogged) {
			return 'Loading...';
		} else {
			var seconds = this.secondsLogged[task] || 0;

			if (this.selectedTask === task) {
				var elapsed = now() - (this.startedOn || 0);
				seconds += elapsed;
			}

			return 'Week: ' + utils.secondsToTime(seconds);
		}
	},
}

module.exports = Controller;
