var dts = require('dts-bundle');

dts.bundle({
	name: 'auto-bem',
	main: './ts-temp/index.d.ts',
	out: './out/index.d.ts'
});

io.File.copyTo('./ts-temp/out/index.d.ts', './lib/index.d.ts');