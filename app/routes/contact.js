import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		didTransition: function() {
		Em.$('body').addClass('full');
      return true; // Bubble the didTransition event
    }
}
});
