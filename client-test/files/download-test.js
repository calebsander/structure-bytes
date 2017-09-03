var VALUE = [{name: 'John', id: 2}, {name: 'Jane', id: 10}];
function assert(condition, message) {
	if (!condition) throw new Error(message || '');
}
assert(!localStorage.typeCache);
function assertIsValue(response) {
	assert(response);
	assert(response.constructor === Array);
	assert(response.length === VALUE.length);
	assert(response[0].constructor === Object);
	assert(response[0].name === VALUE[0].name);
	assert(response[0].id === VALUE[0].id);
	assert(response[1].constructor === Object);
	assert(response[1].name === VALUE[1].name);
	assert(response[1].id === VALUE[1].id);
}
sb.download({
	name: 'people',
	url: '/downloadtest1'
})
	.then(response => {
		assertIsValue(response);
		assert(JSON.parse(localStorage.typeCache).people);
		sb.download({
			name: 'people',
			url: '/downloadtest2',
			options: {method: 'GET'}
		})
			.then(response => {
				assertIsValue(response);
				alert('Success');
			});
	});