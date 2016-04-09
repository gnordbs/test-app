import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';
/*
export default OAuth2PasswordGrant.extend({
  serverTokenEndpoint: 'http://54.213.148.158:1337/api/oauth/token'
});
*/

export default OAuth2PasswordGrant.extend({
	serverTokenEndpoint: 'http://54.213.148.158:1337/api/oauth/token',
   
   makeRequest: function(url,data) {
    data.client_id = 'emberweb';
    data.client_secret = 'zljw29lq0d23';
    return this._super(url,data);
  }
   
   
/*   makeRequest: function(url, data) {

	
        var client_id = 'emberweb';
        var client_secret = 'zljw29lq0d23';
        data.grant_type = 'password';
		
		var newhead = btoa(client_id + ":" + client_secre);


        return Ember.$.ajax({
            url: this.serverTokenEndpoint,
               type: 'POST',
               data: data,
               dataType: 'json',
               contentType: 'application/x-www-form-urlencoded',
			   //contentType: 'application/vnd.api+json',
               crossDomain: true,
               headers: {
                   //Authorization: "Basic " + btoa(client_id + ":" + client_secret)
					//Authorization: "Basic " + YXNkYXNkYXNk
			   }
        });
    }*/
});