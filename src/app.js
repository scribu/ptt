/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');

var stats = {
	'Work': 5.5,
	'PTT': 1
};

function menuItems() {
	return Object.keys(stats).map(function (task) {
		return {
			'title': task,
			'subtitle': stats[task] + ' hours this week',
		};
	});  
}

var menu = new UI.Menu({
	sections: [{
		title: 'TT',
		items: menuItems(),
	}]
});

menu.on('select', function(e) {
	console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
	console.log('The item is titled "' + e.item.title + '"');
});

menu.show();
