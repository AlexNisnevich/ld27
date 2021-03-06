var Player = function(x, y) {
	this._startX = x;
	this._startY = y;

	this._symbol = '@';
	this._color = '#3f0';
}

Player.prototype.setCharacter = function (character) {
	player = this;

	this._x = this._startX;
	this._y = this._startY;

	player._name = character.name;
	player._sprite = character.sprite;
	player._lvl = character.level;
	player._maxHP = character.hp;
	player._hp = player._maxHP;
	player._damage = character.damage;
	player._viewRadius = character.vision;
	player._speed = character.speed;

	player._exp = 0;
	player._expThreshold = Game.experienceForLevel(player._lvl + 1);

	player.draw();
}

Player.prototype.getSpeed = function() { return this._speed; }
Player.prototype.getX = function() { return this._x; }
Player.prototype.getY = function() { return this._y; }
Player.prototype.at = function (x, y) { return this._x == x && this._y == y; }

Player.prototype.act = function() {
	Game.engine.lock();
	window.addEventListener("keydown", this);
}

Player.prototype.handleEvent = function(e) {
	var code = e.keyCode;

	// pause / level selection
	if (code == ROT.VK_P) {
		Game.pause();
	} else if (Game.choosingCharacter) {
		if (code == ROT.VK_1) {
			$('#char1').click();
		} else if (code == ROT.VK_2) {
			$('#char2').click();
		} else if (code == ROT.VK_3) {
			$('#char3').click();
		} else {
			return;
		}
	} else if (Game.paused || Game.ended) {
		return;
	}

	/*
		7 8 9
		 \|/
		4-5-6
		 /|\
		1 2 3

		y k u
		 \|/
		h-.-l
		 /|\
		b j n
	*/

	var keyMap = {};
	keyMap[38] = 0;
	keyMap[33] = 1;
	keyMap[39] = 2;
	keyMap[34] = 3;
	keyMap[40] = 4;
	keyMap[35] = 5;
	keyMap[37] = 6;
	keyMap[36] = 7;
	keyMap[ROT.VK_K] = 0;
	keyMap[ROT.VK_U] = 1;
	keyMap[ROT.VK_L] = 2;
	keyMap[ROT.VK_N] = 3;
	keyMap[ROT.VK_J] = 4;
	keyMap[ROT.VK_B] = 5;
	keyMap[ROT.VK_H] = 6;
	keyMap[ROT.VK_Y] = 7;

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
		case 'fire':
			var damage = Game.dieRoll('1d6');
			this._hp -= damage;
			Game.log('The flame deals ' + damage + ' damage to you.')
			Game.sounds.hit.play();
			if (player._hp <= 0) {
				Game.log('You have been slain by the dragon.');
				this.die('slain by dragon');
			} else {
				this.draw();
			}
	}

	// sometimes recover health
	if (Math.random() < 0.2 && this._hp < this._maxHP) {
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


	$('#sidebar .sprite').html(this._sprite.big.html())
	$('#sidebar .name').text(this._name ? this._name : ' ');
	$('#sidebar .level').text('Level ' + this._lvl);
	$('#sidebar .hp').text(this._hp + '/' + this._maxHP + ' HP');
	$('#sidebar .xp').text(this._exp + '/' + this._expThreshold + ' XP');
	$('#sidebar .damage').text('Damage: ' + this._damage);
	$('#sidebar .speed').text('Speed: ' + this._speed);
	$('#sidebar .vision').text('Vision: ' + this._viewRadius);
	$('#sidebar .location').text('Location: ' + Game._mapName());
	$('.meter').show();
	$('.meter .xpBar').css({'width': Math.min(1, this._exp / this._expThreshold) * 100 + '%'});
}

Player.prototype.die = function (causeOfDeath) {
	this.draw();
	Game.map[this._x+","+this._y] = 'corpse';
	Game.sounds.dead.play();
	Game.fallenHeroes.push([this._name, causeOfDeath, this._sprite.small])

	Game.chooseCharacter(this._lvl);
}

Player.prototype._attack = function (monster) {
	var damage = Game.dieRoll(this._damage);
	monster._hp -= damage;
	Game.log('You deal ' + damage + ' damage to the ' + monster._name + '.');
	Game.sounds.hit.play();
	if (monster._hp <= 0) {
		Game.log('You have slain the ' + monster._name + '.');
		this._exp += monster._cr;
		while (this._exp >= this._expThreshold) {
			this._lvl++;
			this._exp -= Game.experienceForLevel(this._lvl);
			this._expThreshold = Game.experienceForLevel(this._lvl + 1);
			Game.sounds.pickup.play();
			Game.log('You have reached level ' + this._lvl + '!');
		}
		monster.die();
	}
	this.endTurn();
}
