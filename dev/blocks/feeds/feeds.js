$(function() {
	function loadFeeds() {
		$('#feeds__list').html('');

		$.ajax({
			url: 'http://master.radio-t.com:8778/api/v1/feeds',
			type: 'GET',
			dataType: 'json'
		})
		.done(function(json) {
			var $row,
				$urlCell,
				$updateCell,
				$delCell,
				date = new Date(),
				updated;

			for (var i = 0; i < json.length; i++) {
				date.setTime(Date.parse(json[i].updated));
				updated = date.toLocaleDateString() 
				     	+ ' в&nbsp;'
				     	+ date.toLocaleTimeString().replace(/(:\d{2}| [AP]M)$/, '');

				$row = $('<tr/>');
				
				$row.data('id', json[i].id);

				$urlCell = $('<td/>', {
						class: 'feeds__urls',
						text:  json[i].feedlink
					})
					.attr('title', json[i].feedlink)
					.appendTo($row);
				
				$updateCell = $('<td/>', {
					class: 'feeds__update',
					html: updated
				}).appendTo($row);

				$delCell = $('<td class="feeds__del"><a href="#" class="link">Удалить</a></td>');
				$delCell.appendTo($row);

				$delCell.find('.link').click(function(event) {
					event.preventDefault();

					var $curRow = $(this).closest('tr'),
						id = $curRow.data('id');

					$.ajax({
						url: 'http://master.radio-t.com:8778/api/v1/feeds/' + id,
						type: 'DELETE',
						headers: {
						    "Authorization": "Basic " + btoa(login + ":" + pass)
						}
					})
					.done(function() {
						$curRow.slideUp(function() {
							$(this).remove();
						});
					})
					.fail(function(response) {
						console.log("error while deleting the feed");
						console.log(response);
					});
				});

				$('#feeds__list').append($row);
			};
		})
		.fail(function(response) {
			console.log("error while loading feeds");
			console.log(response);
		});
	}

	if ($('#feeds__list').length) {
		loadFeeds();

		$('#feeds__add-form').submit(function(event) {
			var $form = $(this);

			$.ajax({
				url: 'http://master.radio-t.com:8778/api/v1/feeds',
				type: 'POST',
				async: true,
				data: '{ "feedlink": "' + $('#feeds__add').val() + '" }',
				headers: {
				    "Authorization": "Basic " + btoa(login + ":" + pass)
				}
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