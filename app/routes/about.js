import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
    actions: {
		initMap: function() {
            this.initMyMap(this);
			this.clearMarkers();
			this.clearAllBar();
			
			this.findBorderCrossWord();

		},
		clearMyRoute:function(){
			this.clearRoutesMenu();
			
		},
		saveRouteDescription:function(){
			this.saveCurrentRoute();	
		},
		closeInfoR:function(){
			this.hideInfoBar();
		},
		saveSearchOptions:function(){
			this.getPathFromStore();	
		}
	},
	startPointChosen:function(data){
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
			
		//window.map.addMarker(mark);
		this.updateRoute();
		
		this.getInfoForPoint(data, 'infoStartPlaceId');
		console.log('start = ',data.lat(), data.lng());
	},	
	endPointChosen:function(data){
			
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

		//window.map.addMarker(mark);
		this.updateRoute();	
		this.getInfoForPoint(data, 'infoEndPlaceId');	
		console.log('end = ',data.lat(), data.lng());
	},
	findRouteStart:function(data){
		var point = this.controller.get('startMarkerFind');
		if(point){
			point.setMap(null);
			point = null;	
		}	
		
		var mark = new google.maps.Marker({
			position: data,
			map: map,
			//icon: "http://diplomat.md/wp-content/uploads/2015/06/google-location-icon-Location_marker_pin_map_gps.png",
		});
		
		this.controller.set('startMarkerFind', mark);
		this.updateRouteFind();
		
		this.getInfoForPoint(data, 'filterOptionsStartId');
	},
	findRouteEnd:function(data){
		var point = this.controller.get('endMarkerFind');
		if(point){
			point.setMap(null);
			point = null;	
		}	
		
		var mark = new google.maps.Marker({
			position: data,
			map: map,
		});
		
		this.controller.set('endMarkerFind', mark);
		this.updateRouteFind();	

		this.getInfoForPoint(data, 'filterOptionsEndId');		
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
		var point = this.controller.get('startMarkerFind');
		if(point){
			point.setMap(null);
			point = null;	
			this.controller.set('startMarkerFind', null);
		}
		var point = this.controller.get('endMarkerFind');
		if(point){
			point.setMap(null);
			point = null;	
			this.controller.set('endMarkerFind', null);
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
	updateRouteFind:function(){
		var pointStart = this.controller.get('startMarkerFind');
		var pointEnd = this.controller.get('endMarkerFind');
				
		if(pointStart && pointEnd){
			var optionsOpened = this.controller.get('isShowingOutputDescription');
			if(optionsOpened){
				this.getPathFromStore();	
			} else {
				this.controller.set('isShowingOutputDescription', true)	
			}		
		}	
	},
	getRoutesFromServerResponseServer:function(pointsArr){		
		var self = this;
		var index = 0;
		var polylinesArray = [];
		pointsArr.forEach(function(item, index, enumerable){
			var curItemUnparced = item.get('storedPath');		
			var curItem = JSON.parse(curItemUnparced);
			var isBothDirectional = item.get('storedDirections');
		
		var polyline = new google.maps.Polyline({
				path: curItem,
				strokeColor: '#0000FF',
				strokeWeight: 3,
				geodesic: true,
				strokeOpacity: 0.6
		});
		
		if(!isBothDirectional){
			var iconsetngs = {
				path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
				scale: 3
			};
			
			var icon = {
				icon: iconsetngs,
				repeat:'100px',
				offset: '100%'
			};
			polyline.set('icons',[icon]);
		}
		
			
		var descriptionBody = item.get('storedDescription');
		var descriptionName = item.get('storedName');
		var descriptionPhone = item.get('storedPhone');
		var isBothDirection = item.get('storedDirections');
		
		var descriptionDate = item.get('storedDate');
		var isOneTime = item.get('storedIsOneDate');

		
		var polylineContainer = {
			//index: index,
			polyline: polyline,
			storedDescription: descriptionBody,
			storedName: descriptionName,
			storedPhone: descriptionPhone,
			isBothDirection: isBothDirection,
			descriptionDate: descriptionDate,
			isOneTime: isOneTime,
		}
		
		polylinesArray[index] = (polylineContainer);
		index++;
		});	
		return polylinesArray;
	},
	getPolygonFromRoute:function(route){
		var self = this;
		var index = 0;
		var polylinesArray = [];

		var stppos = route.routes[0].legs[0].steps[0].start_location; 
		var newPosS =  {lat: stppos.lat(), lng: stppos.lng()}
		var flightPlanCoordinates = [
			newPosS	
		];
		
		var legs = route.routes[0].legs;
		for (var i = 0; i < legs.length; i++) {
			var steps = legs[i].steps;
			for (var j = 0; j < steps.length; j++) {
				var nextSegment = steps[j].path;
				for (var k = 0; k < nextSegment.length; k++) {
					var newPos =  {lat: nextSegment[k].lat(), lng: nextSegment[k].lng()}; 
					flightPlanCoordinates.push(newPos);	
				}
			}
		}
		if(this.controller.get("infoIsInterciry")){
			//console.log('simplify-------');	
			//console.log(flightPlanCoordinates.length);		
			return 	simplify(flightPlanCoordinates, 0.01);	
			//console.log(flightPlanCoordinates.length);		
		}
		return flightPlanCoordinates;
	},
	getInfoForPoint:function(position, placeIDStore){
		var localId = {
				name:'',
				id:'',
				country:''
			};
		var self = this;
		
		geocoder.geocode({latLng: position}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					var arrAddress = results;
					console.log(results);
					$.each(arrAddress, function(i, address_component) {
						if (address_component.types[0] == "locality") {
							console.log(address_component.formatted_address);	
							console.log("City: " + address_component.address_components[0].long_name);
							
							localId.name = address_component.address_components[0].long_name;
							localId.id = address_component.place_id;
						}
						if (address_component.types[0] == "country") {
							console.log(address_component.formatted_address);	
							console.log("Country: " + address_component.address_components[0].short_name);
							localId.country = address_component.address_components[0].short_name;
						}
					});	

					self.controller.set(placeIDStore, localId);	
					
				} else {
					alert("No results found");
				}
			} else {
				alert("Geocoder failed due to: " + status);
			}
		});
	},
	getCountriesForPolygon:function(polyline){
		var self = this;
		var sampling_step = 8;
		console.log('-------------countries---------',polyline.length);
		for(var i = 0, leng = polyline.length; i * sampling_step < leng; i++){
			(function (i) {
				setTimeout(function () {
					self.getCountryForPoint(polyline[i * sampling_step]);
					console.log(i);
				}, i * 2000);
			})(i);		
		}
	},
	getCountryForPoint:function(position){
		var mark = new google.maps.Marker({
			position: position,
			map: map,
		});
		var self = this;
		geocoder.geocode({latLng: position}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					var arrAddress = results;
					//console.log(results);
					$.each(arrAddress, function(i, address_component) {
						if (address_component.types[0] == "country") {
							//console.log(address_component.formatted_address);	
							console.log("Country: " + address_component.address_components[0].short_name);
						}
					});
				} else {
					alert("No results found");
				}
			} else {
				console.log("Geocoder failed due to: " + status);
				//alert("Geocoder failed due to: " + status);
			}
		});
	},
	simplifyPolygonFromRoute:function(route){ // test
		var self = this;
		var index = 0;
		var polylinesArray = [];
		
		var stppos = route.routes[0].legs[0].steps[0].start_location; 
		var stpposx =  {lat: stppos.lat(), lng: stppos.lng()}
		 
		var flightPlanCoordinates = [
		  stpposx	
		];
		
		var legs = route.routes[0].legs;
		for (var i = 0; i < legs.length; i++) {
			var steps = legs[i].steps;
			for (var j = 0; j < steps.length; j++) {
				var nextSegment = steps[j].path;
				for (var k = 0; k < nextSegment.length; k++) {
					var newPos =  {lat: nextSegment[k].lat(), lng: nextSegment[k].lng()}; 
					flightPlanCoordinates.push(newPos);	
					
				}
			}
		}
		
		var simpleLine = simplify(flightPlanCoordinates, 0.01);	
		
		console.log(flightPlanCoordinates.length);
		console.log(simpleLine.length);
		
		var iconsetngs = {
			path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
			scale: 5
		};
		
		var icon = {
				icon: iconsetngs,
				repeat:'100px',
				offset: '100%'
			};
		
		
		var polyline = new google.maps.Polyline({
			path: simpleLine,
			strokeColor: '#FF0000',
			strokeWeight: 1,
			map: map,
			icons: [icon]
		});
		
		//return flightPlanCoordinates;	
	},
	filterRoutesNearPoint:function(polygons, touchPos, tolerance){
			//var self = this;
		
		
		if(tolerance){
			var filteredPolygons = [];
			for (var i = 0; i < polygons.length; i++) {
				if(this.checkIfRouteIsNear(polygons[i].polyline, touchPos, tolerance)){
						filteredPolygons.push(polygons[i]);
				}
			}
			return filteredPolygons;
		} else {
			return polygons;			
		}	
	},
	storeFilteredPolygons:function(polygons){
		for (var i = 0; i < polygons.length; i++) {
			this.controller.get('dispPolylineArray').pushObject(polygons[i]);	
		}	
	},
	displayFilteredResults:function(routesFromServer){
		this.clearRoutesOnly();
		var pointStart = this.controller.get('startMarkerFind').position;
		var pointEnd = this.controller.get('endMarkerFind').position;
		var bidirectional = this.controller.get('filterOptionsBothDirections');			
		var filterOptionsOneDay = this.controller.get('filterOptionsOneDay');	
		
		var distance = this.getDistanceBetweenPoints(pointStart, pointEnd);
		this.setToleranceForRouteDistance(distance);
		var tolerance = this.controller.get('tolerance');
		this.drawDebugCircles(pointStart, pointEnd);	// debug
		
		var allPolygons = this.getRoutesFromServerResponseServer(routesFromServer);
		var constant_oneFiltered = this.filterRoutesByOneTime(allPolygons, filterOptionsOneDay);
		var startSortedPolygons = this.filterRoutesNearPoint(constant_oneFiltered,pointStart, tolerance);
		var endSortedPolygons = this.filterRoutesNearPoint(startSortedPolygons,pointEnd, tolerance);
		var directionSortedPolygons = this.filterRoutesByDirections(endSortedPolygons,pointStart,pointEnd,bidirectional);
		this.storeFilteredPolygons(directionSortedPolygons);
		
		this.showStoredRoutes();
		this.controller.set('isShowingOutputDescription', true);
		this.showStoredDescriptions();
	},
	drawDebugCircles(startPos, endPos){
		var tolerance = this.controller.get('tolerance');
		var newpoint1 = new google.maps.LatLng(startPos.lat(), startPos.lng() + tolerance);
		var radius = this.getDistanceBetweenPoints(startPos, newpoint1); 
			
		var cityCircle = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0.05,
			map: map,
			center: startPos,
			radius: radius
		});	
		var cityCircle = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillOpacity: 0.05,
			map: map,
			center: endPos,
			radius: radius
		});	
	},
	getDistanceBetweenPoints:function(startPos, endPos){
		return google.maps.geometry.spherical.computeDistanceBetween(startPos, endPos);
	},
	setToleranceForRouteDistance(distance){
		if(distance > 60000){
			//this.controller.set('tolerance', 0.06);	
			this.controller.set('tolerance', 0.1);				
		} else {
			this.controller.set('tolerance', 0.004);		
		}
	},
	checkIfRouteIsNear:function(polyline, touchPos, tolerance){	
		//var stPos = new google.maps.LatLng(touchPos.lat(), touchPos.lng());
		if(google.maps.geometry.poly.isLocationOnEdge(touchPos, polyline,tolerance)){
			return true;
		} else {
			return false;
		}	
	},
	filterRoutesByDirections(routes, startPos, endPos, bidirectional){	
		var filteredPolygons = [];
		for (var i = 0; i < routes.length; i++) {
			if(this.checkIfDirectionIsSuitable(routes[i], startPos, endPos, bidirectional)){
				filteredPolygons.push(routes[i]);
			}
		}
		return filteredPolygons;
	},
	checkIfDirectionIsSuitable:function(route, startPos, endPos, bidirectionalPass){
		var bidirectionalRoute = route.isBothDirection;	
		if(!bidirectionalRoute){	
			var startPosPoly = route.polyline.getPath().getArray()[0];
			var distanseStart = google.maps.geometry.spherical.computeDistanceBetween(startPos, startPosPoly)
			var distanseEnd = google.maps.geometry.spherical.computeDistanceBetween(endPos, startPosPoly)
			if(distanseStart < distanseEnd) {
				if(bidirectionalPass){
					return false;	
				} else {
					return true;	
				}			
			} else {
				return false;	
			}
		} else return true;
	},
	filterRoutesByOneTime:function(routes, filterOptionsOneDay){
		var filteredPolygons = [];
		for (var i = 0; i < routes.length; i++) {
			if(this.checkIfOneTimeIsSuitable(routes[i], filterOptionsOneDay)){
				filteredPolygons.push(routes[i]);
			}
		}
		return filteredPolygons;
	},
	checkIfOneTimeIsSuitable:function(route, filterOptionsOneDay){
		if(filterOptionsOneDay){
			return true; //all routes are suitable
		} else {
			var isRouteForOneDay = route.isOneTime;
			if(!isRouteForOneDay){ // return only constant routes
				return true;
			} else {
				return false;	
			}
		}
	},
	showStoredRoutes:function(){
		var filteredPolys = this.controller.get('dispPolylineArray');
		filteredPolys.forEach(function(item, index, enumerable){
			item.index = index;
			item.polyline.setMap(map);
		});
	},
	showStoredDescriptions:function() {
		var self = this;
		var html = '<p> list of suitable routes </p>';
		var filteredPoly = this.controller.get('dispPolylineArray');
		filteredPoly.forEach(function(item, index, enumerable){
			var desc = item.storedName;
			if(!desc) desc = item.storedDescription;
			//var index = item.index;
			//if(desc){
				html += '<div class="descButton" id="polyDesc_' + index + '">' +
						desc + 
						'</div>';
			//}
		});
		
		
		//if (!document.getElementById('output_route_info')) return;
		var descriptionMenuContainer = document.getElementById('output_route_info');
		descriptionMenuContainer.innerHTML = html;
		
		
		var descriptButtons = descriptionMenuContainer.getElementsByTagName('div');
        var descriptButtons_items_count = descriptButtons.length
		var i;
		
		for (i = 0; i < descriptButtons_items_count; i++) {
			var descriptButton_item = descriptButtons[i];
			descriptButton_item.addEventListener("click", function(){
				var idnum = this.id;
				//alert(idnum);
				self.highlightPath(idnum);
				self.setInfoBarText(idnum);
				self.showInfoBar();
			});		
		}
	},
	setInfoBarText:function(idnum){
		var itIndexR = idnum.replace('polyDesc_', '');
		var filteredPolys = this.controller.get('dispPolylineArray');
		var filteredPoly = filteredPolys[itIndexR];	
			
		this.controller.set("infoName", filteredPoly.storedName);
		this.controller.set("infoPhone",filteredPoly.storedPhone);
		this.controller.set("infoDesc", filteredPoly.storedDescription);
		
		var isOneTime = filteredPoly.isOneTime;
		if(isOneTime){
			this.controller.set("infoEndDate", filteredPoly.descriptionDate);	
		} else {
			this.controller.set("infoEndDate", '');				
		}
	},
	showInfoBar:function(){
		this.controller.set('isShowingInfoBar', true);
	},
	hideInfoBar:function(){
		this.controller.set('isShowingInfoBar', false);
	},
	highlightPath: function(index_of_poly){
		var filteredPoly = this.controller.get('dispPolylineArray');
		filteredPoly.forEach(function(item, index, enumerable){
			var itIndex = item.index;
			var itIndexR = index_of_poly.replace('polyDesc_', '');
			if(itIndex == itIndexR){
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
	removeInfoWindow:function(){
		var currentInfo = this.controller.get('curentInfoWindow');	
		if(currentInfo) {
			currentInfo.close();
			currentInfo = null;
		}	
	},
	showAllRoutes:function(e){		
		this.getPathFromStoreUnfiltered();
	},
	displayUnhilteredResults:function(routesFromServer){
		this.clearRoutesOnly();
		var allPolygons = this.getRoutesFromServerResponseServer(routesFromServer);
		this.storeFilteredPolygons(allPolygons);
	
		this.showStoredRoutes();
		this.controller.set('isShowingOutputDescription', true);
		this.showStoredDescriptions();	
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
				
		//window.directionsDisplay.setDirections({ routes: [] });
		window.directionsDisplay.setMap(null);
		window.directionsDisplay = null;
		
		window.directionsDisplay = new google.maps.DirectionsRenderer({
			draggable: true,
			map: window.map,
			panel: document.getElementById('right-panel'),
			suppressMarkers: true
		});
		
		var ddd = 3;
		/*let dispRouteArray = this.controller.get('dispRouteArray');
			dispRouteArray.forEach(function(item, index, enumerable){
			item.setDirections({ routes: [] });
			});
		this.controller.set('dispRouteArray', []);*/
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
		this.controller.set('isShowingInfoBar', false);
		this.controller.set('routeDescription', '');
		
		if (document.getElementById('output_route_info')) {
			var descriptionMenuContainer = document.getElementById('output_route_info');
			descriptionMenuContainer.innerHTML = "";	
		}		
	},
	defineMinDistanceToRoute:function(data){
			/*
		var currenrRoute = this.controller.get('currentRouteOnMap');

		var polyline = new google.maps.Polyline({
			path: [],
			strokeColor: '#0000FF',
			strokeWeight: 3
		});
		var bounds = new google.maps.LatLngBounds();
			
		var legs = currenrRoute.routes[0].legs;
		let i,j,k;
		for (i = 0; i < legs.length; i++) {
			var steps = legs[i].steps;
			for (j = 0; j < steps.length; j++) {
				var nextSegment = steps[j].path;
				for (k = 0; k < nextSegment.length; k++) {
					polyline.getPath().push(nextSegment[k]);
					bounds.extend(nextSegment[k]);
					
				}
				var nextSegmentPos = steps[j].end_location;
				var mark = new google.maps.Marker({
					position: nextSegmentPos,
					map: map,
					icon: "http://prosidr.ru/images/ttop2.png"
				});	
			}
		}
		//
		var tolerance = 0.001;
		 //polyline.setMap(window.map);
		if(google.maps.geometry.poly.isLocationOnEdge(data, polyline,tolerance)){
			var mark = new google.maps.Marker({
				position: data,
				map: map,
				icon: "http://diplomat.md/wp-content/uploads/2015/06/google-location-icon-Location_marker_pin_map_gps.png",
			});	
		} else {
			var mark = new google.maps.Marker({
				position: data,
				map: map,
			});	
		}
		
		var cityCircle = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: '#FF0000',
			fillOpacity: 0.35,
			map: map,
			center: data,
			radius: 100
		});
		
		
		var points2 = google.maps.geometry.encoding.decodePath(currenrRoute.routes[0].overview_polyline);
		
		points2.forEach(function(place) {
			var mark = new google.maps.Marker({
			position: place,
				map: map,
				icon: "http://zizaza.com/cache/icon_32/iconset/569071/569101/PNG/32/iphone_toolbar_icons/apple_google_map_iphone_marker.png"
			});
		});
		
		var mark = new google.maps.Marker({
			position: {lat: 46.461154, lng: 30.733074},
			map: map,
			icon: "http://zizaza.com/cache/icon_32/iconset/569071/569101/PNG/32/iphone_toolbar_icons/apple_google_map_iphone_marker.png"
		});
		*/
		/*$.get( "http://localhost:4500/api/waypoints", function( data ) {
			alert( data );
		});*/
		// working
		
		var posts = this.store.findAll('waypoints').then(
		(dude) => {
			var curItemff = dude.get('type');
			var curItemgg = dude.get('id');
			dude.forEach(function(item, index, enumerable){
				var curItem = item.get('storedPath');
				var curItem2 = item.get('storedDescription');
				var curItem3 = item.storedPath;
				var curItem4 = item.storedDescription;
				var curItem5 = item.get('id');
				var curItem6 = item.id;
				alert(curItem);	
			});
			
						
		}, 
		function(error){
			alert(error);
		});	
	}, 
	testMethod:function(data){
		var route = this.controller.get('currentRouteOnMap');
		
		
		// Box the overview path of the first route
		var rboxer = new RouteBoxer();
		var distance = 20;

		
		var path = route.routes[0].overview_path;
		var boxes = rboxer.box(path, distance);
		for (var i = 0; i < boxes.length; i++) {
			var bounds = boxes[i];
			// Perform search over this bounds 
			
			var rectangle = new google.maps.Rectangle({
				strokeColor: '#FF0000',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#FF0000',
				fillOpacity: 0.35,
				map: map,
				bounds: bounds
			});
		}
		
		this.searchInBounds(boxes);
		//map.addListener('idle', this.performSearch());
	},
	searchInBounds2:function(bound) {
		var self = this;
		for (var i = 0; i < bound.length; i++) {
			map.addListener('idle', this.performSearch(bound[i]));
		}
	},
	searchInBounds:function(bound) {
		var self = this;
	   for (var i = 0; i < bound.length; i++) {
		 (function(i) {
		   setTimeout(function() {

			 // Perform search on the bound and save the result
			self.performSearch(bound[i]);

			 //If the last box
			 if ((bound.length - 1) === i) {
			   //addAllMarkers(bound);
			 }
		   }, 600 * i);
		 }(i));
	   }
	},
	performSearch:function(bound) {
	   var request = {
		 bounds: bound,
		 keyword: 'local_government_office',
		 //types:['(cities)']
	   };

		console.log('performSearch----');
	   //currentBound = bound;
	   service.nearbySearch(request, this.callback);
	},
	callback:function(results, status) {
		//var self = this;
	   if (status !== google.maps.places.PlacesServiceStatus.OK) {
		 console.error(status);
		 return;
	   }

	   for (var i = 0, result; result = results[i]; i++) {
		 // Go through each result from the search and if the place exist already in our list of places then done push it in to the array
		 //if (!placeExists(result.id)) {
			//var savedPlaces = self.controller.get('savedPlaces');
			//savedPlaces.push(result);
			//console.log(result.id);
		 //}
		var marker = new google.maps.Marker({
			map: map,
			position: result.geometry.location,
			icon: {
				url: 'http://maps.gstatic.com/mapfiles/circle.png',
				anchor: new google.maps.Point(10, 10),
				scaledSize: new google.maps.Size(10, 17)
			}
		});
		var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent(result.name);
		infoWindow.open(map, marker);
		
		google.maps.event.addListener(marker, 'click', function() {
			service.getDetails(result, function(result, status) {
				if (status !== google.maps.places.PlacesServiceStatus.OK) {
					console.error(status);
					return;
				}
				infoWindow.setContent(result.name);
				infoWindow.open(map, marker);
			});
		});
	   }
	},
	send1:function(e){
		var stPos = new google.maps.LatLng(50.90303283111257, 2.164306640625);
		var endPos = new google.maps.LatLng(55.441479359140686, 9.42626953125);
		this.startPointChosen(stPos);
		this.endPointChosen(endPos);
	},
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
		//console.log(borderPoints);
		/*for(var i = 0; i < borderPoints.length; i++){
			var country = self.getCountryForPoint(borderPoints[i]);
			console.log(country);		
			
		}*/
		
		/*borderPoints.forEach(function(item, index, enumerable){
					
		});*/
			
		return borderPoints;  
	},
	send2:function(e){
		var self = this;
		// generate random routes
		for(var i = 0; i < 100; i++){
			(function (x) {
				setTimeout(function () { 
					console.log('-----------------it----------', i);
					self.clearMarkers();
					self.clearAllBar();
					/*
					// Odessa
					var minLat = 46.28764743151775;
					var maxLat = 46.59001283632443;
					var minLng = 30.595550537109375;
					var maxLng = 30.861282348632812;*/

					// Kiev
					var maxLat = 50.54354480296085;
					var minLat =50.35641383867465;
					var minLng= 30.277633666992188;
					var maxLng = 30.750732421875;
								

					
					
					var randomLat = Math.random()* (maxLat-minLat) + minLat;
					var randomLng = Math.random()* (maxLng-minLng) + minLng;
					var randomLat2 = Math.random()* (maxLat-minLat) + minLat;
					var randomLng2 = Math.random()* (maxLng-minLng) + minLng;
					console.log(randomLat, randomLng);
					console.log(randomLat2, randomLng2);
					
					var pos = new google.maps.LatLng(randomLat.toFixed(8),randomLng.toFixed(8));
					var pos2 = new google.maps.LatLng(randomLat2.toFixed(8),randomLng2.toFixed(8));
					
					//this.startPointChosen(pos);
					//this.endPointChosen(pos);
					
					
					
					window.directionsService.route({
						origin: pos,
						destination: pos2,
						//origin:{lat: -24.345, lng: 134.46},
						//destination:{lat: -23.345, lng: 134.46},
						travelMode: google.maps.TravelMode.DRIVING,
						avoidTolls: true
						}, function(response, status) {
						if (status === google.maps.DirectionsStatus.OK) {
							//window.directionsDisplay.setDirections(response);
							//self.controller.set('currentRouteOnMap',response);
							var distance = response.routes[0].legs[0].distance.value;
							if(distance > 60000){						
								self.controller.set('infoIsInterciry', true);
							} else {
								self.controller.set('infoIsInterciry', false);
							}
							
							var newStartCity = self.controller.get('infoStartCity');
							var newEndCity = self.controller.get('infoEndCity');
							var newID = self.controller.get('currentID');
							var newDesc = "tesst_route --- " + Math.random()*100000;
							var newPhone = self.controller.get('phoneNumber');
							var newName = self.controller.get('descName');
							var newIsInter = self.controller.get("infoIsInterciry")
							var infoBothDirection =  Math.random() >= 0.5;
											
							var json_str = JSON.stringify(self.getPolygonFromRoute(response));
							
							var mydata = self.store.createRecord('waypoint', {
								"storedPath": json_str,
								"storedDescription": newDesc,
								"storedPhone": '0000000',
								"storedName": 'test',
								"storedStartCity": 'newStartCity',
								"storedEndCity": 'newEndCity',
								"storedInterCity": newIsInter,
								"storedDirections": infoBothDirection
							});
							mydata.save();	
							console.log('saved------------');
						} else {
							console.log('not suitable');	

						}
					});	
				
				
				}, i * 700);
			})(i);
			
			
			
			
				
		
			
		}
	},
	get1:function(e){

	},
	get2:function(e){
		
	},
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
			//showContextMenu(event.latLng);
			buildContextMenuHTML(event.latLng);
		});
		google.maps.event.addListener(map, "click", function(event) {
			//showContextMenu(event.latLng);
			
			newThis.removeInfoWindow();
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
		
		//var driver2 = this.controller.get('isDriver');
		var driver =this.controller.get('isdriverService').get('is_driver');
		//alert("dr = ");
		//alert(driver);
		if(driver){
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
		} else {
			defineContextMenu({
				options: [{
					title: 'Find route from here',
					name: 'Find route from here',
					action: function(e) {
						newThis.findRouteStart(e);
					}
					},{
					title: 'Find route to here',
					name: 'Find route to here',
					action: function(e) {
						newThis.findRouteEnd(e);
					}
					},{
					title: 'clear routes',
					name: 'clear routes',
					action: function(e) {
						newThis.clearRoutesMenu(e);
					}
					},{
					title: 'Min Distance To Route',
					name: 'Min Distance To Route',
					action: function(e) {
						newThis.defineMinDistanceToRoute(e);
					}
					},{
					title: 'test',
					name: 'test',
					action: function(e) {
						newThis.testMethod(e);
					}
					},{
					title: 'Show all routes',
					name: 'Show all routes',
					action: function(e) {
						newThis.showAllRoutes(e);
					}
					},{
					title: 'send 1',
					name: 'send 1',
					action: function(e) {
						newThis.send1(e);
					}
					},{
					title: 'send 2',
					name: 'send 2',
					action: function(e) {
						newThis.send2(e);
					}
					},{
					title: 'get 1',
					name: 'get 1',
					action: function(e) {
						newThis.get1(e);
					}
					},{
					title: 'get 2',
					name: 'get 2',
					action: function(e) {
						newThis.get2(e);
					}
				}
				]
			});	
		}
		
	},
	pushPathToStore:function(route){
		var newStartCity = this.controller.get('infoStartPlaceId').name;
		var newEndCity = this.controller.get('infoEndPlaceId').name;
		var newID = this.controller.get('currentID');
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
				
			var polygon = this.getPolygonFromRoute(route);	
				
			var json_str = JSON.stringify(polygon);
			console.log('poly length = ', polygon.length);
			
			//this.getCountriesForPolygon(polygon); // test -> moved to backend
			
			var mydata = this.store.createRecord('waypoint', {
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
				"storedMiddleCountries": middleCountries
			});
			mydata.save();	
				
				/*
				 * original
			route.newStoreField ='routeID=' + newID;
			this.store.push({
				data: {
					type: 'waypoints',
					id: newID,
					attributes: {
						storedPath: route,
						storedDescription: newDesc
					}
				}
			});	
			var newDesc = this.controller.set('routeDescription', '');
			this.controller.set('currentID', newID + 1);*/	///////////
		
		/*var json_str = JSON.stringify(this.getPolygonFromRoute(route));
		var foo = this.store.createRecord('waypoints', {
			"storedPath": json_str,
			"storedDescription": newDesc,
			"storedPhone": newPhone,
			"storedName": newName
		});	

		foo.save();////
		
		*/
		
		/*
		  //----------------------- final
		 var json_str = JSON.stringify(this.getPolygonFromRoute(route));
		var url = 'http://localhost:4500/api/waypoints';
		//var url = 'http://54.213.148.158:4500/api/waypoints';
			var mydata ={
				"storedPath": json_str,
				"storedDescription": newDesc,
				"storedPhone": newPhone,
				"storedName": newName
			};
			
			$.ajax({
				data: mydata,
				method: 'POST',
				url: url
			});	
			//---------------------- final
		*/	
			this.clearAllBar();
			
		} else {
			alert('Write some route description');
		};
		
	/**/
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

		this.store.query('waypoint', { filter: queryParams}).then(
			(dude) => {
				this.displayFilteredResults(dude);
			}, 
			function(error){
				alert(error);
			}
		);		
			
			
			
		/*	
		this.store.findAll('waypoint').then(
			);
		*/		
	}, 
	getPathFromStoreUnfiltered:function(){
		this.store.findAll('waypoint').then(
			(dude) => {
				this.displayUnhilteredResults(dude);
				//return dude;					
			}, 
			function(error){
				alert(error);
				//return null;
		});			
	},
});

