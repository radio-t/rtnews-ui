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