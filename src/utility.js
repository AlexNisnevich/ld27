/* jQuery.color */
(function(d){d.each(["backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","color","outlineColor"],function(f,e){d.fx.step[e]=function(g){if(!g.colorInit){g.start=c(g.elem,e);g.end=b(g.end);g.colorInit=true}g.elem.style[e]="rgb("+[Math.max(Math.min(parseInt((g.pos*(g.end[0]-g.start[0]))+g.start[0]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[1]-g.start[1]))+g.start[1]),255),0),Math.max(Math.min(parseInt((g.pos*(g.end[2]-g.start[2]))+g.start[2]),255),0)].join(",")+")"}});function b(f){var e;if(f&&f.constructor==Array&&f.length==3){return f}if(e=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(f)){return[parseInt(e[1]),parseInt(e[2]),parseInt(e[3])]}if(e=/rgb\(\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*,\s*([0-9]+(?:\.[0-9]+)?)\%\s*\)/.exec(f)){return[parseFloat(e[1])*2.55,parseFloat(e[2])*2.55,parseFloat(e[3])*2.55]}if(e=/#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(f)){return[parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16)]}if(e=/#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/.exec(f)){return[parseInt(e[1]+e[1],16),parseInt(e[2]+e[2],16),parseInt(e[3]+e[3],16)]}if(e=/rgba\(0, 0, 0, 0\)/.exec(f)){return a.transparent}return a[d.trim(f).toLowerCase()]}function c(g,e){var f;do{f=d.css(g,e);if(f!=""&&f!="transparent"||d.nodeName(g,"body")){break}e="backgroundColor"}while(g=g.parentNode);return b(f)}var a={aqua:[0,255,255],azure:[240,255,255],beige:[245,245,220],black:[0,0,0],blue:[0,0,255],brown:[165,42,42],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgrey:[169,169,169],darkgreen:[0,100,0],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkviolet:[148,0,211],fuchsia:[255,0,255],gold:[255,215,0],green:[0,128,0],indigo:[75,0,130],khaki:[240,230,140],lightblue:[173,216,230],lightcyan:[224,255,255],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightyellow:[255,255,224],lime:[0,255,0],magenta:[255,0,255],maroon:[128,0,0],navy:[0,0,128],olive:[128,128,0],orange:[255,165,0],pink:[255,192,203],purple:[128,0,128],violet:[128,0,128],red:[255,0,0],silver:[192,192,192],white:[255,255,255],yellow:[255,255,0],transparent:[255,255,255]}})(jQuery);

/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){var e=false,t=/xyz/.test(function(){xyz})?/\b_super\b/:/.*/;this.Class=function(){};Class.ext=function(n){function o(){if(!e&&this.init)this.init.apply(this,arguments)}var r=this.prototype;e=true;var i=new this;e=false;for(var s in n){i[s]=typeof n[s]=="function"&&typeof r[s]=="function"&&t.test(n[s])?function(e,t){return function(){var n=this._super;this._super=r[e];var i=t.apply(this,arguments);this._super=n;return i}}(s,n[s]):n[s]}o.prototype=i;o.prototype.constructor=o;o.ext=arguments.callee;return o}})()

/* Game utility methods */

Game.calculateLighting = function (x, y) {
	var key = x+","+y;
	if (_(Game.visiblePoints).contains(key)) {
		var dist = Math.abs(Game.player.getX() - x) + Math.abs(Game.player.getY() - y);
		return ROT.Color.toHex(ROT.Color.interpolate([90, 90, 90], [30, 30, 30], dist / Game.player._viewRadius));
	} else {
		return '#000';
	}
}

Game.dieRoll = function (roll) {
	var parts = roll.split('d');
	var numDice = parts[0];
	var sizeOfDice = parts[1];

	var result = 0;
	_(numDice).times(function () {
		result += _.random(1, sizeOfDice);
	});

	return result;
}

Game.experienceForLevel = function (lvl) {
	return Math.round(Math.pow(1.7, lvl - 2) * 10);
}

Game.generateName = function () {
	return Game.first_names[_.random(0, Game.first_names.length - 1)];
}

Game.generateCharacter = function (lvl, callback) {
	var attributes = {
		constitution: 4,
		strength: 2,
		dexterity: 2
	}

	_(lvl * 2).times(function () {
		var attribute = _(attributes).keys()[_.random(0, _(attributes).keys().length - 1)];
		attributes[attribute]++;
	});

	var stats = {
		hp: Game.dieRoll(attributes.constitution + 'd4'),
		damage: '1d' + (attributes.strength * 2),
		speed: Math.max(1, Math.min(2, (_.random(attributes.dexterity, attributes.dexterity * 2) + 5) / 10)).toFixed(1)
	}

	stats.name = Game.generateName();

	return stats;
}
