Game._populateLevel = function(freeCells) {
	if (this.mode == 'story') {
		if (this.levelNum == 1) {
			this._createMonsters(Aardvark, freeCells, 1, 3);
			this._createMonsters(Bunny, freeCells, 5, 10);
			this._createMonsters(Chicken, freeCells, 5, 10);
		} else if (this.levelNum == 2) {
			this._createMonsters(Aardvark, freeCells, 3, 5);
			this._createMonsters(Bunny, freeCells, 5, 10);
			this._createMonsters(Chicken, freeCells, 3, 8);
			this._createMonsters(Goblin, freeCells, 1, 1, 0.3);
		} else if (this.levelNum == 3) {
			this._createMonsters(Aardvark, freeCells, 5, 10);
			this._createMonsters(Bunny, freeCells, 5, 10);
			this._createMonsters(Chicken, freeCells, 2, 4);
			this._createMonsters(Goblin, freeCells, 1, 2);
			this._createMonsters(Grue, freeCells, 1, 1, 0.5);
		} else if (this.levelNum == 4) {
			this._createMonsters(Aardvark, freeCells, 5, 10);
			this._createMonsters(Bunny, freeCells, 3, 5);
			this._createMonsters(Goblin, freeCells, 5, 10);
			this._createMonsters(Hobgoblin, freeCells, 1, 2, 0.5);
			this._createMonsters(Tree, freeCells, 1, 2, 0.5);
			this._createMonsters(Grue, freeCells, 1, 1, 0.5);
		} else if (this.levelNum == 5) {
			this._createMonsters(Aardvark, freeCells, 2, 4);
			this._createMonsters(Goblin, freeCells, 5, 10);
			this._createMonsters(Hobgoblin, freeCells, 3, 5);
			this._createMonsters(Tree, freeCells, 3, 5);
			this._createMonsters(Grue, freeCells, 1, 1, 0.5);
		} else if (this.levelNum == 6) {
			this._createMonsters(Aardvark, freeCells, 2, 4);
			this._createMonsters(Goblin, freeCells, 5, 10);
			this._createMonsters(Hobgoblin, freeCells, 3, 5);
			this._createMonsters(Tree, freeCells, 3, 5);
			this._createMonsters(DragonHatchling, freeCells, 2, 5);
			this._createMonsters(Grue, freeCells, 1, 1);
		}  else if (this.levelNum == 7) {
			this._createMonsters(Aardvark, freeCells, 2, 4);
			this._createMonsters(Goblin, freeCells, 5, 10);
			this._createMonsters(Hobgoblin, freeCells, 3, 5);
			this._createMonsters(Tree, freeCells, 3, 5);
			this._createMonsters(DragonHatchling, freeCells, 3, 5);
			this._createMonsters(Dragon, freeCells, 1, 1);
		}
	} else {
		// infinite mode

		var crFloor = this.levelNum  * 75;
		var targetCR = _.random(crFloor, 2 * crFloor);

		var possibleMonsters = _([Aardvark, Bunny, Chicken, Goblin, Grue, Hobgoblin, Tree, DragonHatchling, Dragon, Potato, GoblinArcher, Jalapeno, MightyRedwood, Rat, Horse, Zebra, Unicorn, Squirrel]).filter(function (monster) {
			return (monster._cr > crFloor * 0.005 && monster._cr < crFloor * 0.2);
		});

		var currentCR = 0;
		while (currentCR < targetCR) {
			var monster = possibleMonsters[_.random(0, possibleMonsters.length - 1)];
			this._createMonsters(monster, freeCells, 1, 1);
			currentCR += monster._cr;
		}
	}
}
