// Copyright (c) 2014 Ilya Shubin

function handleInjection(tab) {

	chrome.tabs.insertCSS(tab.id, {file: 'style.css'});
	chrome.tabs.executeScript(tab.id, {file: 'prism.js'});

	chrome.tabs.executeScript(tab.id, {file: 'inject.js'}, function() {
		chrome.tabs.sendMessage(tab.id, {});
	});
}


chrome.browserAction.onClicked.addListener(handleInjection);
