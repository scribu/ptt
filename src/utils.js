function format() {
	var args = Array.prototype.slice.call(arguments);
	return args.shift().replace(/\{\}/g, function(){
		return args.shift();
	});
}
 
function secondsToTime(seconds) {
	var hours, minutes;

	if (seconds === undefined) {
		hours = minutes = 0;
	} else {
		hours = Math.floor(seconds / 3600);
		minutes = Math.floor((seconds % 3600) / 60);
	}

	var str = format('{}h', hours);

	if (minutes) {
		str+= format(' {}m', minutes);
	}

	return str;
}

exports.format = format;
exports.secondsToTime = secondsToTime;
