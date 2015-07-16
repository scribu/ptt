var Controller = require('./controller.js');
var UI = require('ui');

// TODO: fetch from settings
var taskList = ['Work', 'PTT', 'Reading'];

var controller = new Controller(taskList);
var menu, splash;

var URL_ROOT = 'http://192.168.0.143:5000';

var ajax = require('ajax');

function updateMenu() {
	menu.items(0, controller.menuItems());
}

function onMenuSelect(e) {
	console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
	console.log('The item is titled "' + e.item.title + '"');

	controller.switchTask(e.item.title);
	updateMenu();
}

function onDataLoaded(data) {
	controller.minutesLogged = data;
	updateMenu();
}

function loadData() {
	ajax(
		{ url: URL_ROOT + '/thisweek', type:'json' },
		onDataLoaded,
		function(error) {
			console.log('/thisweek failed: ' + error);
		}
	);
}

if (!taskList) {
	splash = new UI.Card({
		title: 'TT - No tasks',
		subtitle: 'To start tracking, add some tasks from the settings.'
	});

	splash.show();
} else {
	menu = new UI.Menu({
		sections: [{
			title: 'TT',
			items: controller.menuItems(),
		}]
	});

	menu.on('select', onMenuSelect);

	menu.show();
	loadData();
}
