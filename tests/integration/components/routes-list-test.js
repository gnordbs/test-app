import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

import makePolyObjects from '../../helpers/make-poly-objects';



moduleForComponent('routes-list', 'Integration | Component | routes list', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
 assert.expect(1);
  const model = makePolyObjects(12);
  console.log(model);

  this.set('model', model);
  
  this.render(hbs`{{routes-list routes=model routeChosen="routeChosen"}}`);

  const $descButtonBody = this.$('.descButtonBody');
	
  	assert.equal($descButtonBody.eq(1).text(), model[1].storedDescription.toString());
	
});
