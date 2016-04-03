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
	primaryKey: '_id',
   /* serializeId: function(id) {
        return id.toString();
    },	*/
	normalizeArrayResponse(store, primaryModelClass, payload, id, requestType) {

		for (var i = 0; i < payload.length; i++){
			//payload[i].id = payload[i]._id;		
			payload[i].attributes = payload[i].attr.data.attributes;
						payload[i].type = payload[i].attr.data.type;

			//var newType = payload[i].attr.data.type.substring(0,payload[i].attr.data.type.length-1);
			//payload[i].type = newType;
			//delete  payload[i]._id;	
			delete  payload[i]._v;
			delete payload[i].attr;
		}
		var newPayload = {data: payload};	
		return this._super(store, primaryModelClass, newPayload, id, requestType);
		
		//return {data: payload};
	
		/*
		for (var i = 0; i < payload.length; i++){
			payload[i].id = payload[i]._id;		
			delete  payload[i]._id;		
		}			
		return {data: payload };*/
	},
	normalizeSingleResponse(store, primaryModelClass, payload, id, requestType) {	
		
		for (var i = 0; i < 1; i++){
			//payload.id = payload._id;		
			payload.attributes = payload.attr.data.attributes;
			payload.type = payload.attr.data.type;
			//delete  payload._id;	
			delete payload.attr;
		}
		var newPayload = {data: payload};		
		return this._super(store, primaryModelClass, newPayload, id, requestType);		
		
		//return {data: payload};
	
		/*for (var i = 0; i < payload.length; i++){
			payload[i].id = payload[i]._id;		
			delete  payload[i]._id;		
		}			
		return {data: payload };*/
	},		
});