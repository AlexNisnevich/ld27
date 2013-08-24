var Game = {
	display: null,
	map: {},
	rooms: [],
	exploredPoints: [],
	engine: null,
	player: null,
	sounds: {
		theme: new Audio("sounds/10rogue.wav")
	},

	init: function() {
		this.display = new ROT.Display({spacing:1.1});
		document.body.appendChild(this.display.getContainer());

		this._generateMap();

		var scheduler = new ROT.Scheduler.Simple();
		scheduler.add(this.player, true);
		scheduler.add(this.pedro, true);

		this.engine = new ROT.Engine(scheduler);
		this.engine.start();

		this._startCountdown();
	},

	mute: function() {
		if ($('#muteButton').hasClass('muted')) {
			$('#muteButton').removeClass('muted');
			$('#muteImg').attr('src', 'images/mute-off.gif');
			var muted = false;
		} else {
			$('#muteButton').addClass('muted');
			$('#muteImg').attr('src', 'images/mute-on.gif');
			var muted = true;
		}

		for (sound in this.sounds) {
			this.sounds[sound].muted = muted;
		}
	},

	_startCountdown: function() {
		this.countdownTimer = 11;
		this._countdown();

		this.sounds.theme.pause();
		this.sounds.theme.load();
		this.sounds.theme.play();
	},

	_countdown: function() {
		this.countdownTimer--;
		$('#countdown').text(this.countdownTimer);
		if (this.countdownTimer <= 0) {
			this._timeExpired();
		} else {
			setTimeout(function () {
				Game._countdown();
			}, 1000);
		}
	},

	_timeExpired: function () {
		this.player.die();
		this._startCountdown();
	},

	_generateMap: function() {
		var digger = new ROT.Map.Digger();
		var freeCells = [];

		var digCallback = function(x, y, value) {
			if (value) { return; }

			var key = x+","+y;
			this.map[key] = "space";
			freeCells.push(key);
		}
		digger.create(digCallback.bind(this));

		var drawDoor = function(x, y) {
			var key = x+","+y;
			this.map[key] = "door";
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

		function exploreAdjacentPoints(x, y) {
			var key = x+","+y;
			visitedPoints.push(key);

			if (!_.contains(Game.exploredPoints, key)) {
				Game.exploredPoints.push(key);
			}

			if (Game.map[key] == 'space' || Game.player.at(x, y)) {
				var adjacentPoints = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];

				_.each(adjacentPoints, function (pt) {
					var x = pt[0]; var y = pt[1];
					var key = x+","+y;
					if (Game.map[key] && !_.contains(visitedPoints, key)) {
						exploreAdjacentPoints(x, y);
					}
				})
			}
		}

		exploreAdjacentPoints(this.player.getX(), this.player.getY());

		_.each(this.exploredPoints, function (key) {
			var pt = _.map(key.split(','), function (x) {return parseInt(x); });
			Game.display.draw(pt[0], pt[1], Game.objects[Game.map[key]].symbol);
		});

		this.player.draw();
	},

	_drawWholeMap: function() {
		for (var key in this.map) {
			var parts = key.split(",");
			var x = parseInt(parts[0]);
			var y = parseInt(parts[1]);
			this.display.draw(x, y, this.objects[this.map[key]].symbol);
		}
	}
};

$(document).ready(function () {
	Game.init();

	$('#muteButton').click(function () {
		Game.mute();
	})
})
