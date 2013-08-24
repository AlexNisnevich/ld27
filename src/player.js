var Player = function(x, y) {
	this._x = x;
	this._y = y;
	this._startX = x;
	this._startY = y;
	this._symbol = '@';
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
	if (code == 13 || code == 32) {
		this._checkBox();
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

	Game.display.draw(this._x, this._y, Game.map[this._x+","+this._y]);

	this._x = newX;
	this._y = newY;
	this.draw();

	Game._drawVisibleArea();

	//window.removeEventListener("keydown", this);
	//Game.engine.unlock();
}

Player.prototype.draw = function() {
	Game.display.draw(this._x, this._y, this._symbol, "#ff0");
}

Player.prototype.die = function () {
	Game.map[this._x+","+this._y] = 'x';

	this._x = this._startX;
	this._y = this._startY;

	this.draw();
	Game._drawVisibleArea();
}
