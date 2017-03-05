(function(factory){

	var owner, property, mask_;
	if (typeof module !== 'undefined' && module.exports) {
		owner = module;
		property = 'exports';		
	}
	else {
		owner = window;
		property = 'AutoBem';
	}

	var mask_ = typeof mask !== 'undefined' ? mask : null;
	if (mask_ == null) {
		mask_ = require('maskjs');
	}

	factory(owner, property, mask_);

}(function(exports, property, mask){

	var mask_TreeWalker = mask.TreeWalker;

	// import autoBem.embed.js

	// import /src/exports.js
}));
