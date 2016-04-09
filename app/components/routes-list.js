import Ember from 'ember';

export default Ember.Component.extend({
	actions: {
		hitDescription: function(route) {      
			if(route.expanded) {
				Ember.set(route, 'expanded', false);			
			} else {	
				this.sendAction('routeChosen', route.routeId);
				Ember.set(route, 'expanded', true);		
			}
		}
	}
});
