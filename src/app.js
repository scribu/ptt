// String formatting utility
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

var Controller = require('./controller.js');
var UI = require('ui');
var ajax = require('ajax');

var URL_ROOT = 'http://192.168.0.143:5000';

var taskList;
var controller;
var menu, splash;

function request(method, endpoint, data, onSuccess, onError) {
	if (typeof data === 'function') {
		onError = onSuccess;
		onSuccess = data;
		data = null;
	}

	var options = {
		url: URL_ROOT + endpoint,
		method: method,
		type: 'json',
		data: data
	};

	ajax(options, onSuccess, function(error) {
		console.log('/{} failed: {}'.format(endpoint, error));

		if (onError) {
			onError(error);
		}
	});
}

function updateMenu() {
	menu.items(0, controller.menuItems());
}

function onStateLoaded(stats) {
	controller.secondsLogged = stats.this_week;

	if (stats.last_started) {
		controller.selectedTask = stats.last_started.project;
	}

	updateMenu();
}

function init() {
	request('get', '/init', onStateLoaded);
}

function logAction(action, project) {
	var payload = {
		project: project,
		time: Date.now() / 1000
	};

	request('post', '/' + action, payload, onStateLoaded);
}

function onMenuSelect(e) {
	console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
	console.log('The item is titled "' + e.item.title + '"');

	controller.switchTask(e.item.title);
	updateMenu();
}

// TODO: fetch from settings
taskList = ['Work', 'PTT', 'Reading'];

if (!taskList) {
	splash = new UI.Card({
		title: 'TT - No tasks',
		subtitle: 'To start tracking, add some tasks from the settings.'
	});

	splash.show();
} else {
	controller = new Controller(taskList, logAction);

	menu = new UI.Menu({
		sections: [{
			title: 'TT',
			items: controller.menuItems(),
		}]
	});

	menu.on('select', onMenuSelect);

	menu.show();
	init();
}
