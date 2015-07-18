var Settings = require('settings');
var Controller = require('./controller.js');
var UI = require('ui');
var ajax = require('ajax');
var Accel = require('ui/accel');
var format = require('./utils.js').format;

function debug(obj) {
	Object.keys(obj).forEach(function(key) {
		console.log(key + ': ' + JSON.stringify(obj[key]));
	});
}

function getOption(key) {
	return Settings.option(key);
}

var controller = new Controller(getOption, logAction);
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
		url: Settings.option('backend_url') + endpoint,
		headers: {'X-Auth-Key': Settings.data('auth_key')},
		method: method,
		type: 'json',
		data: data
	};

	ajax(options, onSuccess, function(error, statusCode, request) {
		console.log(format('{} {} failed with status code {}: {}',
			method.toUpperCase(),
			options.url,
			statusCode,
			request.responseText
		));

		if (onError) {
			onError(error, statusCode, request);
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

	errorCard.on('accelTap', function(e) {
		errorCard.hide();
		menu.show();

		loadState();
	});
}

function loadState() {
	request('get', '/init', onStateLoaded, function(error, statusCode) {
		if (!errorCard) {
			initErrorCard();
		}

		if (statusCode === 0) {
			errorCard.subtitle('Incorrect backend URL.');
		} else if (error.error === 'unauthorized') {
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

	menu.on('accelTap', updateMenu);
}

Accel.init();

initUI();
updateUI();
loadState();
