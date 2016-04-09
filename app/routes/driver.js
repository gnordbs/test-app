import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
    actions: {
		willTransition(transition) {
			this.controller.set('dispPolylineArray', []);			
		},
		initMap: function() {
			var self = this;
            this.initMyMap(this);
			this.clearMarkers();
			this.clearAllBar();
			
			this.findBorderCrossWord();
			
			this.store.queryRecord('user', {}).then(function (data) {
				self.controller.set('currentUserId', data.id);
				self.loadRoutesForUser(data);				
			});
		},
		clearMyRoute:function(){
			this.clearRoutesMenu();
			
		},
		saveRouteDescription:function(){
			this.saveCurrentRoute();	
		},
		saveSearchOptions:function(){
			this.getPathFromStore();	
		},
		routeChosen:function(idnum) {
			this.highlightPath(idnum);
		}
	},
	startPointChosen:function(data){
		var self = this;
		var point = this.controller.get('startMarker');
		if(point){
			point.setMap(null);
			point = null;	
		}	
		
		var mark = new google.maps.Marker({
			position: data,
			map: map,
		});
				
		this.controller.set('startMarker', mark);

		this.updateRoute();
		
		getInfoForPoint(data,  function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if(results)	{
					self.controller.set('infoStartPlaceId', results);	
				}
			} else {
				console.log(status);
			}
		});

		