function defineContextMenu(options) {
    window.contentMenuOptions = {};
    let i;
    for (i in options.options) {
        if (options.options.hasOwnProperty(i)) {
            var option = options.options[i];

            window.contentMenuOptions[option.name] = {
                title: option.title,
                action: option.action
            };
        }
    }
    var projection;
    var contextmenuDir;
    projection = map.getProjection();
    $('#gmaps_context_menu_my').remove();
    contextmenuDir = document.createElement("ul");
    contextmenuDir.id = 'gmaps_context_menu_my';
    $(map.getDiv()).append(contextmenuDir);
	
	hideContextMenu();
}

function buildContextMenuHTML(e) {
    var html = '',
        options = window.contentMenuOptions;

    for (var i in options) {
        if (options.hasOwnProperty(i)) {
            var option = options[i];
            html += '<li><div  id="' + 'map' + '_' + i + '" href="">' + option.title + '</div></li>';
        }
    }

    if (!document.getElementById('gmaps_context_menu_my')) return;

    var context_menu_element = document.getElementById('gmaps_context_menu_my');

    context_menu_element.innerHTML = html;

    var context_menu_items = context_menu_element.getElementsByTagName('div'),
        context_menu_items_count = context_menu_items.length,
        i;

    for (i = 0; i < context_menu_items_count; i++) {
        var context_menu_item = context_menu_items[i];

        var assign_menu_item_action = function(ev) {
            ev.preventDefault();
            options[this.id.replace('map_', '')].action.apply(self, [e]);
			//options[this.id.replace('map_', '')].action.apply(newThis, [e]);
			
            hideContextMenu();
        };

        google.maps.event.clearListeners(context_menu_item, 'click');
        google.maps.event.addDomListenerOnce(context_menu_item, 'click', assign_menu_item_action, false);
    }

    setMenuXY(e);
    context_menu_element.style.display = 'block';
};

