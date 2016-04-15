import Ember from 'ember';

export default Ember.Component.extend({
	 mouseEnter: function() {
	   this.sendAction('hovered');
  } 	
});
