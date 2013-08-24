var Aardvark = function(x, y) {
	this.init = function() {
		this._x = x;
		this._y = y;

		this._symbol = 'a';
		this._color = 'red';

		this._name = 'aardvark'
		this._hp = 5;
		this._damage = '1d4';

		this.draw();
	}

	this.at = function (x, y) { return this._x == x && this._y == y; }

	this._isVisible = function () {
		return _(Game.exploredPoints).contains(this._x + "," + this._y)
	}

	this.act = function() {
		if (this._isVisible()) {
			var x = Game.player.getX();
			var y = Game.player.getY();
			var passableCallback = function(x, y) {
			    return Game.map[x+","+y];
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
	}

	this.draw = function() {
		if (this._isVisible()) {
			Game.display.draw(this._x, this._y, this._symbol, this._color);
		}
	}

	this._attack = function(player) {
		var damage = Game.calculateDamage(this._damage);
		player._hp -= damage;
		Game.log('The ' + this._name + ' deals ' + damage + ' damage to you.')
		Game.sounds.hit.play();
		if (player._hp <= 0) {
			Game.log('You have been slain by an ' + this._name + '.')
			player.die();
		} else {
			player.draw();
		}
	}

	this.init();
}
