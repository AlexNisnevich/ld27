Game.calculateDamage = function (attack) {
	function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var parts = attack.split('d');
	var numDice = parts[0];
	var sizeOfDice = parts[1];

	var result = 0;
	_(numDice).times(function () {
		result += getRandomInt(1, sizeOfDice);
	});

	return result;
}
