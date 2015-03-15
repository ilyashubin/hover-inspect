// Hover inspect extension for Chrome
// https://github.com/NV0/hover-inspect

(function(){

	var tabs = {};

	function toggle(tab){
		if (!tabs[tab.id]) {
			tabs[tab.id] = Object.create(inspect);
			tabs[tab.id].activate(tab.id);
		} else {
			tabs[tab.id].deactivate();
			for (var tabId in tabs){
				if (tabId == tab.id) delete tabs[tabId];
			}
		}
	}

	var inspect = {
		activate: function(id) {
			this.id = id;

			chrome.tabs.executeScript(this.id, { file: 'prism.js' });	
			chrome.tabs.insertCSS(this.id, { file: 'hoverinspect.css' });
			chrome.tabs.executeScript(this.id, { file: 'hoverinspect.js' }, function() {
				chrome.tabs.sendMessage(this.id, { action: 'activate' });
			}.bind(this));

			chrome.browserAction.setIcon({ 
				tabId: this.id,
				path: {
					19: "icon_active.png"
				}
			});
		},

		deactivate: function(id) {
			chrome.tabs.sendMessage(this.id, { action: 'deactivate' });

			chrome.browserAction.setIcon({ 
				tabId: this.id,
				path: {
					19: "icon.png"
				}
			});
		}

	}

	chrome.browserAction.onClicked.addListener(toggle);

})();

