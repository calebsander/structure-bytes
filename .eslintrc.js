module.exports = {
	"env": {
		"node": true,
		"es6": true
	},
	"extends": "eslint:recommended",
	"rules": {
		"indent": [
			"error",
			"tab",
			{"SwitchCase": 1}
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"single",
			{"avoidEscape": true}
		],
		"semi": [
			"warn",
			"always"
		],
		"no-native-reassign": [
			"off"
		],
		"no-case-declarations": [
			"off"
		],
		"no-multiple-empty-lines": [
			"error",
			{
				"max": 1,
				"maxEOF": 0,
				"maxBOF": 0
			}
		],
		"camelcase": [
			"error",
			{"properties": "always"}
		],
		"brace-style": [
			"error",
			"stroustrup",
			{"allowSingleLine": true}
		],
		"comma-dangle": [
			"error",
			"never"
		],
		"new-cap": [
			"error",
			{
				"newIsCap": true,
				"capIsNew": true,
				"properties": true
			}
		]
	}
};