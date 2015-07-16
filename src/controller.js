var secondsToTime = require('./utils.js').secondsToTime;

function Controller(taskList, logAction) {
	this.tasks = taskList;
	this.logAction = logAction;
	this.secondsLogged = null;
	this.selectedTask = null;
}

Controller.prototype = {
	switchTask: function(task) {
		if (this.selectedTask === task) {
			this.selectedTask = null;
			this.logAction('stop', task);
		} else {
			this.selectedTask = task;
			this.logAction('start', task);
		}
	},

	menuItems: function() {
		var that = this;
		return this.tasks.map(function(task) {
			return {
				'title': task,
				'subtitle': that.menuItemText(task),
			};
		});
	},

	menuItemText: function(task) {
		if (this.selectedTask === task) {
			// TODO: show time since tracking started
			return 'Tracking...';
		} else if (!this.secondsLogged) {
			return 'Loading...';
		} else {
			var seconds = this.secondsLogged[task];

			return secondsToTime(seconds) + ' this week.';
		}
	},
}

module.exports = Controller;
