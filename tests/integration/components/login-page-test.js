import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('login-page', 'Integration | Component | login page', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

	this.render(hbs`{{login-page}}`);
	  
	this.$('#reg_trigger').click(); 
	assert.equal(this.$('#logform').attr('class'),'register_form', 'switch to register');
	
	this.$('#reg_trigger').click(); 
	assert.equal(this.$('#logform').attr('class'),'login_form', 'switch to login');

});
