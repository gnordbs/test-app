import Ember from 'ember';

export default Ember.Component.extend({
	authManager: Ember.inject.service('session'),
	actions: {
		register() {
			const { login, password } = this.getProperties('login', 'password');

			Ember.$.ajax({
				method: "POST",
				url: "http://54.213.148.158:1337/api/users",
				data: { username: login, password: password }
				}).then((result) => {
					alert(result);
			});
		}
	}		
});
