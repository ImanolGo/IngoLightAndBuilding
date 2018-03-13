"use strict"

// easy access to url params

const URLMap = new URLSearchParams(location.search + "&" + location.hash.substr(1))

function getURLParams() {
	const ps = new URLSearchParams(location.search + "&" + location.hash.substr(1))
	const o = {}
	for (const p of ps)
		o[p[0]] = p[1]
	return o
}
const URLParams = getURLParams()