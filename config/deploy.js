/* jshint node: true */

module.exports = function(deployTarget) {
  var ENV = {
    build: {},
    // include other plugin configuration that applies to all deploy targets here
	
	 // s3: {
	//	  accessKeyId: 'AKIAI7J72ZAVJYHSPAEA',
	//	  secretAccessKey: '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',
	//	  bucket: 'vdevelop',
	//	  region: 'us-west-2',
	//	  filePattern: '**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2,html}',
	//  }
  };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
    // configure other plugins for development deploy target here
	console.log('deploy development');
	ENV.s3 = {
		accessKeyId: process.env.Access_Key_Id,
		secretAccessKey: process.env.Secret_Access_Key,
		bucket: process.env.Bucket,
		region: process.env.Region,
		filePattern: '**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2,html}',
    };
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    // configure other plugins for staging deploy target here
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    // configure other plugins for production deploy target here
	console.log('deploy production');
	ENV.s3 = {
		accessKeyId: process.env.Access_Key_Id,
		secretAccessKey: process.env.Secret_Access_Key,
		bucket: process.env.Bucket,
		region: process.env.Region,
		filePattern: '**/*.{js,css,png,gif,ico,jpg,map,xml,txt,svg,swf,eot,ttf,woff,woff2,html}',
    };
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
