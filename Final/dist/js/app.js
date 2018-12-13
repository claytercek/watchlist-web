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
var results = [];

function updateInput() {
	var input = $("#search").val();

	if (input.length < 1) {
		main.html("");
		return;
	}

	var body = {
		content_types: ["show", "movie"],
		page: 1,
		page_size: 10,
		query: input
	};

	$.get("https://apis.justwatch.com/content/titles/en_US/popular?body=" + JSON.stringify(body), function(data, status) {
		console.log(data);

		main.html("");
		results = data.items;

		$.each(results, function(index, data) {
			main.append(`
			<article class="hasAddButton">
				<div class="imgWrapper"><img src="https://images.justwatch.com${data.poster.replace("{profile}", "s166")}" alt="poster" /></div>
				<h2>${data.title}</h2>
				<p>
				${data.short_description}
				</p>
				<button onclick="addToWatchlist(${index})">add</button>
			</article>`);
		});
	});
}

function getWatchlist() {
	// Get all entries
	if (localStorage.getItem("watchlist") === null) {
		return [];
	}
	var entries = localStorage.getItem("watchlist");
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
	var entries = localStorage.getItem("archive");
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
	var entries = localStorage.getItem("deleted");
	// Convert string
	var parsedEntries = JSON.parse(entries);
	// Return the string
	return parsedEntries;
}

function addToWatchlist(index) {
	var watchlist = this.getWatchlist();
	var data = results[index];

	itemData = {
		imageUrl: `https://images.justwatch.com${data.poster.replace("{profile}", "s166")}`,
		title: data.title,
		overview: data.short_description,
		id: data.id,
		type: data.object_type,
		offers: data.offers
	};

	watchlist.push(itemData);
	newUpdatedEntries = JSON.stringify(watchlist);
	localStorage.setItem("watchlist", newUpdatedEntries);
	return (location.href = "index.html");
}

var providers = [8, 9, 15, 10, 27, 192, 3, 2, 37];
var providerObj = {
	8: "netflix",
	 9: "prime",
	 15: "hulu",
	 10: "amazon",
	 27: "hbo",
	 192: "youtube",
	 3: "google",
	 2: "apple",
	 37: "showtime"
}

function loadWatchlist() {
	main.listSwipe();
	watchlist = getWatchlist();

	console.log(watchlist[0]);

	$.get("https://apis.justwatch.com/content/titles/movie/171064/locale/en_US", function(data, status) {
		console.log(data);
	});

	$.each(watchlist, function(index, data) {
		main.append(`
		<div class="item--withSwipe watchItem" data-title="${data.title}">
			<button class="action" onclick="archiveWatchItem(${index})">complete</button>
			<article class="hasWatchData" onclick="showData(event, this)">
				<div class="imgWrapper"><img src="${data.imageUrl}" alt="Poster" /></div>
				<h2>${data.title}</h2>
				<p>
				${data.overview}
				</p>
				<section class="watchData noSwipe">
				</section>
			</article>
			<button class="action" onclick="deleteWatchItem(${index})" >delete</button>
		</div>
		`);


		links = {};

		$.each(data.offers, function(index, offer) {

			if (!providers.includes(offer.provider_id)) {
				return;
			}

			if (links[offer.provider_id]) {
				if (links[offer.provider_id].price < offer.retail_price) {
					return;
				}
			} 

			let price = (offer.monetization_type == "flatrate") ? "subscription" : "from $" + offer.retail_price;
			let href = (offer.urls.deeplink_ios) ? offer.urls.deeplink_ios : offer.urls.standard_web;
			
			links[offer.provider_id] = {
				href: href,
				id: offer.provider_id, //to change
				price: price
			}
			console.log(links)

		});
			
		$.each(links, function(index, link) {
			$(`.watchItem[data-title='${data.title}'] section.watchData`).append(`
				<a href="${link.href}" class="noSwipe">
					<img class="noSwipe" src="dist/img/logos/${providerObj[link.id]}.svg" alt="Logo" />
					<h3 class="noSwipe price">${link.price}</h3>
				</a>
			`);
		})

	});
}

