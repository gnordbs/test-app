


(function (Geomcalc,google) { 'use strict';
	//var Geomcalc = {};
	//var geocoder = new google.maps.Geocoder();
	
	Geomcalc.defineContextMenu = function (map, options) {
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
	};	
	Geomcalc.buildContextMenuHTML = function (e, map) {
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
				options[this.id.replace('map_', '')].action.apply(this, [e]);
				
				hideContextMenu();
			};
			
			google.maps.event.clearListeners(context_menu_item, 'click');
			google.maps.event.addDomListenerOnce(context_menu_item, 'click', assign_menu_item_action, false);
		}
		
		setMenuXY(e, map);
		context_menu_element.style.display = 'block';
	};	
	function hideContextMenu() {
		var context_menu_element = document.getElementById('gmaps_context_menu_my');
		
		if (context_menu_element) {
			context_menu_element.style.display = 'none';
		}
	};
	Geomcalc.findAbsolutePosition = function(obj) {
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
	function getCanvasXY(caurrentLatLng, map) {
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
	function setMenuXY(caurrentLatLng, map) {
		var mapWidth = $('.map-canvas').width();
		var mapHeight = $('.map-canvas').height();
		var menuWidth = $('#gmaps_context_menu_my').width();
		var menuHeight = $('#gmaps_context_menu_my').height();
		var clickedPosition = getCanvasXY(caurrentLatLng, map);
		var x = clickedPosition.x;
		var y = clickedPosition.y;
		
		if ((mapWidth - x) < menuWidth) //if to close to the map border, decrease x position
		x = x - menuWidth;
		if ((mapHeight - y) < menuHeight) //if to close to the map border, decrease y position
		y = y - menuHeight;
		
		$('#gmaps_context_menu_my').css('left', x);
		$('#gmaps_context_menu_my').css('top', y);
	};
	Geomcalc.getRoutesFromServerResponse = function (pointsArr){		
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
			var routeId = item.get('id');
			
			
			var polylineContainer = {
				routeId: routeId,
				polyline: polyline,
				storedDescription: descriptionBody,
				storedName: descriptionName,
				storedPhone: descriptionPhone,
				isBothDirection: isBothDirection,
				descriptionDate: descriptionDate,
				isOneTime: isOneTime,
				expanded: false,
			}
			
			polylinesArray[index] = (polylineContainer);
			index++;
		});	
		return polylinesArray;
	};
	Geomcalc.getPolygonFromRoute = function (route, needSimplify){
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
		if(needSimplify){			
			return 	simplify(flightPlanCoordinates, 0.01);			
		}
		return flightPlanCoordinates;
	};
	Geomcalc.getInfoForPoint = function (position, callback){
		var localId = {
			name:'',
			id:'',
			country:''
		};
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({latLng: position}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					var arrAddress = results;
					$.each(arrAddress, function(i, address_component) {
						if (address_component.types[0] == "locality") {
							//console.log(address_component.formatted_address);	
							//console.log("City: " + address_component.address_components[0].long_name);
							
							localId.name = address_component.address_components[0].long_name;
							localId.id = address_component.place_id;
						}
						if (address_component.types[0] == "country") {
							//console.log(address_component.formatted_address);	
							//console.log("Country: " + address_component.address_components[0].short_name);
							localId.country = address_component.address_components[0].short_name;
						}
					});	
					
					//self.controller.set(placeIDStore, localId);	
					
				} else {
					console.log("get Info For Point - No results found");
				}
			} else {
				console.log("get Info For Point - Geocoder failed due to: " + status);
			}
			if(typeof callback === "function"){
				callback(localId, status);	
			}
		});
	};
	Geomcalc.getCountryForPoint = function (position, callback){		// not used yet
		var countryName = "";
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode({latLng: position}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					var arrAddress = results;
					//console.log(results);
					$.each(arrAddress, function(i, address_component) {
						if (address_component.types[0] == "country") {
							//console.log(address_component.formatted_address);	
							//console.log("Country: " + address_component.address_components[0].short_name);
							countryName = address_component.address_components[0].short_name;
						}
					});
				} else {
					console.log("get country fotr point - No results found");
				}
			} else {
				console.log("get country fotr point -  Geocoder failed due to: " + status);
				//alert("Geocoder failed due to: " + status);
			}
			if(typeof callback === "function"){
				callback(countryName, status);
			}
		});
	};
	Geomcalc.getDistanceBetweenPoints = function (startPos, endPos){
		return google.maps.geometry.spherical.computeDistanceBetween(startPos, endPos);
	};
	Geomcalc.checkIfRouteIsNear = function (polyline, touchPos, tolerance){	
		//var stPos = new google.maps.LatLng(touchPos.lat(), touchPos.lng());
		if(google.maps.geometry.poly.isLocationOnEdge(touchPos, polyline,tolerance)){
			return true;
		} else {
			return false;
		}	
	};
	Geomcalc.filterRoutesNearPoint = function (polygons, touchPos, tolerance){
		if(tolerance){
			var filteredPolygons = [];
			for (var i = 0; i < polygons.length; i++) {
				if(Geomcalc.checkIfRouteIsNear(polygons[i].polyline, touchPos, tolerance)){
					filteredPolygons.push(polygons[i]);
				}
			}
			return filteredPolygons;
		} else {
			return polygons;			
		}	
	};
	Geomcalc.filterRoutesByDirections = function (routes, startPos, endPos, bidirectional){	
		var filteredPolygons = [];
		for (var i = 0; i < routes.length; i++) {
			if(Geomcalc.checkIfDirectionIsSuitable(routes[i], startPos, endPos, bidirectional)){
				filteredPolygons.push(routes[i]);
			}
		}
		return filteredPolygons;
	};
	Geomcalc.checkIfDirectionIsSuitable = function (route, startPos, endPos, bidirectionalPass){
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
	};
	Geomcalc.filterRoutesByOneTime = function (routes, filterOptionsOneDay){
		var filteredPolygons = [];
		for (var i = 0; i < routes.length; i++) {
			if(Geomcalc.checkIfOneTimeIsSuitable(routes[i], filterOptionsOneDay)){
				filteredPolygons.push(routes[i]);
			}
		}
		return filteredPolygons;
	};
	Geomcalc.checkIfOneTimeIsSuitable = function (route, filterOptionsOneDay){
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
	};



// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return Geomcalc; });
else if (typeof module !== 'undefined') module.exports = Geomcalc;
else if (typeof self !== 'undefined') self.Geomcalc = Geomcalc;
else window.Geomcalc = Geomcalc;

})(window.Geomcalc = window.Geomcalc || {}, window.google = window.google || {});
