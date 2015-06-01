// Hover inspect extension for Chrome
// https://github.com/NV0/hover-inspect

(function() {

	var tabs = {};


	var inspect = {
		activate: function(id) {
			this.id = id;

			chrome.tabs.executeScript(this.id, {
				file: 'prism.js'
			});
			chrome.tabs.executeScript(this.id, {
				file: 'hoverinspect.js'
			}, function() {
				chrome.tabs.sendMessage(this.id, {
					action: 'activate'
				});
			}.bind(this));

			chrome.browserAction.setIcon({
				tabId: this.id,
				path: {
					19: "icon_active.png"
				}
			});
		},

		deactivate: function() {
			chrome.tabs.sendMessage(this.id, {
				action: 'deactivate'
			});

			chrome.browserAction.setIcon({
				tabId: this.id,
				path: {
					19: "icon.png"
				}
			});
		}

	};

	function toggle(tab) {
		if (!tabs[tab.id]) {
			tabs[tab.id] = Object.create(inspect);
			tabs[tab.id].activate(tab.id);
		} else {
			tabs[tab.id].deactivate();
			for (var tabId in tabs) {
				if (tabId == tab.id) delete tabs[tabId];
			}
		}
	}

	chrome.browserAction.onClicked.addListener(toggle);

})();
