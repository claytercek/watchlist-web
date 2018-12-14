

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

function showData(event, selected) {
	for (element of watchListItems) {
		if (element != selected) {
			element.classList.remove("showData");
		} else {
			element.classList.toggle("showData");
		}
	}
}


// API STUFF

const main = $("main");
var results = []


function updateInput() {
	var input = $("#search").val();

	if (input.length < 1) {
		main.html("");
		return;
	}

	var type = $("input[type=radio]:checked").attr('id');
	var url;
	if (type == "movie") {
		url = "https://api.themoviedb.org/3/search/movie?api_key=0fa1071a92f1c0ec8136cf4446839afc&language=en-US&page=1&include_adult=false&query=" + input
	} else {
		url = "https://api.themoviedb.org/3/search/tv?api_key=0fa1071a92f1c0ec8136cf4446839afc&language=en-US&page=1&query=" + input
	}

	
	$.ajax({
		"async": true,
		"crossDomain": true,
		"url": url,
		"type": "GET"
	}).done( function(response) {
		main.html("");
		results = response.results;

		$.each(response.results, function(index, data) {
			let name = data.name != null ? data.name : data.title;


			main.append( `
			<article class="hasAddButton">
				<div class="imgWrapper">${ (data.poster_path) ? "<img src='https://image.tmdb.org/t/p/w92/" + data.poster_path + "' />" : "" }</div>
				<h2>${name}</h2>
				<p>
				${data.overview}
				</p>
				<button onclick="addToWatchlist(${index})">add</button>
			</article>
			`
		)})

	}).catch( function(error) {
		console.error(error.responseText)
	})
}

function getWatchlist() {
	// Get all entries
	if (localStorage.getItem("watchlist") === null) {
		return [];
	}
	var entries = localStorage.getItem('watchlist');
	// Convert string
	var parsedEntries = JSON.parse(entries);
	// Return the string
	return parsedEntries;
}

function getArchive() {
	// Get all entries
	if (localStorage.getItem("archive") === null) {
		return [];
	}
	var entries = localStorage.getItem('archive');
	// Convert string
	var parsedEntries = JSON.parse(entries);
	// Return the string
	return parsedEntries;
}

function getDeleted() {
	// Get all entries
	if (localStorage.getItem("deleted") === null) {
		return [];
	}
	var entries = localStorage.getItem('deleted');
	// Convert string
	var parsedEntries = JSON.parse(entries);
	// Return the string
	return parsedEntries;
}

function addToWatchlist(index) {
	var watchlist = this.getWatchlist();
	var data = results[index];
	var type = $("input[type=radio]:checked").attr('id');

	itemData = {
		imageUrl: "https://image.tmdb.org/t/p/w92/" +data.poster_path,
		title: data.name != null ? data.name : data.title,
		overview: data.overview,
		movie_id: data.id,
		type : type,
		id: Math.floor(100000 + Math.random() * 900000)
		
	}

	watchlist.push(itemData);
	newUpdatedEntries = JSON.stringify(watchlist);
	localStorage.setItem('watchlist', newUpdatedEntries);
	return location.href = 'index.html';

}

function loadWatchlist() {

	checkForAppUpdates();

	main.listSwipe();
	watchlist = getWatchlist();

	console.log("loading watchlist")

	$.each(watchlist, function(index, data) {
		main.append(`
		<div class="item--withSwipe watchItem" data-title="${data.title}" data-id="${data.id}">
			<button class="action" onclick="archiveWatchItem(${data.id})">complete</button>
			<article onclick="showData(event, this)">
				<div class="imgWrapper">${ (data.imageUrl) ? "<img src='" +data.imageUrl + "' />" : "" }</div>
				<h2>${data.title}</h2>
				<p>
				${data.overview}
				</p>
			</article>
			<button class="action" onclick="deleteWatchItem(${data.id})" >delete</button>
		</div>
		`)
	})
}

