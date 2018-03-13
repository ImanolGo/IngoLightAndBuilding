// Protopixel Library Elements

"use strict"

function show (elem) {
	elem.style.display = "inline"
}
function hide (elem) {
	elem.style.display = "none"
}

PL.bind_element = function (elem) {
	let obj = {
		elem: elem,
		oninput: noop,
		show: function () {
			obj.elem.style.display = "inline"
		},
		hide: function () {
			obj.elem.style.display = "none"
		},
		getset: function (key, get, set) { // dynamic get and set
			Object.defineProperty(obj, key, {
				get: get,
				set: set,
			})
		},
	}

	let callback = elem.querySelector("[callback]")
	if(callback) {
		elem[callback.getAttribute("callback")] = function () {
			obj.value = obj.value // get & set
			obj.oninput()
		}
	}
	return obj
}

PL.template_html = function (name) {
	let t = ID(name+"_template")
	if(!t) {
		console.error("template not found: "+name)
		return ""
	}
	return t.innerHTML
}

PL.replace = function (str, replaced, replacer) {
	return str.split(replaced).join(replacer)
}

PL.template_replace = function (t, data) {
	for(var k in data)
		t = PL.replace(t, "{"+k+"}", data[k])
	return t
}

// cleans unused fields
PL.template_clean = function (t) {
	for(let v of ["max", "min", "value", "step"])
		t = PL.replace(t, "{"+v+"}", "")
	return t
}

PL.fit_left = function (str, min_len, filler_char) {
	min_len = min_len || 0
	filler_char = filler_char || "0"
	let diff = min_len - str.length
	if(diff > 0) {
		str = (new Array(diff + 1)).join(filler_char) + str
	}
	return str
}

PL.Dec2Hex = function (n, min_len) {
	return PL.fit_left(n.toString(16), min_len, "0")
}

PL.Hex2Dec = function (str, min_len) {
	let n = parseInt(str, 16)
	return PL.fit_left(n.toString(10), min_len, "0")
}

PL.group_arr = function (arr, size) {
	let _arr = []
	while (arr.length > 0)
		_arr.push(arr.splice(0, size))
	return _arr
}

PL.walk_parameters = function (parameters, func) {
	let walk = function (params, path, depth) {
		for (let p of params) {
			func(p, path, depth)
			if(p.type === "group")
				walk(p.subgroup, path+p.name+":", depth+1)
		}
	}
	walk(parameters, "", 0)
}
