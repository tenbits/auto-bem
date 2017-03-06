let autoBem = require('auto-bem');
let html = `
	<div class='foo'>
		<header>
			<span class='title'>Hello</span>
		</header>
		<section class='content is-active'></section>
	</div>
`;
let css = `
	.foo {}
	.foo .title {}
	.foo .content {}
	.foo .content.is-active {}
`;

let { template: htmlResult, css: cssResult } = autoBem.transform(html, css);

console.log('HTML:', htmlResult);
console.log('CSS :', cssResult);
