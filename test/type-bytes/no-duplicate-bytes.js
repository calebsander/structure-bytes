/*eslint-disable no-undef*/
const usedBytes = new Set
for (const typeName in t) {
	if (!/^([A-Z][a-z]+)+Type$/.test(typeName)) continue
	const typeByte = t[typeName]._value
	if (usedBytes.has(typeByte)) assert.fail('Type byte ' + String(typeByte) + ' is used twice')
	usedBytes.add(typeByte)
}