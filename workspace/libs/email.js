


var nodemailer  = require('nodemailer'),
    htmlbrand   = '<div style="padding:50px;" align="center"><a href="http://www.vadhack.com"><img width="300" src="http://www.vadhack.com/img/vadhack.com.png">  </a><div>',
    timerId;


var Email = module.exports = function(opt){
    opt = opt || {};
    this.subject = opt.subject || 'www.vadhack.com';
    this.transporter = nodemailer.createTransport({
      	service : 'Gmail',
      	auth : {
        	user: opt.user, 
        	pass: opt.pass 
      	}
    });
};

Email.prototype.timeout = 10000;

Email.prototype.send = function(opts, cb) {
    opts = opts || {};

    if (timerId) return;
 
    var timeout = (typeof opts.timeout == "undefined")? this.timeout : opts.timeout;

  	timerId = setTimeout(function() {
    	clearTimeout(timerId);
    	timerId = null;
  	}, timeout);
 
  	console.log('Sendig an Email..');
 
  	var emails  = opts.emails || [],
  	    email   = this,
        mailOptions = {
    	   from        : opts.from || 'VADHACK.COM Remote-editor <app.vadhack@gmail.com>',
    	   to 		   : emails.toString(),
    	   subject     : opts.subject || email.subject,
    	   html	       : (opts.html || opts.body)+htmlbrand
  	};

  	this.transporter.sendMail(mailOptions, cb);
    
};
