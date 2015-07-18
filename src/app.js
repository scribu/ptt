var Settings = require('settings');
var Controller = require('./controller.js');
var UI = require('ui');
var ajax = require('ajax');
var Accel = require('ui/accel');

var BACKEND_URL = 'http://192.168.0.143:5000';

function debug(obj) {
	Object.keys(obj).forEach(function(key) {
		console.log(key + ': ' + JSON.stringify(obj[key]));
	});
}

var controller = new Controller(Settings.option('tasks'), logAction);
var menu, splashCard, errorCard;

function onSettingsOpen(e) {
	var options = Settings.option();
	return e.url + '?options=' + encodeURIComponent(JSON.stringify(options));
}

function onSettingsUpdated(e) {
	if (e.failed) {
		console.log('Configuration error: ' + e.response);
		return;
	}

	var newAuthKey = e.options.auth_key;
	if (newAuthKey) {
		Settings.data('auth_key', newAuthKey);
	}

	delete e.options.auth_key;
	Settings.option(e.options);

	controller.tasks = e.options.tasks;

	updateUI();
}

Settings.config(
	{url: 'http://scribu.github.io/ptt/', autoSave: false},
	onSettingsOpen,
	onSettingsUpdated
);

function request(method, endpoint, data, onSuccess, onError) {
	if (typeof data === 'function') {
		onError = onSuccess;
		onSuccess = data;
		data = null;
	}

	var options = {
		url: BACKEND_URL + endpoint,
		headers: {'X-Auth-Key': Settings.data('auth_key')},
		method: method,
		type: 'json',
		data: data
	};

	ajax(options, onSuccess, function(error) {
		console.log(endpoint + ' failed: ' + JSON.stringify(error));

		if (onError) {
			onError(error);
		}
	});
}

function updateMenu() {
	menu.items(0, controller.menuItems());
}

function updateUI() {
	if (!controller.hasTasks()) {
		splashCard.show();

		menu.hide();
	} else {
		splashCard.hide();

		updateMenu();
		menu.show();
	}
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

		loadState();
	});
}

function loadState() {
	request('get', '/init', onStateLoaded, function(error) {
		if (!errorCard) {
			initErrorCard();
		}

		if (error.error === 'unauthorized') {
			errorCard.subtitle('Authorization error.');
		} else {
			errorCard.subtitle('Server error.\nShake to retry.');
		}

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

function initUI() {
	splashCard = new UI.Card({
		title: 'TT - No tasks',
		subtitle: 'Define some tasks in the settings screen.'
	});

	menu = new UI.Menu({
		sections: [{
			title: 'TT',
		}]
	});

	menu.on('select', onMenuSelect);
}

initUI();
updateUI();
loadState();
