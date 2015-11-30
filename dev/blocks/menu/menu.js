$(function() {
	$('#update-feeds').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: 'http://master.radio-t.com:8778/api/v1/news/reload',
			type: 'PUT',
			headers: {
			    "Authorization": "Basic " + btoa(login + ":" + pass)
			}
		})
		.done(function() {
			location.reload();
		})
		.fail(function(response) {
			console.log("error while updating feeds");
			console.log(response);
		});
	});

	$('#logout').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: 'http://master.radio-t.com:8778/api/v1/news/reload',
			type: 'PUT',
			headers: {
			    "Authorization": "Basic " + btoa('colloportus')
			}
		})
		.fail(function(response) {
			location.href = 'login.html';
			localStorage.removeItem('login');
			localStorage.removeItem('password');
		});
	});
});