import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
			setgogogo : function () {
				//alert('got this');
				
				if(this.controller.get('ishidden2') == 'hidden'){
					this.controller.set('ishidden2','');
				} else {
					this.controller.set('ishidden2','hidden');
				}
				
				if(this.controller.get('ishidden1') == 'hidden'){
					this.controller.set('ishidden1','');
				} else {
					this.controller.set('ishidden1','hidden');
				}
				//this.controller.set('ishidden2','');
				//this.controller.set('ishidden1','');
			}
	}
	
});
