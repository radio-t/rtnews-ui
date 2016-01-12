$(function() {
	var $rule = $('#rule');

	if ($rule.length) {
		var url = getParameterByName('url');
		var map = {
			domain: '.rule__domain',
			content: '.rule__content'
		};

		if (url != null) {
			$.ajax({
				url: APIPath.slice(0, -6) + 'ureadability/api/v1' + '/rule?url=http://' + url,
				type: 'GET',
				dataType: 'json'
			})
			.done(function(json) {
				$rule.data('data', json);

				for (var prop in map) {
					$(map[prop], $rule).val(json[prop]);
				}
			})
			.fail(function(response) {
				console.log("error while loading rule");
				console.log(response);
			});
		}

		$('.rule__save').click(function(event) {
			var json = {};
			var data = $rule.data('data');

			for (var prop in map) {
				json[prop] = $(map[prop], $rule).val();
			}

			if (url != null) {
				json.enabled = data.enabled;
				json.id = data.id;
				json.user = data.user;
			}

			$.ajax({
				url: APIPath.slice(0, -6) + 'ureadability/api/v1' + '/rule',
				type: 'POST',
				async: true,
				headers: authHeaders,
				data: JSON.stringify(json)
			})
			.done(function() {
				location.href = '/rules/';
			})
			.fail(function(response) {
				console.log("error while saving the rule");
				console.log(response);
			});
		});
	}
});
