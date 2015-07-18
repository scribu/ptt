var utils = require('./utils.js');

function now() {
	return Date.now() / 1000;
}

function Controller(getOption, logAction) {
	this.getOption = getOption;
	this.logAction = logAction;
	this.secondsLogged = null;

	this.selectedTask = null;
	this.startedOn = null;
}

Controller.prototype = {
	hasTasks: function() {
		var tasks = this.getOption('tasks');
		return tasks && tasks.length;
	},

	switchTask: function(task) {
		if (this.selectedTask === task) {
			this.selectedTask = null;
			this.startedOn = null;
			this.logAction('stop', task, now());
		} else {
			this.selectedTask = task;
			this.startedOn = now();
			this.logAction('start', task, this.startedOn);
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
		if (this.selectedTask === task) {
			var elapsed = now() - this.startedOn;

			return 'Tracking... (' + utils.secondsToTime(elapsed) + ')';
		} else if (!this.secondsLogged) {
			return 'Loading...';
		} else {
			var seconds = this.secondsLogged[task];

			return utils.secondsToTime(seconds) + ' this week.';
		}
	},
}

module.exports = Controller;
