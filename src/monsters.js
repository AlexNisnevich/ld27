var Monster = Class.ext({
	init: function(x, y) {
		this._x = x;
		this._y = y;
		this._range = 1;
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

			if (path.length > 0 && path.length < 15) {
				path.shift();
				if (path.length <= this._range && this._isVisible) {
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
		}
	},

	draw: function() {
		if (this._isVisible() && !Game.player._blinded) {
			Game.display.draw(this._x, this._y, this._symbol, this._color, Game.calculateLighting(this._x, this._y));
		}
	},

	_attack: function(player, damage, attackName) {
		var damage = Game.dieRoll(damage ? damage : this._damage);
		player._hp -= damage;
		Game.log('The ' + (attackName ? attackName : this._name) + ' deals ' + damage + ' damage to you.')
		Game.sounds.hit.play();
		if (player._hp <= 0) {
			Game.log('You have been slain by the ' + this._name + '.');
			player.die('slain by ' + this._name);
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

		this._name = 'aardvark';
		this._hp = 7;
		this._damage = '1d6';
		this._cr = 7;
	}
});
Aardvark._cr = 7;

var Bunny = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'b';
		this._color = 'red';

		this._name = 'bunny';
		this._hp = 5;
		this._damage = '1d4';
		this._cr = 5;
	}
});
Bunny._cr = 5;

var Chicken = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'c';
		this._color = 'red';

		this._name = 'chicken';
		this._hp = 3;
		this._damage = '1d3';
		this._cr = 3;
	}
});
Chicken._cr = 3;

var Goblin = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'G';
		this._color = 'red';

		this._name = 'goblin';
		this._hp = 10;
		this._damage = '2d4';
		this._cr = 15;
	}
});
Goblin._cr = 15;

var Grue = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'G';
		this._color = 'gray';

		this._name = 'grue';
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
Grue._cr = 20;

var Hobgoblin = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'H';
		this._color = 'red';

		this._name = 'hobgoblin';
		this._hp = 12;
		this._damage = '2d6';
		this._cr = 20;
	}
});
Hobgoblin._cr = 20;

var Tree = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'T';
		this._color = 'red';

		this._name = 'tree';
		this._hp = 50;
		this._damage = '2d4';
		this._cr = 40;
	},
	getSpeed: function() { return 1/3; }
});
Tree._cr = 40;

var Dragon = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'D';
		this._color = 'red';

		this._name = 'dragon';
		this._hp = 50;
		this._mp = 10;
		this._damage = '2d6';
		this._cr = 200;
	},
	act: function() {
		var dragon = this;
		if (this._isVisible() && this._mp > 5 && (this._x == Game.player.getX() || this._y == Game.player.getY())) {
			Game.log('The dragon breathes fire.');
			Game.sounds.dragon.play();

			if (this._x == Game.player.getX() && this._y > Game.player.getY()) {
				var points = [this._x+","+(this._y-1), this._x+","+(this._y-2), this._x+","+(this._y-3)];
			} else if (this._x == Game.player.getX() && this._y < Game.player.getY()) {
				var points = [this._x+","+(this._y+1), this._x+","+(this._y+2), this._x+","+(this._y+3)];
			} else if (this._y == Game.player.getY() && this._x > Game.player.getX()) {
				var points = [(this._x-1)+","+this._y, (this._x-2)+","+this._y, (this._x-3)+","+this._y];
			} else if (this._y == Game.player.getY() && this._x < Game.player.getX()) {
				var points = [(this._x+1)+","+this._y, (this._x+2)+","+this._y, (this._x+3)+","+this._y];
			}

			_(points).each(function (key) {
				var pt = _.map(key.split(','), function (x) {return parseInt(x); });
				if (key in Game.map && _(['floor', 'doorOpened']).contains(Game.map[key])) {
					Game.map[key] = 'fire';
				}
				if (Game.player.at(pt[0], pt[1])) {
					dragon._attack(player, '1d6', 'flame');
				}
			});
			Game._drawVisibleArea();

			this._mp -= 5;
		} else {
			this._super();
		}

		if (this._mp < 10) {
			this._mp++;
		}
	},
	die: function() {
		this._super();

		for (key in Game.map) {
			if (Game.map[key] == 'fire') {
				Game.map[key] = 'floor';
			}
		}
		Game._drawVisibleArea();

		Game.sounds.explosion.play();

		if (Game.mode == 'story') {
			Game.end();
		}
	}
});
Dragon._cr = 200;

var DragonHatchling = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'd';
		this._color = 'red';

		this._name = 'dragon hatchling';
		this._hp = 10;
		this._damage = '2d4';
		this._cr = 20;
	},
	getSpeed: function() { return 1.5; }
});
DragonHatchling._cr = 20;

// More enemies in infinite mode

var Potato = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'p';
		this._color = 'red';

		this._name = 'potato';
		this._hp = 25;
		this._damage = '1d4';
		this._cr = 15;
	},
	getSpeed: function() { return 1/3; }
});
Potato._cr = 15;

var GoblinArcher = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'A';
		this._color = 'red';

		this._name = 'goblin archer';
		this._hp = 20;
		this._damage = '1d6';
		this._cr = 60;
		this._range = 3;
	}
});
GoblinArcher._cr = 60;

var Jalapeno = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'J';
		this._color = 'red';

		this._name = 'jalapeno';
		this._hp = 15;
		this._damage = '1d4';
		this._cr = 75;
		this._range = 3;
	},
	getSpeed: function() { return 3; }
});
Jalapeno._cr = 75;

var MightyRedwood = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'R';
		this._color = 'red';

		this._name = 'mighty redwood';
		this._hp = 100;
		this._damage = '2d6';
		this._cr = 150;
	},
	getSpeed: function() { return 1/5; }
});
MightyRedwood._cr = 150;

var Rat = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'r';
		this._color = 'red';

		this._name = 'rat';
		this._hp = 10;
		this._damage = '1d8';
		this._cr = 25;
	},
	getSpeed: function() { return 3; }
});
Rat._cr = 25;

var Horse = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'h';
		this._color = 'red';

		this._name = 'horse';
		this._hp = 25;
		this._damage = '1d8';
		this._cr = 45;
	},
	getSpeed: function() { return 2; }
});
Horse._cr = 40;

var Zebra = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'Z';
		this._color = 'red';

		this._name = 'horse';
		this._hp = 30;
		this._damage = '1d10';
		this._cr = 60;
	},
	getSpeed: function() { return 2; }
});
Zebra._cr = 40;

var Unicorn = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 'U';
		this._color = 'red';

		this._name = 'horse';
		this._hp = 40;
		this._damage = '1d12';
		this._cr = 100;
		this._range = 2;
	},
	getSpeed: function() { return 2; }
});
Unicorn._cr = 100;

var Squirrel = Monster.ext({
	init: function(x, y){
		this._super(x, y);

		this._symbol = 's';
		this._color = 'red';

		this._name = 'squirrel';
		this._hp = 8;
		this._damage = '1d6';
		this._cr = 15;
	},
	getSpeed: function() { return 4; }
});
Squirrel._cr = 15;
