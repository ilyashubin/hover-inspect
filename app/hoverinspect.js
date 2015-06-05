
var injected = injected || (function() {

	// helper functions

	var debounce = function(func, wait) {
		var timeout;
		return function() {
			var context = this,
				args = arguments;
			var later = function() {
				timeout = null;
				func.apply(context, args);
			};

			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (!timeout) func.apply(context, args);
		};
	}

	// Inspector constructor

	var Inspector = function() {
		this.highlight = this.highlight.bind(this);
		this.log = this.log.bind(this);
		this.logMain = debounce(this.logMain.bind(this), 450);

		this.$target = document.body;
		this.$cacheEl = document.body;
		this.$cacheElMain = document.body;

		this.serializer = new XMLSerializer();
		this.forbidden = [this.$cacheEl, document.body, document.documentElement];
	};

	Inspector.prototype = {

		getNodes: function() {
			var path = chrome.extension.getURL("template.html");

			var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
					this.template = xmlhttp.responseText;
					this.createNodes();
					this.registerEvents();
				}
			}.bind(this);

			xmlhttp.open("GET", path, true);
			xmlhttp.send();
		},

		createNodes: function() {

				this.$host = document.createElement('div');
				this.$host.className = 'tl-host';
				this.$host.style.cssText = 'all: initial;';


				var shadow = this.$host.createShadowRoot();
				document.body.appendChild(this.$host);

				var templateMarkup = document.createElement("div");
				templateMarkup.innerHTML = this.template;
				shadow.innerHTML = templateMarkup.querySelector('template').innerHTML;

				this.$wrap = shadow.querySelector('.tl-wrap');

				this.$overlay = {
					padding: shadow.querySelector('.tl-padding'),
					main: shadow.querySelector('.tl-overlay-main'),
					vert: shadow.querySelector('.tl-overlay-vertical'),
					hor: shadow.querySelector('.tl-overlay-horizontal')
				};

				this.$code = shadow.querySelector('.tl-code');

				this.$tooltip = {
					main: shadow.querySelector('.tl-tooltip'),
					size: shadow.querySelector('.tl-tooltip-size'),
					elementName: shadow.querySelector('.tl-tooltip-elementName'),
					classes: shadow.querySelector('.tl-tooltip-classes'),
					ids: shadow.querySelector('.tl-tooltip-ids'),
				};

				this.highlight();
		},

		registerEvents: function() {
			document.addEventListener('mousemove', this.log);
			this.$code.addEventListener('animationend', function(){
				this.style.webkitAnimationName = '';
			}, false);
		},

		convertToShortFormat: function(string, delimiter) {
			if (!string.length) return '';
			var arr = string.split(' '),
				output;

			if (arr.length > 5) {
				output = delimiter + arr.slice(0,5).join(delimiter) + '...';
			} else {
				output = delimiter + string.replace(/ /g, delimiter);
			}
			return output;
		},

		log: function(e) {

			this.$target = e.target;

			// check if element cached
			if (this.forbidden.indexOf(this.$target) !== -1) return;

			this.stringified = this.serializer.serializeToString(this.$target);


			this.logMain();

			this.$cacheEl = this.$target;
			this.layout();

			this.logTooltip();

		},

		logMain: function() {
			if (this.$cacheElMain === this.$target) return;
			this.$cacheElMain = this.$target;

			var fullCode = this.stringified
				.slice(0, this.stringified.indexOf('>') + 1)
				.replace(/ xmlns="(.*?)"/, '');

			this.$code.style.webkitAnimationName = 'tl-reload';

			setTimeout(function() {
				this.$code.innerText = fullCode; // set full element code
				this.highlight(); // highlight element
			}.bind(this), 300);


		},

		logTooltip: function() {

			var tt = this.$tooltip;

			var elementName = this.$target.tagName,
				classes = this.convertToShortFormat(this.$target.className, '.'),
				ids = this.convertToShortFormat(this.$target.id, '#');

			// set tooltip code
			tt.elementName.innerText = elementName.toLowerCase();
			tt.classes.innerText = classes;
			tt.ids.innerText = ids;
			tt.size.innerHTML = Math.floor(this.box.width) + ' x ' + Math.floor(this.box.height);

			tt.main.classList.remove('tl-tooltip--right');
			var tooltipOverflowing = tt.main.getBoundingClientRect().right > document.documentElement.clientWidth;
			if (tooltipOverflowing) {
				tt.main.classList.add('tl-tooltip--right');
			}
		},

		// redraw overlay
		layout: function() {
			var box, computedStyle, rect;

			rect = this.$target.getBoundingClientRect();
			computedStyle = window.getComputedStyle(this.$target);
			box = {
				width: rect.width,
				height: rect.height,
				top: rect.top + window.pageYOffset,
				left: rect.left + window.pageXOffset,
				margin: {
					top: computedStyle.marginTop,
					right: computedStyle.marginRight,
					bottom: computedStyle.marginBottom,
					left: computedStyle.marginLeft
				},
				padding: {
					top: computedStyle.paddingTop,
					right: computedStyle.paddingRight,
					bottom: computedStyle.paddingBottom,
					left: computedStyle.paddingLeft
				}
			};

			// pluck negatives
         ['margin', 'padding'].forEach(function(property) {
				for (var el in box[property]) {
					var val = parseInt(box[property][el], 10);
					box[property][el] = Math.max(0, val);
				}
			});

			this.$overlay.vert.style.cssText = "top: " + box.top +
				"px; height: " + box.height + "px;";
			this.$overlay.hor.style.cssText = "top: " + window.pageYOffset +
				"px; left: " + box.left +
				"px; width: " + box.width + "px;";
			this.$overlay.main.style.cssText = "top: " + (box.top - box.margin.top) +
				"px; left: " + (box.left - box.margin.left) +
				"px; width: " + box.width +
				"px; height: " + box.height +
				"px; border-width: " + box.margin.top + "px " + box.margin.right +
				"px " + box.margin.bottom + "px " + box.margin.left + "px;";
			this.$overlay.padding.style.cssText = "border-width: " + box.padding.top +
				"px " +
				box.padding.right + "px " + box.padding.bottom + "px " + box.padding.left +
				"px;";

			this.box = box;

		},

		// code highlighting
		highlight: function() {
			Prism.highlightElement(this.$code);
		},

		activate: function() {
			this.getNodes();
		},

		deactivate: function() {
			this.$wrap.classList.add('-out');
			document.removeEventListener('mousemove', this.log);
			setTimeout(function() {
				document.body.removeChild(this.$host);
			}.bind(this), 600);
		}
	};

	var hi = new Inspector();

	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if (request.action === 'activate') {
			return hi.activate();
		} else {
			return hi.deactivate();
		}
	});

	return true;
})();
