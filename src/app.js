var utils = require('./utils.js');

// TODO: fetch from settings
var taskList = ['Work', 'PTT', 'Reading'];

// TODO: fetch via API
var minutesLogged = {
	'Work': 90,
	'PTT': 60
};

var state = {
	selectedTask: null,
	trackingStart: null,
};

function menuItemText(task) {
	if (state.selectedTask === task) {
		// TODO: show time since tracking started
		return 'Tracking...';
	} else {
		var minNum = minutesLogged[task];

		return utils.minutesToTime(minNum) + ' this week.';
	}
}

function menuItem(task) {
	return {
		'title': task,
		'subtitle': menuItemText(task),
	};
}

function menuItems() {
	return taskList.map(menuItem);
}

var menu, splash;

function onMenuSelect(e) {
	console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
	console.log('The item is titled "' + e.item.title + '"');

	var task = e.item.title;

	if (state.selectedTask === task) {
		state.selectedTask = null;
	} else {
		state.selectedTask = task;
		state.trackingStart = Date.now();
	}

	menu.items(0, menuItems());
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
			items: menuItems(),
		}]
	});

	menu.on('select', onMenuSelect);

	menu.show();
}
