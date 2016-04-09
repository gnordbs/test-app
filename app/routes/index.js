import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		didTransition: function() {
		  return true; // Bubble the didTransition event
		},
		choseCar: function() {
			this.controller.get('isDriver').set('is_driver', true);
			this.controller.set('login_class', 'login_page_active');
			this.controller.set('currentBg', 'cars')
			return true; // Bubble the didTransition event	  
		},
		choseLeg: function() {
			this.controller.get('isDriver').set('is_driver', false);
			this.controller.set('login_class', 'login_page_inactive');
			this.controller.set('currentBg', 'legs')
			return true; // Bubble the didTransition event
		}
	}
});