function archiveWatchItem(index) {
	archive = getArchive();
	watchlist = getWatchlist();

	itemData = watchlist.splice(index, 1);
	archive.push(itemData[0]);

	newUpdatedWatchlist = JSON.stringify(watchlist);
	localStorage.setItem("watchlist", newUpdatedWatchlist);

	newUpdatedArchive = JSON.stringify(archive);
	localStorage.setItem("archive", newUpdatedArchive);
	element = $(".watchItem[data-title='" + itemData[0].title + "']");
	element[0].classList.add("animateOut");
}

function deleteWatchItem(index) {
	deleted = getDeleted();
	watchlist = getWatchlist();

	itemData = watchlist.splice(index, 1);
	deleted.push(itemData[0]);

	newUpdatedWatchlist = JSON.stringify(watchlist);
	localStorage.setItem("watchlist", newUpdatedWatchlist);

	newUpdatedDeleted = JSON.stringify(deleted);
	localStorage.setItem("deleted", newUpdatedDeleted);
	element = $(".watchItem[data-title='" + itemData[0].title + "']");
	element[0].classList.add("animateOut");
}

function deleteArchiveItem(index) {
	deleted = getDeleted();
	archive = getArchive();

	itemData = archive.splice(index, 1);
	deleted.push(itemData[0]);

	newUpdatedArchive = JSON.stringify(archive);
	localStorage.setItem("archive", newUpdatedArchive);

	newUpdatedDeleted = JSON.stringify(deleted);
	localStorage.setItem("deleted", newUpdatedDeleted);
	element = $(".watchItem[data-title='" + itemData[0].title + "']");
	element[0].classList.add("animateOut");
}

function loadArchive() {
	main.listSwipe({
		leftAction: false
	});
	archive = getArchive();
	$.each(archive, function(index, data) {
		main.append(`
		<div class="item--withSwipe watchItem" data-title="${data.title}">
			<article>
				<div class="imgWrapper"><img src="${data.imageUrl}" alt="poster" /></div>
				<h2>${data.title}</h2>
				<p>
				${data.overview}
				</p>
			</article>
			<button class="action" onclick="deleteArchiveItem(${index})" >delete</button>
		</div>
		`);
	});
}

function loadRecommended() {
	archive = getArchive();
	watchlist = getWatchlist();
	deleted = getDeleted();
	main.html("");

	var nameArray = [];
	$.each($.merge(archive, watchlist, deleted), function(index, data) {
		nameArray.push(data.title);
	});

	console.log(nameArray);

	$.each($.merge(archive, watchlist), function(index, data) {
		var url;

		if (data.type == "tv") {
			url = "https://api.themoviedb.org/3/movie/" + data.id + "/recommendations?api_key=0fa1071a92f1c0ec8136cf4446839afc&language=en-US&page=1";
		} else {
			url = "https://api.themoviedb.org/3/movie/" + data.id + "/recommendations?api_key=0fa1071a92f1c0ec8136cf4446839afc&language=en-US&page=1";
		}
		console.log(data.type);

		$.ajax({
			async: true,
			crossDomain: true,
			url: url,
			type: "GET"
		})
			.done(function(response) {
				results = response.results;

				$.each(results, function(index, data) {
					let name = data.name != null ? data.name : data.title;

					if (jQuery.inArray(name, nameArray) !== -1) {
						return true; //continue
					} else {
						nameArray.push(name);
					}

					main.append(`
				<article class="hasAddButton">
					<div class="imgWrapper"><img src="https://image.tmdb.org/t/p/w92/${data.poster_path}" alt="poster" /></div>
					<h2>${name}</h2>
					<p>
					${data.overview}
					</p>
					<button onclick="addToWatchlist(${index})">add</button>
				</article>
				`);
					return false; //break
				});
			})
			.catch(function(error) {
				console.error(error.responseText);
			});
	});
}
