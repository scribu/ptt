var UI = require('ui');
var Vector2 = require('vector2');
var utils = require('./utils.js');

var WINDOW_HEIGHT = 168;
var WINDOW_WIDTH = 144;

var TITLE_HEIGHT = 18;
var ITEM_INNER_PADDING = 3;
var SUBTITLE_HEIGHT = 14;

var ITEM_HEIGHT = TITLE_HEIGHT + ITEM_INNER_PADDING + SUBTITLE_HEIGHT + 5;

var CIRCLE_RADIUS = 5;

var SUBTITLE_POS_X = CIRCLE_RADIUS * 3;
var SUBTITLE_WIDTH = WINDOW_WIDTH - SUBTITLE_POS_X;

var BACKGROUND_COLOR = 'green';
var FOREGROUND_COLOR = 'black';
var INVERTED_BACKGROUND_COLOR = 'black';
var INVERTED_FOREGROUND_COLOR = 'white';

function Item(task, vertPos) {
	this.task = task;
	this.elems = {};

	this.elems.box = new UI.Rect({
		position: new Vector2(0, vertPos),
		size: new Vector2(WINDOW_WIDTH, ITEM_HEIGHT)
	});

	this.elems.title = new UI.Text({
		text: task,
		font: 'gothic-18-bold',
		textOverflow: 'ellipsis',
		position: new Vector2(0, vertPos),
		size: new Vector2(WINDOW_WIDTH, TITLE_HEIGHT)
	});

	var subtitlePosY = vertPos + TITLE_HEIGHT + ITEM_INNER_PADDING;

	this.elems.subtitle = new UI.Text({
		font: 'gothic-14',
		textOverflow: 'ellipsis',
		position: new Vector2(SUBTITLE_POS_X, subtitlePosY),
		size: new Vector2(SUBTITLE_WIDTH, SUBTITLE_HEIGHT)
	});

	var circCenter = new Vector2(CIRCLE_RADIUS, subtitlePosY + SUBTITLE_HEIGHT - CIRCLE_RADIUS);

	this.elems.outerCircle = new UI.Circle({
		position: circCenter,
		radius: CIRCLE_RADIUS,
	});

	this.elems.innerCircle = new UI.Circle({
		position: circCenter,
		radius: CIRCLE_RADIUS - 2,
	});
}

Item.prototype = {
	addTo: function(screen) {
		var that = this;

		utils.mapObj(this.elems, function(key, elem) {
			screen.add(elem);
		});
	},

	remove: function() {
		utils.mapObj(this.elems, function(key, elem) {
			elem.remove();
		});
	},

	scroll: function(amount) {
		utils.mapObj(this.elems, function(key, elem) {
			var position = elem.position();

			var newPosition = new UI.Vector2(position.x, position.y + amount);

			elem.animate('position', newPosition);
		});
	},

	update: function(status, selected, tracking) {
		this.elems.subtitle.text(status);

		console.log(utils.format('{} status: {} {}', this.task, selected, tracking));

		var boxColor = selected ? INVERTED_BACKGROUND_COLOR : BACKGROUND_COLOR;
		var textColor = selected ? INVERTED_FOREGROUND_COLOR : FOREGROUND_COLOR;

		this.elems.title.color(textColor);
		this.elems.subtitle.color(textColor);

		this.elems.outerCircle.backgroundColor(textColor);

		var innerCircleColor = tracking ? textColor : boxColor;
		this.elems.innerCircle.backgroundColor(innerCircleColor);

		this.elems.box.backgroundColor(boxColor);
	},
};


function ItemList(controller, screen) {
	this.controller = controller;

	this.items = [];
	this.cursorIndex = 0;

	this.screen = screen;
	this.initBackground();
}

ItemList.prototype = {

	indexFromTask: function(task) {
		for (var i=0; i<this.items.length; i++) {
			if (this.items[i].task === task) {
				return i;
			}
		}

		return -1;
	},

	initBackground: function() {
		this.background = new UI.Rect({
			backgroundColor: BACKGROUND_COLOR,
			size: new Vector2(WINDOW_WIDTH, WINDOW_HEIGHT)
		});

		this.screen.add(this.background);
	},

	createItem: function(task, i) {
		var vertPos = i*ITEM_HEIGHT;

		var item = new Item(task, vertPos);

		this.updateItem(item, i);

		item.addTo(this.screen);

		return item;
	},

	updateItem: function(item, i) {
		item.update(
			this.controller.getStatus(item.task),
			this.cursorIndex === i,
			this.controller.isTracking(item.task)
		);
	},

	updateIndex: function(i) {
		this.updateItem(this.items[i], i);
	},

	clear: function() {
		this.items.forEach(function(item) {
			item.remove();
		});

		this.items = null;
	},

	populate: function() {
		this.items = this.controller.tasks().map(this.createItem.bind(this));
	},

	repopulate: function() {
		this.clear();
		this.cursorIndex = 0;
		this.populate();
	},

	update: function() {
		this.items.forEach(this.updateItem.bind(this));
	},

	changeHighlight: function(indexAdd) {
		var oldIndex = this.cursorIndex;
		this.cursorIndex += indexAdd;

		this.updateIndex(oldIndex);
		this.updateIndex(this.cursorIndex);		
	},

	scroll: function(amount) {
		this.items.forEach(function(item) {
			item.scroll(amount);
		});
	},

	onUpDown: function(amount, indexAdd) {
		this.changeHighlight(indexAdd);
		this.scroll(amount);
	},

	onClickUp: function(e) {
		console.log('clicked up');

		if (this.cursorIndex === 0) {
			return;
		}

		this.onUpDown(ITEM_HEIGHT, -1);
	},

	onClickDown: function(e) {
		console.log('clicked down');

		if (this.cursorIndex === this.items.length-1) {
			return;
		}

		this.onUpDown(-ITEM_HEIGHT, +1);
	},

	onSelect: function(e) {
		var task = this.items[this.cursorIndex].task;

		console.log('Selected ' + task);

		var oldTask = this.controller.switchTask(task);

		if (oldTask) {
			var oldIndex = this.indexFromTask(oldTask);
			if (oldIndex > -1) {
				this.updateIndex(oldIndex);
			}
		}

		this.updateIndex(this.cursorIndex);
	},
};


exports.ItemList = ItemList;
