var Controller = require('./controller.js');
var UI = require('ui');
var ajax = require('ajax');

var URL_ROOT = 'http://192.168.0.143:5000';

var taskList;
var controller;
var menu, splash;

function updateMenu() {
	menu.items(0, controller.menuItems());
}

function onStatsLoaded(stats) {
	controller.secondsLogged = stats;
	updateMenu();
}

function loadStats() {
	var request = {
		url: URL_ROOT + '/thisweek',
		type: 'json',
	};

	ajax(request, onStatsLoaded, function(error) {
		console.log('/thisweek failed: ' + error);
	});
}

function logAction(action, project) {
	var request = {
		url: URL_ROOT + '/log',
		method: 'post',
		type: 'json',
		data: {
			action: action,
			project: project,
			time: Date.now()
		}
	};

	ajax(request, onStatsLoaded, function(error) {
		console.log('/log failed: ' + error);
	});
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
	loadStats();
}
