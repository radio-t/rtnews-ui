$(function() {
	$('#login').submit(function(event) {
		$('#login .login__error').hide();

		var login = $(this).find('input[name=login]').val(),
			pass = $(this).find('input[name=password]').val()

		if (login && pass) { 
			var request = new XMLHttpRequest();   

			request.open('PUT', APIPath + '/news/reload', true, login, pass);                                                                                                                               
			request.setRequestHeader('Authorization', 'Basic ' + btoa(login + ':' + pass));
			
		    request.onreadystatechange = function(event) {  
		        if (request.readyState === 4) {  
		            if (request.status !== 200) {  
						$('#login .login__error').show();  
		            } else {  
						localStorage.setItem('login', login);
						localStorage.setItem('password', pass);
						
						var back = getParameterByName('back');

						if (back) {
							location.href = back;
						} else {
							location.href = '/admin/';
						}
		            }  
		        }  
		    }; 

		    request.send();    
		} 

		return false;
	});
});