var APIPath = 'https://master.radio-t.com:8778/api/v1',
	disqusID = 'radiotnewstest',
	login = localStorage.getItem('login'),
	password = localStorage.getItem('password'),
	authHeaders = {
		'Authorization': 'Basic ' + btoa(login + ':' + password)
	},
	isMobile =  /Android|iPhone|iPad|iPod|IEMobile|Windows Phone|Opera Mini/i.test(navigator.userAgent);

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getSlug() {
	var path = location.pathname;

	if (path.substr(-1) === '/') {
		path = path.substr(0, path.length - 1);
	}

	var parts = path.split('/');

	return parts[parts.length - 1];
}

function formatDate(date) {
	var day = ('0' + date.getDate()).slice(-2),
		month = ('0' + (date.getMonth() + 1)).slice(-2),
		year = date.getFullYear(),
		hours = ('0' + date.getHours()).slice(-2),
		mins = ('0' + date.getMinutes()).slice(-2);

	return day + '.' + month + '.' + year + ' в&nbsp;' + hours + ':' + mins;
}