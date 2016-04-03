import Ember from 'ember';

export default Ember.Component.extend({
	name:'',
	phone:'',
	desc:'',
	date:'',
	actions: {
		closeInfo() {
			this.sendAction('closeInfoBar');
		}
	},
});
