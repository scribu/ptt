// String formatting utility
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}

exports.minutesToTime = function(minNum) {
	var hours, minutes;

	if (minNum === undefined) {
		hours = minutes = 0;
	} else {
		hours = Math.floor(minNum / 60);
		minutes = minNum % 60;
	}

	var str = '{0}h'.format(hours);

	if (minutes) {
		str+= ' {0}m'.format(minutes);
	}

	return str;
}
