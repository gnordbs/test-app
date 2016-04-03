import DS from 'ember-data';

export default DS.Model.extend({
  	storedPath: DS.attr(),
	storedDescription: DS.attr(),
	storedPhone: DS.attr(),
	storedName:DS.attr(),
	storedStartCity:DS.attr(),
	storedEndCity:DS.attr(),
	storedInterCity:DS.attr(),
	storedDirections:DS.attr(),
	storedStartId:DS.attr(),
	storedEndId:DS.attr(),
	storedDate:DS.attr(),
	storedIsOneDate:DS.attr(),
	storedMiddleCountries:DS.attr()
});
