var minutesToTime = require('./utils.js').minutesToTime;

function Controller(taskList, minutesLogged) {
	this.tasks = taskList;
	this.minutesLogged = minutesLogged;
	this.selectedTask = null;
	this.trackingStart = null;
}

Controller.prototype = {
	switchTask: function(task) {
		if (this.selectedTask === task) {
			this.selectedTask = null;
		} else {
			this.selectedTask = task;
			this.trackingStart = Date.now();
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
		} else {
			var minNum = this.minutesLogged[task];

			return minutesToTime(minNum) + ' this week.';
		}
	},
}

module.exports = Controller;