/*
		this.store.queryRecord('user', {}).then(function (data) {
			var foo = data.get('routes');
			self.displayUnhilteredResults(foo)
			console.log(foo);	
		});*/
		
		//console.log('start = ',data.lat(), data.lng());
	},	
	endPointChosen:function(data){
		var self = this;	
		var point = this.controller.get('endMarker');
		if(point){
			point.setMap(null);
			point = null;	
		}	
		
		var mark = new google.maps.Marker({
			position: data,
			map: map,
		});		
		this.controller.set('endMarker', mark);
		
		this.updateRoute();	

		getInfoForPoint(data,  function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if(results)	{
					self.controller.set('infoEndPlaceId', results);	
				}
			} else {
				console.log(status);
			}
		});
		
		//console.log('end = ',data.lat(), data.lng());
	},
	clearMarkers:function(){
		var point = this.controller.get('endMarker');
		if(point){
			point.setMap(null);
			this.controller.set('endMarker', null);	
		}	
		var point2 = this.controller.get('startMarker');
		if(point2){
			point2.setMap(null);
			this.controller.set('startMarker', null);
		}
	},		
	updateRoute:function(){
		var pointStart = this.controller.get('startMarker');
		var pointEnd = this.controller.get('endMarker');
		
		if(pointStart && pointEnd){
			var start = {lat: pointStart.position.lat(), lng: pointStart.position.lng()};
			var stp =  {lat: pointEnd.position.lat(), lng: pointEnd.position.lng()};
			this.displayRoute(start,stp);
		}   
    },
	displayRoute:function(origin, destination) {
		var self = this;
		window.directionsService.route({
			origin: origin,
			destination: destination,
			//origin:{lat: -24.345, lng: 134.46},
			//destination:{lat: -23.345, lng: 134.46},
			travelMode: google.maps.TravelMode.DRIVING,
			avoidTolls: true
			}, function(response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
				window.directionsDisplay.setDirections(response);
				self.controller.set('currentRouteOnMap',response);
				
				var countries = self.parceResponseForBorders(response); // test
				self.controller.set('infoParcedCountries', countries);
				
				var distance = response.routes[0].legs[0].distance.value;
				if(distance > 60000){						
					self.controller.set('infoIsInterciry', true);
				} else {
					self.controller.set('infoIsInterciry', false);
				}
				self.controller.set('isShowingInputDescription', true);	
			} else {
				alert('Could not display directions due to: ' + status);
			}
		});	
	},
	storeFilteredPolygons:function(polygons){
		for (var i = 0; i < polygons.length; i++) {
			this.controller.get('dispPolylineArray').pushObject(polygons[i]);	
		}	
	},
	setToleranceForRouteDistance(distance){
		if(distance > 60000){
			this.controller.set('tolerance', 0.1);				
		} else {
			this.controller.set('tolerance', 0.004);		
		}
	},
	showStoredRoutes:function(){
		var filteredPolys = this.controller.get('dispPolylineArray');
		filteredPolys.forEach(function(item, index, enumerable){
			item.index = index;
			item.polyline.setMap(map);
		});
	},
	highlightPath: function(index_of_poly){
		var filteredPoly = this.controller.get('dispPolylineArray');
		filteredPoly.forEach(function(item, index, enumerable){
			var itIndex = item.routeId;
			if(itIndex === index_of_poly){
				item.polyline.set('strokeColor', '#FF0000');
				item.polyline.set('strokeOpacity', 1.0);
				item.polyline.set('strokeWeight', 6);
				item.polyline.set('zIndex', 3);	
			} else {
				item.polyline.set('strokeColor', '#0000FF');
				item.polyline.set('strokeOpacity', 0.6);
				item.polyline.set('strokeWeight', 3);
				item.polyline.set('zIndex', 2);
			}			
		});	
	},
	showAllRoutes:function(e){		
		this.getPathFromStoreUnfiltered();
	},
	displayUnhilteredResults:function(routesFromServer){
		this.clearRoutesOnly();
		var allPolygons = getRoutesFromServerResponse(routesFromServer);
		this.storeFilteredPolygons(allPolygons);
	
		this.showStoredRoutes();
		this.controller.set('isShowingOutputDescription', true);
	},
	saveCurrentRoute:function(){
		var response = this.controller.get('currentRouteOnMap');
		this.pushPathToStore(response);
	},
	clearRoutesMenu:function(){
		this.clearMarkers();
		this.clearRoutesOnly();
	}, 
	clearRoutesOnly:function(){
		this.controller.set('currentRouteOnMap',[]);
				
		window.directionsDisplay.setMap(null);
		window.directionsDisplay = null;
		
		window.directionsDisplay = new google.maps.DirectionsRenderer({
			draggable: true,
			map: window.map,
			panel: document.getElementById('right-panel'),
			suppressMarkers: true
		});

		let dispRouteArray = this.controller.get('dispPolylineArray');
		dispRouteArray.forEach(function(item, index, enumerable){
			item.polyline.setMap(null);
			item = null;
		});
		this.controller.set('dispPolylineArray', []);
		this.clearAllBar();
	},
	clearAllBar:function(){
		this.controller.set('isShowingInputDescription', false);
		this.controller.set('isShowingOutputDescription', false);
		this.controller.set('routeDescription', '');	
	},
	// redo 
	findBorderCrossWord: function(){
		var stPos = new google.maps.LatLng(-5.863219758277808, 15.010199546813965);
		var endPos = new google.maps.LatLng(-5.869324514536208, 15.010929107666016);
		
		var self = this;
		window.directionsService.route({
			origin: stPos,
			destination: endPos,
			travelMode: google.maps.TravelMode.DRIVING,
			avoidTolls: true
			}, function(response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
					
					var respString = response.routes[0];
					var respString2 =  respString.legs[0];
					var respString3 = respString2.steps[0];
					var respString4 = respString3.instructions;
					
					var strlength = respString4.length;
					var cutEnd = respString4.slice(0, strlength - 6);
					
					var indexOfDiv = cutEnd.indexOf('">');
					var cutStart = cutEnd.slice(indexOfDiv + 2);
					
					var substringArray = cutStart.split(" ");
					
					var finalCode = substringArray[0];
					
					console.log(finalCode);
					
					self.controller.set('parcingBorderName', finalCode);
					
					
				} else {
					
					alert('Could not display directions due to: ' + status);
				}
			
		});		
	},
	parceResponseForBorders:function(response){
		var borderCode = this.controller.get('parcingBorderName');
		var self = this;
		if(borderCode){
			
			var index = 0;
			var borderPoints = [];
	
			var legs = response.routes[0].legs;
			for (var i = 0; i < legs.length; i++) {
				var steps = legs[i].steps;
				for (var j = 0; j < steps.length; j++) {
					var instructions = steps[j].instructions;		
					var codePosition = instructions.indexOf(borderCode);
					if(codePosition >= 0){
						var pointFunc = steps[j].start_location;
						var point = {lat: pointFunc.lat(), lng: pointFunc.lng()}
						borderPoints.push(point);
						//borderPoints.push(steps[j].end_location);						
					}	
				}
			}				
		} 		
		console.log('-----------------borderPoints----------------------');
		
		borderPoints.shift();
		
		return borderPoints;  
	},
	// end redo
	initMyMap:function(newThis){
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 12,
			center: {
				lat: 46.473214,
				lng: 30.731014
			},
			mapTypeControlOptions: {
				style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
				position: google.maps.ControlPosition.RIGHT_BOTTOM
			}
		});
		//rtrrrrrdd
		window.map = map;
		var service = new google.maps.places.PlacesService(map);
		window.service = service;
		var geocoder = new google.maps.Geocoder();
		window.geocoder = geocoder;
		
		google.maps.event.addListener(map, "rightclick", function(event) {
			buildContextMenuHTML(event.latLng);
		});
		google.maps.event.addListener(map, "click", function(event) {
			var context_menu_element = document.getElementById('gmaps_context_menu_my');
			if (context_menu_element.style.display == 'block') {
				context_menu_element.style.display = 'none';
			} else {
				buildContextMenuHTML(event.latLng);	
			}
		});
		
		var directionsService = new google.maps.DirectionsService;
		var directionsDisplay = new google.maps.DirectionsRenderer({
			draggable: true,
			map: map,
			panel: document.getElementById('right-panel'),
			suppressMarkers: true
		});
		
		window.directionsService = directionsService;
		window.directionsDisplay = directionsDisplay;
		
		directionsDisplay.addListener('directions_changed', function() {
			var changedDirSet = this.getDirections();	
			newThis.controller.set('currentRouteOnMap',changedDirSet);	
			console.log('changed');
		});
		
			// Create the search box and link it to the UI element.
		var input = document.getElementById('pac-input');
		var searchBox = new google.maps.places.SearchBox(input);
		var input2 = document.getElementById('pac-input2');
		var searchBox2 = new google.maps.places.SearchBox(input2);
		var input_holder = document.getElementById('pac-input-holder');
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input_holder);
		
		var input_clear = document.getElementById('pac-clear');
		map.controls[google.maps.ControlPosition.TOP_LEFT].push(input_clear);
		
			// Bias the SearchBox results towards current map's viewport.
		map.addListener('bounds_changed', function() {
			searchBox.setBounds(map.getBounds());
		});
		searchBox.addListener('places_changed', function() {
				var places = searchBox.getPlaces();
				
				if (places.length == 0) {
					return;
				}
				places.forEach(function(place) {
					var driver =newThis.controller.get('isdriverService').get('is_driver');
					if(driver) {
						newThis.startPointChosen(place.geometry.location);					
					} else {
						newThis.findRouteStart(place.geometry.location);					
					}	
					console.log('start choseb');
				
			});
				
		});
		
		searchBox2.addListener('places_changed', function() {
			var places = searchBox2.getPlaces();
			
			if (places.length == 0) {
				return;
			}
			places.forEach(function(place) {
					var driver =newThis.controller.get('isdriverService').get('is_driver');
					if(driver) {
						newThis.endPointChosen(place.geometry.location);					
					} else {
						newThis.findRouteEnd(place.geometry.location);					
					}
					console.log('end choseb');
				
			});
			
		
		})
		
		//var driver =this.controller.get('isdriverService').get('is_driver');
		//if(driver){
			defineContextMenu({
				options: [{
					title: 'Start point',
					name: 'startPoint',
					action: function(e) {
						newThis.startPointChosen(e);					
					}
					}, {
					title: 'End point',
					name: 'endPoint',
					action: function(e) {
						newThis.endPointChosen(e);
					}
					},{
					title: 'save route',
					name: 'save route',
					action: function(e) {
						newThis.saveCurrentRoute(e);
					}
					},{
					title: 'clear routes',
					name: 'clear routes',
					action: function(e) {
						newThis.clearRoutesMenu(e);
					}
					},{
					title: 'ctestMethod',
					name: 'testMethod',
					action: function(e) {
						newThis.testMethod(e);
					}
					},{
					title: 'send 11e',
					name: 'send 11e',
					action: function(e) {
						newThis.send1(e);
					}
					},{
					title: 'generate 100 test routes. DO NOT SPAM',
					name: 'generate 100 test routes. DO NOT SPAM',
					action: function(e) {
						newThis.send2(e);
					}
					}
				]
			});	
		//} 
				
	},
	pushPathToStore:function(route){
		var newStartCity = this.controller.get('infoStartPlaceId').name;
		var newEndCity = this.controller.get('infoEndPlaceId').name;
		var newDesc = this.controller.get('routeDescription');
		var newPhone = this.controller.get('phoneNumber');
		var newName = this.controller.get('descName');
		var newIsInter = this.controller.get("infoIsInterciry");
		var infoBothDirection = this.controller.get("infoBothDirection");
		var infoStartPlaceId = this.controller.get("infoStartPlaceId").id;
		var infoEndPlaceId = this.controller.get("infoEndPlaceId").id;
		var infoStartPlaceCountry = this.controller.get("infoStartPlaceId").country;
		var infoEndPlaceCountry = this.controller.get("infoEndPlaceId").country;
		var infoEndDate = this.controller.get("infoEndDate");
		var infoIsOneTime = this.controller.get("infoIsOneTime");
		var middleCountries = this.controller.get('infoParcedCountries');
		
		
		
		if(newDesc){
				
			var needSimplify = this.controller.get("infoIsInterciry");	
			
			var polygon = getPolygonFromRoute(route, needSimplify);	
				
			var json_str = JSON.stringify(polygon);
			console.log('poly length = ', polygon.length);
			
			//this.getCountriesForPolygon(polygon); // test -> moved to backend
			
			var mydata = this.store.createRecord('route', {
				"storedPath": json_str,
				"storedDescription": newDesc,
				"storedPhone": newPhone,
				"storedName": newName,
				"storedStartCity": newStartCity,
				"storedEndCity": newEndCity,
				"storedInterCity": newIsInter,
				"storedDirections": infoBothDirection,
				"storedStartId": infoStartPlaceId,
				"storedEndId": infoEndPlaceId,
				"storedDate": infoEndDate,
				"storedIsOneDate": infoIsOneTime,
				"storedMiddleCountries": middleCountries,
				//"stored-length":"insert route length"
			});
			
			this.clearAllBar();
			
			mydata.save().then(
				(dude) => {
					this.refreshUserRoutes();
				}, 
				function(error){
					alert(error);
			});

			
			
			
		} else {
			alert('Write some route description');
		};
	},
	getPathFromStore:function(){
			
		var startCity = this.controller.get('filterOptionsStartId').name;
		var endCity = this.controller.get('filterOptionsEndId').name;
		var startPlaceId = this.controller.get("filterOptionsStartId").id;
		var endPlaceId = this.controller.get("filterOptionsEndId").id;
		var startPlaceCountry = this.controller.get("filterOptionsStartId").country;
		var endPlaceCountry = this.controller.get("filterOptionsEndId").country;
		var pointStart = this.controller.get('startMarkerFind').position;
		var pointEnd = this.controller.get('endMarkerFind').position;
		var distance = this.getDistanceBetweenPoints(pointStart, pointEnd);
		
		var queryParams = {
			"startPlaceId":startPlaceId,
			"endPlaceId":endPlaceId,
			"startPlaceCountry":startPlaceCountry,
			"endPlaceCountry":endPlaceCountry,
			"distance":distance
		};

		this.store.query('route', { filter: queryParams}).then(
			(dude) => {
				this.displayFilteredResults(dude);
			}, 
			function(error){
				alert(error);
			}
		);		
	}, 
	getPathFromStoreUnfiltered:function(){
		this.store.findAll('route').then(
			(dude) => {
				this.displayUnhilteredResults(dude);
				//return dude;					
			}, 
			function(error){
				alert(error);
				//return null;
		});			
	},
	loadRoutesForUser:function(data){
		data.get('routes').then(
			(dude) => {
				this.displayUnhilteredResults(dude);
			}, 
			function(error){
				alert(error);
		});
	},	
	refreshUserRoutes:function(){
		var self = this;	
		this.store.queryRecord('user', {}).then(function (data) {
			self.loadRoutesForUser(data);				
		});				
	},
});






