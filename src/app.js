var Settings = require('settings');
var Controller = require('./controller.js');
var UI = require('ui');
var ajax = require('ajax');
var Accel = require('ui/accel');

var URL_ROOT = 'http://192.168.0.143:5000';

function debug(obj) {
	Object.keys(obj).forEach(function(key) {
		console.log(key + ': ' + JSON.stringify(obj[key]));
	});
}

function settingsURL() {
	var options = Settings.option();
	return URL_ROOT + '/settings?options=' + encodeURIComponent(JSON.stringify(options));
}

Settings.config(
	{ url: settingsURL() },
	function open(e) {
		console.log('opening configurable: ' + e.url);
	},
	function close(e) {
		console.log('closed configurable');

		// Show the parsed response
		console.log(JSON.stringify(e.options));

		// Show the raw response if parsing failed
		if (e.failed) {
			console.log(e.response);
		}
	}
);

var taskList = Settings.option('tasks') || [];
var controller;
var menu, splashCard, errorCard;

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
		console.log(endpoint + ' failed: ' + error);

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
		controller.startedOn = stats.last_started.started;
	}

	updateMenu();
}

function initErrorCard() {
	errorCard = new UI.Card({
		title: 'TT - Error',
	});

	Accel.init();

	// Accel.on('tap', function(e) {
	errorCard.on('accelTap', function(e) {
		console.log('Tap event on axis: ' + e.axis + ' and direction: ' + e.direction);

		errorCard.hide();
		menu.show();

		init();
	});
}

function init() {
	request('get', '/init', onStateLoaded, function(error) {
		if (!errorCard) {
			initErrorCard();
		}

		errorCard.subtitle('Server error.\nShake to retry.');

		menu.hide();
		errorCard.show();
	});
}

function logAction(action, project, time) {
	var payload = {
		project: project,
		time: time
	};

	request('post', '/' + action, payload, onStateLoaded);
}

function onMenuSelect(e) {
	console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
	console.log('The item is titled "' + e.item.title + '"');

	controller.switchTask(e.item.title);
	updateMenu();
}

if (!taskList.length) {
	splashCard = new UI.Card({
		title: 'TT - No tasks',
		subtitle: 'Define some tasks in the settings screen.'
	});

	splashCard.show();
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
