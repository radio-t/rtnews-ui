$(function() {
	if ($('#rules__list').length) {
		loadRules();
	};
});

function loadRules() {
	$('#rules__list').html('');

	$.ajax({
		url: APIPath.slice(0, -6) + 'ureadability/api/v1' + '/rules',
		type: 'GET',
		dataType: 'json'
	})
	.done(function(json) {
		var $row;

		for (var i = 0; i < json.length; i++) {
			$row = $('<tr/>').data('data', json[i]);

			$('<td/>', {
				class: 'rules__domain-cell',
				html: '<a href="/rules/edit/?url=' + json[i].domain + '" class="link">' + json[i].domain + '</a>'
			}).appendTo($row);
			
			$('<td/>', {
				class: 'rules__content-cell',
				text: json[i].content
			}).appendTo($row);

			$('<td/>', {
				class: 'rules__enabled-cell',
				html: '<input class="rules__enabled" type="checkbox" ' + ((json[i].enabled) ? 'checked' : '') + '>' 
			}).appendTo($row);

			if (!json[i].enabled) {
				$row.addClass('rules__row_disabled');
			}

			$('#rules__list').append($row);
		};


		$('.rules__enabled').change(function(event) {
			event.preventDefault();

			toggleRule($(this).closest('tr'));
		});
	})
	.fail(function(response) {
		console.log("error while loading rules");
		console.log(response);
	});
}

function toggleRule($row) {
	var data = $row.data('data');

	data.enabled = !data.enabled;

	if (data.enabled) {
		$.ajax({
			url: APIPath.slice(0, -6) + 'ureadability/api/v1' + '/rule',
			type: 'POST',
			async: true,
			headers: authHeaders,
			data: JSON.stringify(data)
		})
		.done(function() {
			$row.data('data', data);
			$row.removeClass('rules__row_disabled');
		})
		.fail(function(response) {
			console.log("error while enabling the rule");
			console.log(response);
		});
	} else {
		$.ajax({
			url: APIPath.slice(0, -6) + 'ureadability/api/v1' + '/rule/' + data.id,
			type: 'DELETE',
			async: true,
			headers: authHeaders
		})
		.done(function() {
			$row.data('data', data);
			$row.addClass('rules__row_disabled');
		})
		.fail(function(response) {
			console.log("error while disabling the rule");
			console.log(response);
		});
	}
}