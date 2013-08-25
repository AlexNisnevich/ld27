var Game = {
	display: null,

	map: {},
	rooms: [],
	exploredPoints: [],
	visiblePoints: [],

	scheduler: null,
	engine: null,

	player: null,
	monsters: [],

	paused: false,

	sounds: {
		theme: new Audio("sounds/10rogue.wav"),

		hit: new Audio("sounds/hit.wav"),
		dead: new Audio("sounds/dead.wav"),
		door: new Audio("sounds/door.wav"),
		stairs: new Audio("sounds/stairs.wav"),
		pickup: new Audio("sounds/pickup.wav")
	},

	init: function() {
		this.display = new ROT.Display({spacing:1.1});
		$('#canvasContainer').append(this.display.getContainer());

		this.scheduler = new ROT.Scheduler.Speed();

		this._generateMap();

		this.engine = new ROT.Engine(this.scheduler);
		this.engine.start();

		Game._startCountdown();
	},

	mute: function() {
		if ($('#muteButton').hasClass('muted')) {
			$('#muteButton').removeClass('muted');
			$('#muteImg').attr('src', 'images/mute-on.png');
			var muted = false;
		} else {
			$('#muteButton').addClass('muted');
			$('#muteImg').attr('src', 'images/mute-off.png');
			var muted = true;
		}

		for (sound in this.sounds) {
			this.sounds[sound].muted = muted;
		}
	},

	log: function(msg) {
		$('#shadowLog').text($('#log').text())
			.stop()
			.css('color', '#999')
			.animate({color:"#000"}, 3000);

		$('#log').text(msg);
	},

	_startCountdown: function() {
		this.countdownTimer = 11;
		clearTimeout(this.countdownTimeout);
		this._countdown();

		this.sounds.theme.volume = 0.3;
		this.sounds.theme.pause();
		this.sounds.theme.load();
		this.sounds.theme.play();
	},

	_countdown: function() {
		if (!this.paused) {
			this.countdownTimer--;
		}
		$('#countdown').text(this.countdownTimer);
		if (this.countdownTimer <= 0) {
			this._timeExpired();
		} else {
			this.countdownTimeout = setTimeout(function () {
				Game._countdown();
			}, 1000 * player._speed);
		}
	},

	_timeExpired: function () {
		this.player.die();
		this._startCountdown();
		Game.log('You have died of old age!');
	},

	pause: function() {
		this.paused = !this.paused;
		if (this.paused) {
			this.sounds.theme.pause();
		} else {
			this.sounds.theme.play();
		}
	},

	_generateMap: function() {
		var digger = new ROT.Map.Digger();
		var freeCells = [];

		var digCallback = function(x, y, value) {
			if (value) { return; }

			var key = x+","+y;
			this.map[key] = "floor";
			freeCells.push(key);
		}
		digger.create(digCallback.bind(this));

		var drawDoor = function(x, y) {
			var key = x+","+y;
			this.map[key] = "door";
			freeCells = _(freeCells).without(key);
		}

		this.rooms = digger.getRooms();
		for (var i=0; i<this.rooms.length; i++) {
			var room = this.rooms[i];
			room.getDoors(drawDoor.bind(this));
		}

		this._createMonsters(Aardvark, freeCells, 5, 10);
		this._createMonsters(Bunny, freeCells, 5, 10);
		this._createObjects('stairs', freeCells, 1, 1);

		if (!this.player) {
			this.player = this._createBeing(Player, freeCells);
		} else {
			this._placePlayer(freeCells);
		}

		this._drawVisibleArea();
	},

	_createObjects: function(type, freeCells, min, max) {
		_(_.random(min, max)).times(function () {
			var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
			var key = freeCells.splice(index, 1)[0];
			Game.map[key] = type;
		})
	},

	_createBeing: function(type, freeCells) {
		var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
		var key = freeCells.splice(index, 1)[0];
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);

		var being = new type(x, y);
		Game.scheduler.add(being, true);
		return being;
	},

	_placePlayer: function(freeCells) {
		var index = Math.floor(ROT.RNG.getUniform() * freeCells.length);
		var key = freeCells.splice(index, 1)[0];
		var parts = key.split(",");
		var x = parseInt(parts[0]);
		var y = parseInt(parts[1]);

		this.player._x = x;
		this.player._startX = x;
		this.player._y = y;
		this.player._startY = y;
	},

	_createMonsters: function(type, freeCells, min, max) {
		_(_.random(min, max)).times(function () {
			var monster = Game._createBeing(type, freeCells);
			Game.monsters.push(monster);
		});
	},

	removeBeing: function(being) {
		this.monsters = _(this.monsters).without(being);
		this.scheduler.remove(being);
		this._drawVisibleArea();
	},

	nextLevel: function() {
		this.map = {};
		this.rooms = [];
		this.exploredPoints = [];
		this.monsters = [];

		this.display.clear();
		this.scheduler.clear();
		Game.scheduler.add(this.player, true);
		this._generateMap();
	},

	_drawVisibleArea: function() {
		this.display.clear();

		var visitedPoints = [];
		this.visiblePoints = [];

		function exploreAdjacentPoints(x, y, dist) {
			var key = x+","+y;
			visitedPoints.push(key);

			if (!_.contains(Game.exploredPoints, key)) {
				Game.exploredPoints.push(key);
			}

			if (dist <= player._viewRadius) {
				Game.visiblePoints.push(key);
			}

			if ((Game.map[key] && Game.map[key] != 'door') || Game.player.at(x, y)) {
				var adjacentPoints = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];

				_.each(adjacentPoints, function (pt) {
					var x = pt[0]; var y = pt[1];
					var key = x+","+y;
					if (Game.map[key] && (!_.contains(visitedPoints, key) || dist < player._viewRadius)) {
						exploreAdjacentPoints(x, y, dist + 1);
					}
				})
			}
		}

		exploreAdjacentPoints(this.player.getX(), this.player.getY(), 0);

		_.each(this.exploredPoints, function (key) {
			var pt = _.map(key.split(','), function (x) {return parseInt(x); });
			Game.display.draw(pt[0], pt[1], Game.objects[Game.map[key]].symbol, Game.objects[Game.map[key]].color, Game.calculateLighting(pt[0], pt[1]));
		});

		_(this.monsters).each(function (monster) {
			monster.draw();
		})

		this.player.draw();
	}
};

$(document).ready(function () {
	Game.init();

	$('#muteButton').click(function () {
		Game.mute();
	})
})
