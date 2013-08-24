var Monster = Class.ext({
	init: function(x, y) {
		this._x = x;
		this._y = y;
		this.draw();
	},

	at: function (x, y) {
		return this._x == x && this._y == y;
	},

	_isVisible: function () {
		return _(Game.visiblePoints).contains(this._x + "," + this._y);
	},

	_isEncountered: function () {
		return _(Game.exploredPoints).contains(this._x + "," + this._y);
	},

	act: function() {
		if (this._isEncountered()) {
			var x = Game.player.getX();
			var y = Game.player.getY();
			var passableCallback = function(x, y) {
			    return Game.map[x+","+y] && (Game.map[x+","+y] != 'door');
			}
			var astar = new ROT.Path.AStar(x, y, passableCallback, {topology:4});

			var path = [];
			var pathCallback = function(x, y) {
			    path.push([x, y]);
			}
			astar.compute(this._x, this._y, pathCallback);

			path.shift();
			if (path.length <= 1) {
				this._attack(Game.player);
			} else {
				x = path[0][0];
				y = path[0][1];
				this._x = x;
				this._y = y;
				this.draw();
				Game._drawVisibleArea();
			}
		}
	},

	draw: function() {
		if (this._isVisible()) {
			Game.display.draw(this._x, this._y, this._symbol, this._color, '#333');
		}
	},

	_attack: function(player) {
		var damage = Game.dieRoll(this._damage);
		player._hp -= damage;
		Game.log('The ' + this._name + ' deals ' + damage + ' damage to you.')
		Game.sounds.hit.play();
		if (player._hp <= 0) {
			Game.log('You have been slain by the ' + this._name + '.')
			player.die();
			Game._startCountdown();
		} else {
			player.draw();
		}
	}
});

var Aardvark = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'a';
		this._color = 'red';

		this._name = 'aardvark'
		this._hp = 5;
		this._damage = '1d4';
	}
});

var Bunny = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'b';
		this._color = 'red';

		this._name = 'bunny'
		this._hp = 3;
		this._damage = '1d3';
	}
});
