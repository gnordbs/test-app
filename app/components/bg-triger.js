import Ember from 'ember';

export default Ember.Component.extend({
	 mouseEnter: function(event) {
	   //Em.$('body').removeClass('full');
	   this.sendAction('hovered');
  } 	
});
