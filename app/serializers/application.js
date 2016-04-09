import DS from 'ember-data';
/*
export default DS.JSONAPISerializer.extend({
	primaryKey: '_id',
    serializeId: function(id) {
        return id.toString();
    }
});
*/


//export default DS.RESTSerializer.extend({
export default DS.JSONAPISerializer.extend({
	//primaryKey: '_id',
   /* serializeId: function(id) {
        return id.toString();
    },	*/
	normalizeArrayResponse(store, primaryModelClass, payload, id, requestType) {
		/*for (var i = 0; i < payload.length; i++){
			payload[i].attributes = payload[i].attr.data.attributes;
			payload[i].type = payload[i].attr.data.type;
			delete  payload[i]._v;
			delete payload[i].attr;
		}
		var newPayload = {data: payload};	
		return this._super(store, primaryModelClass, newPayload, id, requestType);*/
		
		return this._super(store, primaryModelClass, payload, id, requestType);
	},
	normalizeSingleResponse(store, primaryModelClass, payload, id, requestType) {	
		/*for (var i = 0; i < 1; i++){
			payload.attributes = payload.attr.data.attributes;
			payload.type = payload.attr.data.type;
			delete payload.attr;
		}
		var newPayload = {data: payload};		
		return this._super(store, primaryModelClass, newPayload, id, requestType);	*/	
		return this._super(store, payload, payload, id, requestType);
	},		
});