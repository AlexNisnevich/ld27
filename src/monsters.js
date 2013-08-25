var Monster = Class.ext({
	init: function(x, y) {
		this._x = x;
		this._y = y;
		this.draw();
	},

	at: function (x, y) {
		return this._x == x && this._y == y;
	},

	getSpeed: function() { return 1; },

	_isVisible: function () {
		return _(Game.visiblePoints).contains(this._x + "," + this._y);
	},

	_isEncountered: function () {
		return _(Game.exploredPoints).contains(this._x + "," + this._y);
	},

	_canMoveTo: function(x, y) {
		return Game.map[x+","+y]
			&& (Game.map[x+","+y] != 'door')
	},

	act: function() {
		if (this._isEncountered()) {
			var x = Game.player.getX();
			var y = Game.player.getY();

			var astar = new ROT.Path.AStar(x, y, this._canMoveTo, {topology:4});

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
				if (!_(Game.monsters).some(function (monster) {
					return monster._x == x && monster._y == y;
				})) {
					this._x = x;
					this._y = y;
					this.draw();
					Game._drawVisibleArea();
				}
			}
		}
	},

	draw: function() {
		if (this._isVisible() && !Game.player._blinded) {
			Game.display.draw(this._x, this._y, this._symbol, this._color, Game.calculateLighting(this._x, this._y));
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
		} else {
			player.draw();
		}
	},

	die: function() {
		Game.removeBeing(this);
	}
});

var Aardvark = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'a';
		this._color = 'red';

		this._name = 'aardvark'
		this._hp = 7;
		this._damage = '1d6';
		this._cr = 7;
	}
});

var Bunny = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'b';
		this._color = 'red';

		this._name = 'bunny'
		this._hp = 5;
		this._damage = '1d4';
		this._cr = 5;
	}
});

var Chicken = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'c';
		this._color = 'red';

		this._name = 'chicken'
		this._hp = 3;
		this._damage = '1d3';
		this._cr = 3;
	}
});

var Goblin = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'G';
		this._color = 'red';

		this._name = 'goblin'
		this._hp = 10;
		this._damage = '2d4';
		this._cr = 15;
	}
});

var Grue = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'G';
		this._color = 'red';

		this._name = 'grue'
		this._hp = 12;
		this._damage = '2d4';
		this._cr = 20;
	},
	act: function() {
		this._super();

		if (this._isEncountered() && !Game.player._blinded) {
			Game.log('You have encountered the grue.');
			Game.player._blinded = true;
		}
	},
	die: function() {
		this._super();
		Game.player._blinded = false;
	}
});

var Hobgoblin = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'H';
		this._color = 'red';

		this._name = 'hobgoblin'
		this._hp = 12;
		this._damage = '2d6';
		this._cr = 20;
	}
});

var Tree = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'T';
		this._color = 'red';

		this._name = 'tree'
		this._hp = 50;
		this._damage = '2d4';
		this._cr = 40;
	},
	getSpeed: function() { return 1/3; }
});
