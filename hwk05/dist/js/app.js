function routeTo(pathToPage) {
	location.href = pathToPage;
}

function checkForAppUpdates() {
	window.applicationCache.addEventListener("updateready", function(e) {
		if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
			if (confirm("Updates are available for this mobile web app. Load them?")) {
				window.applicationCache.swapCache();
				window.location.reload();
			}
		}
	});
}

var header = document.getElementsByTagName("header")[0];
var arrow = document.getElementsByClassName("arrow")[0];
var currentPageButton = document.querySelector(".current-page button");

if (currentPageButton) {
	currentPageButton.onclick = null;
	currentPageButton.addEventListener("click", openMenu);
	arrow.addEventListener("click", openMenu);
}

function openMenu() {
	header.classList.toggle("maximized");
}

var watchListItems = document.getElementsByClassName("hasWatchData");

function showData(selected) {
	for (element of watchListItems) {
		if (element != selected) {
			element.classList.remove("showData");
		} else {
			element.classList.toggle("showData");
		}
	}
}
