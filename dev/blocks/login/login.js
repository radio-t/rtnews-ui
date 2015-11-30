$(function() {
	function getParameterByName(name) {
	    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	        results = regex.exec(location.search);

	    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
	}

	$('#login').submit(function(event) {
		$('#login .login__error').hide();

		var login = $(this).find('input[name=login]').val(),
			pass = $(this).find('input[name=password]').val()

		if (login && pass) {
			$.ajax({
				url: 'http://master.radio-t.com:8778/api/v1/news/reload',
				type: 'PUT',
				headers: {
				    "Authorization": "Basic " + btoa(login + ":" + pass)
				}
			})
			.done(function(response) {
				localStorage.setItem('login', login);
				localStorage.setItem('password', pass);
				
				var back = getParameterByName('back');

				if (back) {
					location.href = back;
				} else {
					location.href = 'admin.html';
				}
			})
			.fail(function(response) {
				$('#login .login__error').show();
			});
		} 

		return false;
	});
});