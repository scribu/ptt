var RSVP = require('./rsvp.js');
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

var controller = new Controller(getOption, request);
var itemList;
var splashCard, errorCard;

function initItemList() {
	var screen = new UI.Window();
	itemList = new ItemList(controller, screen);

	screen.on('click', 'up', itemList.onClickUp.bind(itemList));
	screen.on('click', 'down', itemList.onClickDown.bind(itemList));
	screen.on('click', 'select', itemList.onSelect.bind(itemList));

	screen.on('accelTap', loadState);
}

function initSplashCard() {
	splashCard = new UI.Card({
		title: 'TT - No tasks',
		subtitle: 'Define some tasks in the settings screen.'
	});
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

function request(method, endpoint, data) {
	var options = {
		url: Settings.option('backend_url') + endpoint,
		headers: {'X-Auth-Key': Settings.data('auth_key')},
		method: method,
		type: 'json',
		data: data
	};

	return new RSVP.Promise(function(resolve, reject) {
		ajax(options, resolve, function(error, statusCode, request) {
			console.log(format('{} {} failed with status code {}: {}',
				method.toUpperCase(),
				options.url,
				statusCode,
				request.responseText
			));

			reject([error, statusCode, request]);
		});
	});
}

function onStateErrored(args) {
	var error = args[0];
	var statusCode = args[1];

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
}

function loadState() {
	request('get', '/init')
		.then(controller.onStateLoaded.bind(controller))
		.catch(onStateErrored)
		.finally(function() {
			controller.isLoading = false;
			itemList.update();
		});

	controller.isLoading = true;
	itemList.update();
}

Accel.init();

initItemList();
initSplashCard();
updateUI();
loadState();
