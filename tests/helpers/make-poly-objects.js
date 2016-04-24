import Ember from 'ember';

export default function makePolyObjects(total) {

	const polyObjects = [];
	
	for(let i = 0; i < total; i++){
		/*
		var polylineContainer = {
			routeId: 'test_id_'+i,
			polyline: 'test_polyline_'+i,
			storedDescription: 'test_description_'+i,
			storedName: 'test_name',
			storedPhone: 'test_phone',
			isBothDirection: 'test_isBothDirection',
			descriptionDate: '01.01.1970',
			isOneTime: 'test_isOneTime',
			expanded: false,
		};*/
			
		const polylineContainer = Ember.Object.extend({
			routeId: 'test_id_'+i,
			polyline: 'test_polyline_'+i,
			storedDescription: 'test_description_'+i,
			storedName: 'test_name',
			storedPhone: 'test_phone',
			isBothDirection: 'test_isBothDirection',
			descriptionDate: '01.01.1970',
			isOneTime: 'test_isOneTime',
			expanded: false,		
		}).create();	
			
			
		polyObjects.push(polylineContainer);	
		
	}
		
	return polyObjects; 
}