function hideContextMenu() {
    var context_menu_element = document.getElementById('gmaps_context_menu_my');

    if (context_menu_element) {
        context_menu_element.style.display = 'none';
    }
};


var findAbsolutePosition = function(obj) {
    var curleft = 0,
        curtop = 0;

    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    }

    return [curleft, curtop];
};

function getCanvasXY(caurrentLatLng) {
    var scale = Math.pow(2, map.getZoom());
    var nw = new google.maps.LatLng(
        map.getBounds().getNorthEast().lat(),
        map.getBounds().getSouthWest().lng()
    );
    var worldCoordinateNW = map.getProjection().fromLatLngToPoint(nw);
    var worldCoordinate = map.getProjection().fromLatLngToPoint(caurrentLatLng);
    var caurrentLatLngOffset = new google.maps.Point(
        Math.floor((worldCoordinate.x - worldCoordinateNW.x) * scale),
        Math.floor((worldCoordinate.y - worldCoordinateNW.y) * scale)
    );
    return caurrentLatLngOffset;
}

function setMenuXY(caurrentLatLng) {
    var mapWidth = $('.map-canvas').width();
    var mapHeight = $('.map-canvas').height();
    var menuWidth = $('#gmaps_context_menu_my').width();
    var menuHeight = $('#gmaps_context_menu_my').height();
    var clickedPosition = getCanvasXY(caurrentLatLng);
    var x = clickedPosition.x;
    var y = clickedPosition.y;

    if ((mapWidth - x) < menuWidth) //if to close to the map border, decrease x position
        x = x - menuWidth;
    if ((mapHeight - y) < menuHeight) //if to close to the map border, decrease y position
        y = y - menuHeight;

    $('#gmaps_context_menu_my').css('left', x);
    $('#gmaps_context_menu_my').css('top', y);
};

var addLIstenersTossss = function(pol){
			google.maps.event.addListener(pol, 'mouseover', function(e){		
				//this.set('strokeColor', '#00FF00');
				//this.set('zIndex', 1);
			});
		
			google.maps.event.addListener(pol, 'click', function(e){		
				this.set('strokeColor', '#000000');
				this.set('zIndex', 1);
				
				var stPos = new google.maps.LatLng(e.latLng.lat(), e.latLng.lng());
				
				var mev = {
					stop: null,
					latLng: new google.maps.LatLng(40.0,-90.0)
				}
				
				google.maps.event.trigger(map, 'click', mev);
				console.log('clicked!!!!!!!!!');
			});
		
			google.maps.event.addListener(pol, 'mouseout', function(){
				//this.set('strokeColor', '#0000FF');
				//this.set('zIndex', 2);
			});	
		}

		
/*		
findBorderCrossWord: function{
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
			
			resolve(finalCode);
			
		} else {
			reject('not found');	
			//alert('Could not display directions due to: ' + status);
		}
	});	
	
}

*/