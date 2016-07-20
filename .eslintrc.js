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
		]
	}
};