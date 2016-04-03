import Ember from 'ember';

export default Ember.Component.extend({
	 mouseEnter: function(event) {
    //alert('hahaha');
	//this.set("hovertest.ishidden2", 'hidden');
	//this.set("hovertest.ishidden1", 'hidden');
	
	this.sendAction('gogogo');
	//alert('hahaha2');
  }    

});
