var Player = function(x, y) {
	this._x = x;
	this._y = y;
	this._startX = x;
	this._startY = y;

	this._symbol = '@';
	this._color = '#3f0';

	this._maxHP = 10;
	this._hp = this._maxHP;
	this._damage = '1d6';

	this.draw();
}

Player.prototype.getSpeed = function() { return 100; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }
Player.prototype.at = function (x, y) { return this._x == x && this._y == y; }

Player.prototype.act = function() {
	Game.engine.lock();
	window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
	var code = e.keyCode;

	// pausing or paused?
	if (code == ROT.VK_P) {
		Game.pause();
	} else if (Game.paused) {
		return;
	}

	var keyMap = {};
	keyMap[38] = 0;
	keyMap[33] = 1;
	keyMap[39] = 2;
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;

	/* one of numpad directions? */
	if (!(code in keyMap)) { return; }

	/* is there a free space? */
	var dir = ROT.DIRS[8][keyMap[code]];
	var newX = this._x + dir[0];
	var newY = this._y + dir[1];
	var newKey = newX + "," + newY;
	if (!(newKey in Game.map)) { return; }

	// attacking a monster?
	for (var i = 0; i < Game.monsters.length; i++) {
		var monster = Game.monsters[i];
		if (monster.at(newX, newY)) {
			this._attack(monster);
			return;
		}
	}

	// stepping on an interesting tile?
	switch (Game.map[newKey]) {
		case 'door':
			Game.map[newKey] = 'doorOpened';
			Game.sounds.door.play();
			break;
		case 'stairs':
			Game.nextLevel();
			this.endTurn();
			Game.sounds.stairs.play();
			return;
	}

	Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);

	this._x = newX;
	this._y = newY;
	this.draw();

	Game._drawVisibleArea();

	this.endTurn();
}

Player.prototype.endTurn = function() {
	window.removeEventListener("keydown", this);
	Game.engine.unlock();
}

Player.prototype.draw = function() {
	Game.display.draw(this._x, this._y, this._symbol, this._color);

	$('#hp').text(this._hp + '/' + this._maxHP + ' HP');
	$('#damage').text('Damage: ' + this._damage);
}

Player.prototype.die = function () {
	Game.map[this._x+","+this._y] = 'corpse';
	Game.sounds.dead.play();

	this._x = this._startX;
	this._y = this._startY;
	this._hp = this._maxHP;

	this.draw();
	Game._drawVisibleArea();
}

Player.prototype._attack = function (monster) {
	var damage = Game.dieRoll(this._damage);
	monster._hp -= damage;
	Game.log('You deal ' + damage + ' damage to the ' + monster._name + '.');
	Game.sounds.hit.play();
	if (monster._hp <= 0) {
		Game.removeBeing(monster);
	}
	this.endTurn();
}
