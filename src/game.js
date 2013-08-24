var Game = {
	display: null,
	map: {},
	rooms: [],
	engine: null,
	player: null,
	pedro: null,
	ananas: null,

	init: function() {
		this.display = new ROT.Display({spacing:1.1});
		document.body.appendChild(this.display.getContainer());

		this._generateMap();

		var scheduler = new ROT.Scheduler.Simple();
		scheduler.add(this.player, true);
		scheduler.add(this.pedro, true);

		this.engine = new ROT.Engine(scheduler);
		this.engine.start();
	},

	_generateMap: function() {
		var digger = new ROT.Map.Digger();
		var freeCells = [];

		var digCallback = function(x, y, value) {
			if (value) { return; }

			var key = x+","+y;
			this.map[key] = ".";
			freeCells.push(key);
		}
		digger.create(digCallback.bind(this));

		var drawDoor = function(x, y) {
			var key = x+","+y;
			this.map[key] = "#";
		}

		this.rooms = digger.getRooms();
		for (var i=0; i<this.rooms.length; i++) {
			var room = this.rooms[i];
			room.getDoors(drawDoor.bind(this));
		}

		this.player = this._createBeing(Player, freeCells);

		this._drawVisibleArea();
	},

	_createBeing: function(what, freeCells) {
		var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
		var key = freeCells.splice(index, 1)[0];
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);
		return new what(x, y);
	},

	_drawVisibleArea: function() {
		var visitedPoints = [];

		function drawAdjacentTo(x, y) {
			var key = x+","+y;
			visitedPoints.push(key);
			Game.display.draw(x, y, Game.map[key]);

			if (Game.map[key] == '.' || Game.player.at(x, y)) {
				var adjacentPoints = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];

				_.each(adjacentPoints, function (pt) {
					var x = pt[0]; var y = pt[1];
					var key = x+","+y;
					if (Game.map[key] && !_.contains(visitedPoints, key)) {
						drawAdjacentTo(x, y);
					}
				})
			}
		}

		drawAdjacentTo(this.player.getX(), this.player.getY());
		this.player._draw();
	},

	_drawWholeMap: function() {
		for (var key in this.map) {
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			this.display.draw(x, y, this.map[key]);
		}
	}
};
