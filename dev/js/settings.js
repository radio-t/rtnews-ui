var APIPath = 'http://master.radio-t.com:8778/api/v1',
	authHeaders = {
		"Authorization": "Basic " + btoa(localStorage.getItem('login') + ":" + localStorage.getItem('password'))
	};
