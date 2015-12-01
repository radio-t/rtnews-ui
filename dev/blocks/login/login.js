$(function() {
	$('#login').submit(function(event) {
		$('#login .login__error').hide();

		var login = $(this).find('input[name=login]').val(),
			pass = $(this).find('input[name=password]').val()

		if (login && pass) { 
			$.ajax({
				url: APIPath + '/news/reload',
				type: 'PUT',
				cache: false,
				username: login,
				password: pass,
				headers: {
					'Authorization': 'Basic ' + btoa(login + ':' + pass)
				}
			})
			.done(function(response) {
				localStorage.setItem('login', login);
				localStorage.setItem('password', pass);
				
				var back = getParameterByName('back');

				if (back) {
					location.href = back;
				} else {
					location.href = '/admin/';
				}
			})
			.fail(function(response) {
				$('#login .login__error').show();
			});
		} 

		return false;
	});
});

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);

    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}