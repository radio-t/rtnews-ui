$(function() {
	if ($('#feeds__list').length) {
		loadFeeds();

		$('#feeds__add-form').submit(function(event) {
			var $form = $(this);

			$.ajax({
				url: APIPath + '/feeds',
				type: 'POST',
				async: true,
				data: '{ "feedlink": "' + $('#feeds__add').val() + '" }',
				headers: authHeaders
			})
			.done(function() {
				loadFeeds();
				$form.trigger('reset');
			})
			.fail(function(response) {
				console.log("error while adding feed");
				console.log(response);
			});

			return false;
		});
	}
});

function loadFeeds() {
	$('#feeds__list').html('');

	$.ajax({
		url: APIPath + '/feeds',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(json) {
		var $row,
			$delCell,
			date = new Date(),
			updated;

		for (var i = 0; i < json.length; i++) {
			date.setTime(Date.parse(json[i].updated));
			updated = date.toLocaleDateString() 
			     	+ ' в&nbsp;'
			     	+ date.toLocaleTimeString().replace(/(:\d{2}| [AP]M)$/, '');

			$row = $('<tr/>').data('id', json[i].id);

			$('<td/>', {
					class: 'feeds__urls',
					text:  json[i].feedlink
				})
				.attr('title', json[i].feedlink)
				.appendTo($row);
			
			$('<td/>', {
				class: 'feeds__update',
				html: updated
			}).appendTo($row);

			$delCell = $('<td class="feeds__del"><a href="#" class="link">Удалить</a></td>');
			$delCell.appendTo($row);

			$delCell.find('.link').click(function(event) {
				event.preventDefault();

				delFeed($(this).closest('tr'));
			});

			$('#feeds__list').append($row);
		};
	})
	.fail(function(response) {
		console.log("error while loading feeds");
		console.log(response);
	});
}

function delFeed($row) {
	var id = $row.data('id');

	$.ajax({
		url: APIPath + '/feeds/' + id,
		type: 'DELETE',
		headers: authHeaders
	})
	.done(function() {
		$row.remove()
	})
	.fail(function(response) {
		console.log("error while deleting the feed");
		console.log(response);
	});
}