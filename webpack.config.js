const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
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
		rules: [
			{test: /\.ts$/, use: 'ts-loader'}
		]
	},
	node: {
		Buffer: false
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	plugins: [
		new UglifyJSPlugin({
			uglifyOptions: {
				ecma: 6
			}
		})
	]
}