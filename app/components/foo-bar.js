import Ember from 'ember';

export default Ember.Component.extend({
	categories: {
      'Bourbons': ['Bulleit', 'Four Roses', 'Woodford Reserve'],
      'Ryes': ['WhistlePig', 'High West']
    },
	
	firstName:'rrrrr',
	firstName2: Ember.computed('firstName',function() {
    return this.get('firstName').concat('!');
  }),
	
	didInsertElement(){
		/*this.set('categories', {
      'Bourbons': ['Bulleit', 'Four Roses', 'Woodford Reserve'],
      'Ryes': ['WhistlePig', 'High West']
    });*/
	},
	
	willRender() {
    // Set the "categories" property to a JavaScript object
    // with the category name as the key and the value a list
    // of products.
    
  },
   
   mouseEnter: function(event) {
	 this.addCategory2('jin');
	   Em.$('body').addClass('some-class');
  } ,
  
   actions: {
    toggleBody() {
      this.toggleProperty('isShowingBody');

    },
	updateFirstName(){
		//this.get('firstName').set(this.get('firstName').concat('!'));
		//this.set('firstName', this.get('firstName').concat('!'))
	}
  },
  addCategory2(category) {
      let categories = this.get('categories');
	  let name = this.makeid();
	  
      categories[name] = [];
	  
	  for(var j  =0; j < Math.floor(Math.random() * 5); j++) {
		  categories[name].push(this.makeid());
	  }

	  this.rerender();
	},
	
	
	makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < Math.floor(Math.random() * 35); i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
	}
	
	

});










