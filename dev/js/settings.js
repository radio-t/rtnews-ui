var APIPath = 'http://master.radio-t.com:8778/api/v1',
	authHeaders = {
		'Authorization': 'Basic ' + btoa(localStorage.getItem('login') + ':' + localStorage.getItem('password'))
	};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function formatDate(date) {
	var day = ('0' + date.getDate()).slice(-2),
		month = ('0' + (date.getMonth() + 1)).slice(-2),
		year = date.getFullYear(),
		hours = ('0' + date.getHours()).slice(-2),
		mins = ('0' + date.getMinutes()).slice(-2);

	return day + '.' + month + '.' + year + ' в&nbsp;' + hours + ':' + mins;
}