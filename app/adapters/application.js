import DS from 'ember-data';
/*
export default DS.JSONAPIAdapter.extend({
	namespace: 'api',
	host: 'http://localhost:4500'
});

*/

//export default DS.RESTAdapter .extend({
export default DS.JSONAPIAdapter .extend({	
	namespace: 'api',
	//host: 'http://localhost:4500'
	host: 'http://54.213.148.158:4500'
});