function archiveWatchItem(id) {
	let archive = getArchive();
	let watchlist = getWatchlist();

	var index = watchlist.findIndex(function(item) {
		console.log(item.id == id, item.id, id)
		return item.id == id;
	})

	console.log(index);

	itemData = watchlist.splice(index, 1);
	archive.push(itemData[0]);

	newUpdatedWatchlist = JSON.stringify(watchlist);
	localStorage.setItem('watchlist', newUpdatedWatchlist);

	newUpdatedArchive = JSON.stringify(archive);
	localStorage.setItem('archive', newUpdatedArchive);
	element = $(".watchItem[data-id='" + id + "']");
	element[0].classList.add("animateOut");
}

function deleteWatchItem(id) {
	let deleted = getDeleted();
	let watchlist = getWatchlist();

	let index = watchlist.findIndex(x => x.id === id);

	itemData = watchlist.splice(index, 1);
	deleted.push(itemData[0]);

	newUpdatedWatchlist = JSON.stringify(watchlist);
	localStorage.setItem('watchlist', newUpdatedWatchlist);

	newUpdatedDeleted = JSON.stringify(deleted);
	localStorage.setItem('deleted', newUpdatedDeleted);
	element = $(".watchItem[data-id='" + id + "']");
	element[0].classList.add("animateOut");
}

function deleteArchiveItem(id) {
	let deleted = getDeleted();
	let archive = getArchive();

	let index = archive.findIndex(x => x.id === id);

	itemData = archive.splice(index, 1);
	deleted.push(itemData[0]);

	newUpdatedArchive = JSON.stringify(archive);
	localStorage.setItem('archive', newUpdatedArchive);

	newUpdatedDeleted = JSON.stringify(deleted);
	localStorage.setItem('deleted', newUpdatedDeleted);
	element = $(".watchItem[data-id='" + id+ "']");
	element[0].classList.add("animateOut");
}

function loadArchive() {
	main.listSwipe({
		leftAction: false
	});
	archive = getArchive();
	$.each(archive, function(index, data) {

		main.append( `
		<div class="item--withSwipe watchItem" data-title="${data.title}" data-id="${data.id}">
			<article>
				<div class="imgWrapper">${ (data.imageUrl) ? "<img src='" +data.imageUrl + "' />" : "" }</div>
				<h2>${data.title}</h2>
				<p>
				${data.overview}
				</p>
			</article>
			<button class="action" onclick="deleteArchiveItem(${data.id})" >delete</button>
		</div>
		`
	)})
}

function loadRecommended() {
	archive = getArchive();
	watchlist = getWatchlist();
	deleted = getDeleted();
	main.html("");

	var nameArray = [];
	$.each($.merge(archive, watchlist, deleted), function(index, data) {
		nameArray.push(data.title);
	})

	$.each($.merge(archive, watchlist), function(index, data) {
		var url; 

		if (data.type == "tv") {
			url = "https://api.themoviedb.org/3/movie/" + data.movie_id  +"/recommendations?api_key=0fa1071a92f1c0ec8136cf4446839afc&language=en-US&page=1"
		} else {
			url = "https://api.themoviedb.org/3/movie/" + data.movie_id + "/recommendations?api_key=0fa1071a92f1c0ec8136cf4446839afc&language=en-US&page=1"
		}

		$.ajax({
			"async": true,
			"crossDomain": true,
			"url": url,
			"type": "GET"
		}).done( function(response) {
			results = response.results;
	
			$.each(results, function(index, data) {
				let name = data.name != null ? data.name : data.title;

				if(jQuery.inArray(name, nameArray) !== -1) {
					return true; //continue
				} else {
					nameArray.push(name)
				}
	
				main.append( `
				<article class="hasAddButton">
				<div class="imgWrapper">${ (data.poster_path) ? "<img src='https://image.tmdb.org/t/p/w92/" + data.poster_path + "' />" : "" }</div>
					<h2>${name}</h2>
					<p>
					${data.overview}
					</p>
					<button onclick="addToWatchlist(${index})">add</button>
				</article>
				`
				)
				return false; //break
			})

		}).catch( function(error) {
			console.error(error.responseText)
		})
	});
}