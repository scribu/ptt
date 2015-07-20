var Settings = require('settings');
var UI = require('ui');
var ajax = require('ajax');
var Accel = require('ui/accel');

var Controller = require('./controller.js');
var ItemList = require('./item-list.js').ItemList;
var format = require('./utils.js').format;

function getOption(key) {
	return Settings.option(key);
}

var controller = new Controller(getOption, trackAction);
var itemList = new ItemList(controller);
var splashCard, errorCard;

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

		onError(error, statusCode, request);
	});
}

function updateUI() {
	if (!controller.hasTasks()) {
		splashCard.show();

		itemList.screen.hide();
	} else {
		splashCard.hide();

		itemList.repopulate();
		itemList.screen.show();
	}
}

function onStateLoaded(stats) {
	controller.secondsLogged = stats.this_week;

	if (stats.last_started) {
		controller.trackingTask = stats.last_started.task;
		controller.startedOn = stats.last_started.started;
	}

	itemList.update();
	itemList.screen.show();
}

function initErrorCard() {
	errorCard = new UI.Card({
		title: 'TT - Error',
	});

	errorCard.on('accelTap', function(e) {
		errorCard.hide();
		itemList.screen.show();

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

		itemList.screen.hide();
		errorCard.show();
	});
}

function trackAction(action, project, time) {
	var payload = {
		task: project,
		time: time
	};

	delete controller.errors[project];

	request('post', '/' + action, payload, onStateLoaded, function(error, statusCode) {
		controller.errors[project] = [error, statusCode];

		itemList.update();
		itemList.screen.show();
	});
}

Accel.init();

splashCard = new UI.Card({
	title: 'TT - No tasks',
	subtitle: 'Define some tasks in the settings screen.'
});

updateUI();
loadState();
