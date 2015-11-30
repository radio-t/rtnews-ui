$(function() {
	$('#update-feeds').click(function(event) {
		event.preventDefault();

		$.ajax({
			url: APIPath + '/news/reload',
			type: 'PUT',
			headers: authHeaders
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
			url: APIPath + '/news/reload',
			type: 'PUT',
			headers: {
			    "Authorization": "Basic " + btoa('colloportus')
			}
		})
		.fail(function(response) {
			location.href = '/login/';
			localStorage.removeItem('login');
			localStorage.removeItem('password');
		});
	});
});