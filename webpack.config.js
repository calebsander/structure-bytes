module.exports = {
	mode: 'production',
	entry: {
		upload: __dirname + '/client-side/upload.ts',
		download: __dirname + '/client-side/download.ts',
		'upload-download': __dirname + '/client-side/upload-download.ts'
	},
	output: {
		path: __dirname + '/compiled',
		filename: '[name].js'
	},
	module: {
		rules: [{
			test: /\.ts$/,
			use: {
				loader: 'ts-loader',
				options: {
					compilerOptions: {declaration: false}
				}
			}
		}]
	},
	node: {
		Buffer: false
	},
	resolve: {
		extensions: ['.ts', '.js']
	}
}