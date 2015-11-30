$(function() {
	if ($('#add-news').length) {
		$('#add-news').submit(function(event) {
			var $form = $(this);

			$.ajax({
				url: APIPath + '/news',
				type: 'POST',
				async: true,
				data: '{ "link": "' + $('#add__url').val() + '" }',
				headers: authHeaders
			})
			.done(function() {
				$form.trigger('reset');
				notify('Новость добавлена', null, 1500);
			})
			.fail(function(response) {
				console.log("error while adding news");
				console.log(response);
			});

			return false;
		});
	}
});