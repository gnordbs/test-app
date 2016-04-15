import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';


//export default DS.RESTAdapter .extend({
export default DS.JSONAPIAdapter .extend(DataAdapterMixin,{	
	namespace: 'api',
	//host: 'http://localhost:4500',
	host: 'http://54.187.251.191:1337',
	authorizer: 'authorizer:application'
});