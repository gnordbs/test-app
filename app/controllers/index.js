import Ember from 'ember';

export default Ember.Controller.extend({
	currentBg:"cars",
	isDriver: Ember.inject.service('isdriver')
});
