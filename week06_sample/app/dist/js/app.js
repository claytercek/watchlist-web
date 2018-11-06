function init() {
  setCurrentPage();
}

function setCurrentPage() {
  //get path of url
  var url = window.location.pathname;
  var page = url.substring(url.lastIndexOf('/') + 1);
  console.log(page);
  //find the mathching element with that url
  var currentPage = document.querySelector('[data-page="' + page + '"]');
  //give that element a class of is-active
  currentPage.classList.add('is-active');
}

function routeTo(pathToPage) {
  location.href = pathToPage;
}

function checkForAppUpdates() {
  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
      if (confirm('Updates are available for this mobile web app. Load them?')) {
        window.applicationCache.swapCache();
        window.location.reload();
      }
    }
  });
}
