import Ember from 'ember';

export default Ember.Route.extend({
		actions: {
    didTransition: function() {
		//Em.$('body').addClass('full');
		//Em.$('body').addClass('cars');
      return true; // Bubble the didTransition event
    },
	choseCar: function() {
		//Em.$('body').removeClass('legs');
		//Em.$('body').addClass('cars');
		//this.get('currentBg').set('cars');
		//alert(this.controller.get('currentBg'));
		this.controller.get('isDriver').set('is_driver', true);
//alert(this.controller.get('isDriver').get('is_driver'));
		this.controller.set('currentBg', 'cars')
      return true; // Bubble the didTransition event
	  
    },
	choseLeg: function() {
		//Em.$('body').removeClass('cars');
		//Em.$('body').addClass('legs');
		this.controller.get('isDriver').set('is_driver', false);
		//alert(this.controller.get('isDriver').get('is_driver'));
		this.controller.set('currentBg', 'legs')

      return true; // Bubble the didTransition event
    }
	
	
	}
});
