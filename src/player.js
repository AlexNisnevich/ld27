var Player = function(x, y) {
	this._startX = x;
	this._startY = y;

	this._symbol = '@';
	this._color = '#3f0';
	this._lvl = 1;

	this.init();
	this.draw();
}

Player.prototype.init = function () {
	this._x = this._startX;
	this._y = this._startY;

	this.generateName();
	var stats = Game.generateCharacter(this._lvl);

	this._maxHP = stats.hp;
	this._hp = this._maxHP;
	this._damage = stats.damage;
	this._viewRadius = stats.viewRadius;

	this._exp = 0;
	this._expThreshold = Math.pow(2, this._lvl - 1) * 10;
}

Player.prototype.generateName = function() {
	player = this;
	player._name = null;

	if (!this._nextName) {
		Game.getRandomName(function (name) {
			player._name = name;
			player.draw();
		});
	} else {
		this._name = this._nextName;
		this._nextName = null;
	}

	setTimeout(function () {
		Game.getRandomName(function (name) {
			player._nextName = name;
		});
	}, 1500);
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

	// sometimes recover health
	if (Math.random() < 0.1 && this._hp < this._maxHP) {
		this._hp++;
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
	Game.display.draw(this._x, this._y, this._symbol, this._color, Game.calculateLighting(this._x, this._y));

	$('#name').text(this._name ? this._name : ' ');
	$('#level').text('Level ' + this._lvl);
	$('#hp').text(this._hp + '/' + this._maxHP + ' HP');
	$('#xp').text(this._exp + '/' + this._expThreshold + ' XP');
	$('#damage').text('Damage: ' + this._damage);
	$('#vision').text('Vision: ' + this._viewRadius);
}

Player.prototype.die = function () {
	Game.map[this._x+","+this._y] = 'corpse';
	Game.sounds.dead.play();

	this.init();
	this.draw();
	Game._drawVisibleArea();
}

Player.prototype._attack = function (monster) {
	var damage = Game.dieRoll(this._damage);
	monster._hp -= damage;
	Game.log('You deal ' + damage + ' damage to the ' + monster._name + '.');
	Game.sounds.hit.play();
	if (monster._hp <= 0) {
		Game.log('You have slain the ' + monster._name + '.');
		this._exp += monster._cr;
		if (this._exp >= this._expThreshold) {
			this._lvl++;
			this._exp = 0;
			this._expThreshold = Math.pow(2, this._lvl - 1) * 10;
			Game.sounds.pickup.play();
			Game.log('You have reached level ' + this._lvl + '!');
		}
		Game.removeBeing(monster);
	}
	this.endTurn();
}
