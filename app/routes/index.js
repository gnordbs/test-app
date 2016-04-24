import Ember from 'ember';

import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

export default Ember.Route.extend(ApplicationRouteMixin,{
	actions: {
		didTransition: function() {
		  return true; // Bubble the didTransition event
		},
		choseCar: function() {
			this.controller.set('login_class', 'login_page_active');
			this.controller.set('currentBg', 'cars');
			return true; // Bubble the didTransition event	  
		},
		choseLeg: function() {
			this.controller.set('login_class', 'login_page_inactive');
			this.controller.set('currentBg', 'legs');
			return true; // Bubble the didTransition event
		}
	}
});
