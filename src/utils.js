exports.secondsToTime = function(seconds) {
	var hours, minutes;

	if (seconds === undefined) {
		hours = minutes = 0;
	} else {
		hours = Math.floor(seconds / 3600);
		minutes = Math.floor((seconds % 3600) / 60);
	}

	var str = hours + 'h';

	if (minutes) {
		str+= ' ' + minutes + 'm';
	}

	return str;
}
