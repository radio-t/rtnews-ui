$(function() {
	if (isAdmin) {
		$('#start')
			.show()
			.click(function(event) {
				event.preventDefault();

				$.ajax({
					url: APIPath + '/show/start',
					type: 'PUT',
					headers: authHeaders
				})
				.done(function(json) {
					$('html, body').scrollTop(0);
					notify('Поехали!', null, 1500);
				})
				.fail(function(response) {
					console.log("error while starting show");
					console.log(response);
				});
			});
	}
});