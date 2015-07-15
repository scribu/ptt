// TODO: fetch from settings
var taskList = ['Work', 'PTT', 'Reading'];

// TODO: fetch via API
var minutesLogged = {
	'Work': 90,
	'PTT': 60
};

var Controller = require('./controller.js');

var menu, splash;
var controller = new Controller(taskList);

function onMenuSelect(e) {
	console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
	console.log('The item is titled "' + e.item.title + '"');

	controller.switchTask(e.item.title);

	menu.items(0, controller.menuItems());
}

var UI = require('ui');

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
}
