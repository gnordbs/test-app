import Ember from 'ember';

export default Ember.Component.extend({
	
	authManager: Ember.inject.service('session'),
	isregistering: false,
	registertext:Ember.computed('isregistering', function() {
		if(this.get('isregistering')){
			return 'switch to login';	
		} else {
			return 'switch to register';	
		}
	}),
	registertextHead:Ember.computed('isregistering', function() {
		if(this.get('isregistering')){
			return 'register page';	
		} else {
			return 'Login page';
		}
	}),

	actions: {
		authenticate() {
			const { login, password } = this.getProperties('login', 'password');
			this.get('authManager').authenticate('authenticator:oauth2', login, password).then(() => {
				//alert('Success!');
			}, (reason) => {
				alert(reason.error_description);
				//alert('Error obtaining token---: ' + err.responseText);
			});
		},
		logout(){
			this.get('authManager').invalidate().then(() => {
				alert('Success! ');
				}, (reason) => {
				alert(reason.error_description);
				//alert('Error o-: ' + err.responseText);
			});
		},
		register() {
			const { login, password } = this.getProperties('login', 'password');
			
			Ember.$.ajax({
				method: "POST",
				url: "http://54.187.251.191:1337/api/users",
				data: { username: login, password: password }
				}).then(() => {
					alert('Success!');
			});
		},
		isregistering()	{
			if(this.get('isregistering')){
				this.set('isregistering', false);	
			} else {
				this.set('isregistering', true);	
			}	
		}
	}		
});
