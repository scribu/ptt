var utils = require('./utils.js');

function now() {
	return Date.now() / 1000;
}

function Controller(getOption, request) {
	this.getOption = getOption;
	this.request = request;

	this.secondsLogged = null;

	this.trackingTask = null;
	this.startedOn = null;

	this.isLoading = true;
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

	savingTracking: function(task) {
		return this.savingTask === task;
	},

	onStateLoaded: function(stats) {
		this.secondsLogged = stats.this_week;

		if (stats.last_started) {
			this.trackingTask = stats.last_started.task;
			this.startedOn = stats.last_started.started;
		}
	},

	_log: function(action, task, time) {
		var promise = this.request('post', '/' + action, {
			task: task,
			time: time
		});

		return promise.then(this.onStateLoaded.bind(this));
	},

	_startTracking: function(task) {
		this.trackingTask = task;
		this.startedOn = now();
		return this._log('start', task, this.startedOn);
	},

	_stopTracking: function(task) {
		this.trackingTask = null;
		this.savingTask = task;

		var promise = this._log('stop', task, now());

		var self = this;

		promise.finally(function() {
			self.savingTask = null;
			self.startedOn = null;
		});

		return promise;
	},

	switchTask: function(task) {
		delete this.errors[task];

		var promise;

		if (this.isTracking(task)) {
			promise = this._stopTracking(task);
		} else {
			promise = this._startTracking(task);
		}

		var self = this;

		promise.catch(function(args) {
			self.errors[task] = args;
		});

		return promise;
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
		} else if (this.isLoading) {
			return 'Loading...';
		} else {
			var seconds = this.secondsLogged[task] || 0;

			if (this.isTracking(task) || this.savingTracking(task)) {
				var elapsed = now() - this.startedOn;
				seconds += elapsed;
			}

			return 'Week: ' + utils.secondsToTime(seconds);
		}
	},
}

module.exports = Controller;
