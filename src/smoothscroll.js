/*
Copyright (c) 2018 LieutenantPeacock

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
;(function(window) {
	var requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function(fn) { window.setTimeout(fn, 1000 / 60) },
		ticks = [],
		body,
		html = document.getElementsByTagName('html')[0];
	function getCoordinates(elem) {
		var box = elem.getBoundingClientRect();
		var scrollTop = window.pageYOffset || html.scrollTop || body.scrollTop;
		var scrollLeft = window.pageXOffset || html.scrollLeft || body.scrollLeft;
		var clientTop = html.clientTop || body.clientTop || 0;
		var clientLeft = html.clientLeft || body.clientLeft || 0;
		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;
		return { top: top, left: left };
	}
	function isElement(obj) {
		return /Element/.test({}.toString.call(obj));
	}
	function getPos(v, current, t) {
		var val;
		if (typeof v === "number") return v;
		switch (v) {
			case "start":
				val = 0;
				break;
			case "end":
				val = t + 10;
				break;
			case "center":
				val = t / 2;
				break;
			default:
				var add = v.split("+");
				var minus = v.split("-");
				if (v.indexOf("+") > 0) {
					throw new Error("Position can only contain a + sign at the start");
				}
				if (v.indexOf("-") > 0) {
					throw new Error("Position can only contain a - sign at the start");
				}
				if (v.indexOf("+") > -1 && v.indexOf("-") > -1) {
					throw new Error("Position cannot contain both + and - signs.");
				}
				if (v.indexOf("%") > -1 && v.indexOf("%") !== v.length - 1) {
					throw new Error("Position can only contain a % symbol at the end.");
				}
				var pos;
				if (add[1]) {
					pos = add[1];
					if (pos.indexOf("%") > -1) {
						pos = pos.split("%")[0];
						val = current + (t * pos / 100);
					} else {
						val = current + (+pos);
					}
				} else if (minus[1]) {
					pos = minus[1];
					if (pos.indexOf("%") > -1) {
						pos = pos.split("%")[0];
						val = current - (t * pos / 100);
					} else {
						val = current - (+pos);
					}
				} else if (v.indexOf("%") > -1) {
					pos = v.split("%")[0];
					val = t * pos / 100;
				} else {
					val = +v;
				}
		}
		return val;
	}
	function addEventHandler(elem, event, fn) {
		if (elem.addEventListener) {
			elem.addEventListener(event, fn, false);
		} else if (elem.attachEvent) {
			elem.attachEvent("on" + event, fn);
		}
	}
	function removeEventHandler(elem, eventType, handler) {
		if (elem.removeEventListener) {
			elem.removeEventListener(eventType, handler, false);
		} else if (elem.detachEvent) {
			elem.detachEvent('on' + eventType, handler);
		}
	}
	var defaults = {
		duration: 500,
		preventUserScroll: true,
		scrollEvents: ['scroll', 'mousedown', 'wheel', 'DOMMouseScroll', 'mousewheel', 'touchmove'],
		scrollKeys: [37, 38, 39, 40, 32],
		allowAnimationOverlap: false,
		easing: 'linear'
	}
	function getNotNull() {
		for (var i = 0; i < arguments.length; i++) {
			if (arguments[i] != null) {
				return arguments[i];
			}
		}
	}
	function getRelativePos(str, p, v, h) {
		if (typeof str !== "string") {
			throw new Error("Block and inline values must be strings");
		}
		function position(pe) {
			return p - (v - h) * pe;
		}
		switch (str) {
			case "start":
				return p;
			case "center":
				return position(0.5);
			case "end":
				return position(1);
			default:
				if (str.indexOf("%") > -1 && str.split('%').length < 3) {
					return position(+str.split('%')[0] / 100);
				}
				throw new Error("Invalid block or inline string value");
		}
	}
	function css(elem, val) {
		if (window.getComputedStyle) {
			var style = getComputedStyle(elem, null);
			if (style.getPropertyValue) {
				return style.getPropertyValue(val);
			} else if (style.getAttribute) {
				return style.getAttribute(val);
			} else if (style[val]) {
				return style[val];
			}
		} else if (elem.currentStyle) {
			return elem.currentStyle[val];
		}
	}
	window.smoothScroll = function smoothScroll(options) {
		if (!body) body = document.getElementsByTagName('body')[0];
		options = options || {};
		if (this instanceof smoothScroll) {
			return {
				smoothScroll: function(opts) {
					opts = opts || {};
					for (var i = 0; i < allOps.length; i++) {
						var op = allOps[i];
						if (!(op in opts)) {
							opts[op] = options[op];
						}
					}
					window.smoothScroll(opts);
				}
			};
		}
		var yPos = getNotNull(options.yPos, defaults.yPos),
			duration = +getNotNull(options.duration, defaults.duration),
			xPos = getNotNull(options.xPos, defaults.xPos),
			p = getContainerScrollPos(),
			currentXPos = p.x,
			currentYPos = p.y,
			containerHeight = Math.max(body.scrollHeight, body.offsetHeight,
				html.clientHeight, html.scrollHeight, html.offsetHeight),
			containerWidth = Math.max(html.clientWidth, body.scrollWidth, html.scrollWidth,
				body.offsetWidth, html.offsetWidth),
			maxScrollTop = containerHeight - window.innerHeight,
			maxScrollLeft = containerWidth - window.innerWidth,
			callback = getNotNull(options.complete, defaults.complete),
			scroll,
			scrollingElem = getNotNull(options.scrollingElement, defaults.scrollingElement),
			elem = getNotNull(options.toElement, defaults.toElement),
			firstAxis = getNotNull(options.firstAxis, defaults.firstAxis),
			preventUserScroll = getNotNull(options.preventUserScroll, defaults.preventUserScroll),
			easing = getNotNull(options.easing, defaults.easing),
			block = getNotNull(options.block, defaults.block),
			inline = getNotNull(options.inline, defaults.inline),
			vh = window.innerHeight, vw = window.innerWidth,
			start,
			i = 0,
			events = getNotNull(options.scrollEvents, defaults.scrollEvents),
			keys = getNotNull(options.scrollKeys, defaults.scrollKeys),
			animation,
			paddingTop = getNotNull(options.paddingTop, defaults.paddingTop),
			paddingLeft = getNotNull(options.paddingLeft, defaults.paddingLeft);
		if (typeof easing === "string") {
			var name = easing;
			easing = smoothScroll.easing[easing];
			if (!easing) {
				throw new Error("Easing function " + name + " does not exist.");
			}
		} else if (typeof easing !== "function") {
			throw new Error("Easing must be the name of an easing function or an easing function");
		}
		if (scrollingElem) {
			if (isElement(scrollingElem)) {
				if (scrollingElem != body && scrollingElem != html) {
					containerHeight = scrollingElem.scrollHeight;
					containerWidth = scrollingElem.scrollWidth;
					maxScrollTop = containerHeight - scrollingElem.clientHeight;
					maxScrollLeft = containerWidth - scrollingElem.clientWidth;
					currentXPos = scrollingElem.scrollLeft;
					currentYPos = scrollingElem.scrollTop;
					vh = parseInt(css(scrollingElem, 'height'), 10);
					vw = parseInt(css(scrollingElem, 'width'), 10);
					scroll = function(x, y) {
						scrollingElem.scrollTop = y;
						scrollingElem.scrollLeft = x;
					}
				} else {
					scrollingElem = void 0;
					scroll = window.scrollTo;
				}
			} else {
				throw new Error("Scrolling element must be a HTML element");
			}
		} else {
			scroll = window.scrollTo;
		}
		if (yPos != null) {
			yPos = getPos(yPos, currentYPos, maxScrollTop);
		} else {
			yPos = currentYPos;
		}
		if (xPos != null) {
			xPos = getPos(xPos, currentXPos, maxScrollLeft);
		} else {
			xPos = currentXPos;
		}
		if (isNaN(yPos)) {
			throw new Error("Invalid yPos");
		}
		if (isNaN(xPos)) {
			throw new Error("Invalid xPos");
		}
		if (isNaN(duration)) {
			throw new Error("Invalid duration");
		}
		duration = Math.max(duration, 0);
		xPos = Math.max(xPos, 0);
		yPos = Math.max(yPos, 0);
		if (elem) {
			if (!isElement(elem)) {
				throw new Error("Element to scroll to must be a HTML element");
			}
			var c = getCoordinates(elem);
			if (scrollingElem) {
				var s = getCoordinates(scrollingElem);
				yPos = scrollingElem.scrollTop + (c.top - s.top) - parseInt(css(scrollingElem, 'border-top-width'), 10);
				xPos = scrollingElem.scrollLeft + (c.left - s.left) - parseInt(css(scrollingElem, 'border-left-width'), 10);
			} else {
				yPos = c.top;
				xPos = c.left;
			}
			if (block != null) yPos = getRelativePos(block, yPos, vh, elem.offsetHeight);
			if (inline != null) xPos = getRelativePos(inline, xPos, vw, elem.offsetWidth);
		}
		if (paddingTop != null) yPos += paddingTop;
		if (paddingLeft != null) xPos += paddingLeft;
		yPos = Math.min(Math.round(yPos), containerHeight);
		xPos = Math.min(Math.round(xPos), containerWidth);
		if (xPos === currentXPos && yPos === currentYPos) return;
		if (xPos === currentXPos || yPos === currentYPos) firstAxis = null;
		if (firstAxis != null) duration /= 2;
		function cancel() {
			removeScrollHandlers();
			complete(true, false);
		}
		function cancelForScrollKeys(e) {
			if (keys.indexOf(e.keyCode) > -1) {
				removeScrollHandlers();
				complete(true, false);
			}
		}
		function removeScrollHandlers() {
			for (var j = 0; j < events.length; j++) {
				var event = events[j];
				if (!scrollingElem) {
					removeEventHandler(body, event, cancel);
					removeEventHandler(html, event, cancel);
				} else {
					removeEventHandler(scrollingElem, event, cancel);
				}
			}
			if (scrollingElem) removeEventHandler(scrollingElem, 'keydown', cancelForScrollKeys);
			else removeEventHandler(document, 'keydown', cancelForScrollKeys);
		}
		function complete(i, c) {
			var p = getContainerScrollPos(scrollingElem);
			animation.destroy();
			if (!preventUserScroll) removeScrollHandlers();
			if (callback) callback({ xPos: xPos, yPos: yPos, scrollingElement: scrollingElem, duration: duration, currentXPos: p.x, currentYPos: p.y, interrupted: i, canceled: c });
		}
		if (!preventUserScroll) {
			for (var j = 0; j < events.length; j++) {
				var event = events[j];
				if (!scrollingElem) {
					addEventHandler(body, event, cancel);
					addEventHandler(html, event, cancel);
				} else {
					addEventHandler(scrollingElem, event, cancel);
				}
			}
			if (scrollingElem) addEventHandler(scrollingElem, 'keydown', cancelForScrollKeys);
			else addEventHandler(document, 'keydown', cancelForScrollKeys);
		}
		return animation = tick(function() {
			var currentTime = window.performance && performance.now ? performance.now() : +new Date;
			if (!start) start = currentTime;
			var progress = currentTime - start;
			scroll(firstAxis != "y" ? getScrollPos(xPos, currentXPos, easing(progress / duration)) : currentXPos,
				firstAxis != "x" ? getScrollPos(yPos, currentYPos, easing(progress / duration)) : currentYPos);
			if (progress >= duration) {
				scroll(firstAxis != "y" ? xPos : currentXPos, firstAxis != "x" ? yPos : currentYPos);
				i++;
				if (firstAxis != null && i < 2) {
					switch (firstAxis) {
						case "x":
							firstAxis = "y";
							currentXPos = xPos;
							break;
						case "y":
							firstAxis = "x";
							currentYPos = yPos;
					}
					start = null;
				} else {
					complete(false, false);
				}
			}
		}, complete, !getNotNull(options.allowAnimationOverlap, defaults.allowAnimationOverlap), scrollingElem);
	}
	function getContainerScrollPos(elem) {
		return elem ? { x: elem.scrollLeft, y: elem.scrollTop } : {
			x: (window.pageXOffset !== undefined)
				? window.pageXOffset
				: (document.documentElement || document.body.parentNode || document.body).scrollLeft,
			y: (window.pageYOffset !== undefined)
				? window.pageYOffset
				: (document.documentElement || document.body.parentNode || document.body).scrollTop
		};
	}
	function getScrollPos(p, c, e) {
		return p > c ? c - ((c - p) * e) : ((p - c) * e) + c;
	}
	smoothScroll.stopAll = function() {
		return stop();
	}
	function stop(filter) {
		var len = ticks.length;
		for (var i = len - 1; i >= 0; i--) {
			if (filter) {
				var t = ticks[i];
				filter(t) && t.destroy(true);
			} else {
				ticks[i].destroy(true);
			}
		}
		return !!len;
	}
	function tick(func, complete, cancel, elem) {
		if (cancel) {
			stop(function(t) {
				return t.scrollingElem == elem;
			});
		}
		var res, shouldStop = false, t = function() {
			if (!shouldStop) {
				func();
				requestAnimationFrame(t);
			}
		},
			destroy = function(x) {
				if (shouldStop) {
					return;
				}
				shouldStop = true;
				var i = getIndex(destroy);
				if (i != null) ticks.splice(i, 1);
				if (x) complete(false, true);
			};
		res = {
			destroy: destroy,
			scrollingElem: elem
		};
		ticks.push(res);
		requestAnimationFrame(t);
		return {
			destroy: function() { destroy(); }
		};
	}
	function getIndex(destroy) {
		for (var i = 0; i < ticks.length; i++) {
			if (ticks[i].destroy === destroy) {
				return i;
			}
		}
	}
	smoothScroll.easing = {
		linear: function(e) { return e },
		swing: function(e) { return .5 - Math.cos(e * Math.PI) / 2 }
	}
	var base = {
		Sine: function(p) {
			return 1 - Math.cos(p * Math.PI / 2);
		},
		Circ: function(p) {
			return 1 - Math.sqrt(1 - p * p);
		},
		Elastic: function(p) {
			return p === 0 || p === 1 ? p :
				-Math.pow(2, 8 * (p - 1)) * Math.sin(((p - 1) * 80 - 7.5) * Math.PI / 15);
		},
		Back: function(p) {
			return p * p * (3 * p - 2);
		},
		Bounce: function(p) {
			var pow2,
				bounce = 4;
			while (p < ((pow2 = Math.pow(2, --bounce)) - 1) / 11) { }
			return 1 / Math.pow(4, 3 - bounce) - 7.5625 * Math.pow((pow2 * 3 - 2) / 22 - p, 2);
		}
	};
	var prefixes = ["Quad", "Cubic", "Quart", "Quint", "Expo"];
	for (var i = 0; i < prefixes.length; i++) {
		base[prefixes[i]] = function(p) {
			return Math.pow(p, i + 2);
		};
	}
	for (var key in base) {
		if (key != null && base[key] != null) {
			var easeIn = base[key];
			smoothScroll.easing["easeIn" + key] = easeIn;
			smoothScroll.easing["easeOut" + key] = function(p) {
				return 1 - easeIn(1 - p);
			};
			smoothScroll.easing["easeInOut" + key] = function(p) {
				return p < 0.5 ?
					easeIn(p * 2) / 2 :
					1 - easeIn(p * -2 + 2) / 2;
			};
		}
	}
	smoothScroll.scrolling = function() {
		return !!ticks.length;
	}
	var allOps = ['xPos', 'yPos', 'duration', 'scrollingElement', 'toElement', 'preventUserScroll', 'easing', 'complete', 'firstAxis', 'scrollEvents', 'scrollKeys', 'block', 'inline', 'allowAnimationOverlap', 'paddingTop', 'paddingLeft'];
	smoothScroll.defaults = function(ops) {
		if (ops != null) {
			for (var i = 0; i < allOps.length; i++) {
				var x = allOps[i];
				if (ops[x] != null) defaults[x] = ops[x];
			}
		}
		return defaults;
	}
	smoothScroll.nativeSupported = 'scrollBehavior' in html.style;
})(this);