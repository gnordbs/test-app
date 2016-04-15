import Ember from 'ember';

export default Ember.Controller.extend({
	authManager: Ember.inject.service('session'),	
	init: function () {
		this._super();
		
		// set current date
		var today = new Date();
		var year = today.getFullYear();
		var month = today.getMonth();
		var day = today.getDate();
		if(day < 10){day = '0' + day};
		if(month < 10){month = '0' + month};
		var formatedToday = year + '-' + month + '-' + day;
		this.infoEndDate = formatedToday;
	},
	isdriverService: Ember.inject.service('isdriver'),
	isDriver: Ember.computed('isdriverService', function() {
		//alert(this.get('isdriverService').get('is_driver'));
		return this.get('isdriverService').get('is_driver');		
	}),
	currentUserId: '',
	currentRouteOnMap: [],
	dispPolylineArray: [],
	tolerance: 0.0043333333,
	routeDescription: [],
	descName:'',
	phoneNumber: '',
	isShowingInputDescription: false,
	isShowingOutputDescription: false,
	startMarker:null,
	endMarker: null,
	startMarkerFind:null,
	endMarkerFind: null,
	savedPlaces:[],
	infoName:'',
	infoDesc:'',
	infoPhone:'',
	infoStartPlaceId: null,
	infoEndPlaceId: null,
	infoIsInterciry: false,
	infoBothDirection: true,
	infoIsOneTime: false,
	infoEndDate: '',
	infoParcedCountries:[],
	parcingBorderName:'',
	filterOptionsOneDay: false,
	filterOptionsBothDirections:false,
	filterOptionsStartId: null,
	filterOptionsEndId: null,
	descriptionStyle:Ember.computed('isShowingOutputDescription', function() {
		if(this.get('isShowingOutputDescription')){
			return 'visibility: visible';	
		} else {
			return 'visibility: hidden';	
		}
	}),
	leftMenuContStyle:Ember.computed('isShowingOutputDescription','isShowingInputDescription', function() {
		if(this.get('isShowingOutputDescription')||this.get('isShowingInputDescription')){
			return 'left_menu_cont';	
		} else {
			return 'left_menu_cont_dis';	
		}
	}),
	actions: {
		clIfB:function(){
			this.send('closeInfoR');
		}
	}
});
