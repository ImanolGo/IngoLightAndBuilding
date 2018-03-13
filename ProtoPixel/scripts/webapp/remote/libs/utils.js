"use strict"

newImports(
	"gl-matrix-min.js"
).then(() => {
	vec4Pool = newPool(vec4.create), mat4Pool = newPool(mat4.create)
})

let vec4Pool = null, mat4Pool = null

var utils = {
	obj: function (n) {
		n = n || 0
		return { prop1: "p" + n, prop2: "p" + n }
	},
	objs: function (n) {
		var aux = {}
		for (var i = 0; i < n; i++) {
			aux[i] = utils.obj(i)
		}
		return aux
	},
	objs_arr: function (n) {
		var aux = []
		for (var i = 0; i < n; i++) {
			aux.push(utils.obj(i))
		}
		return aux
	},
}

const deg = 0.01745329252 // in rad

function nextPow2(v) {
	v--
	v |= v >> 1
	v |= v >> 2
	v |= v >> 4
	v |= v >> 8
	v |= v >> 16
	v++
	return v
}

function round(n = 0, dec = 0) {
	//let p = 10 ** dec
	let p = Math.pow(10, dec) // safari
	return Math.round(n * p) / p
}

function round_arr(arr = [], dec = 0) {
	for (let i in arr)
		arr[i] = round(arr[i], dec)
	return arr
}

function get(url, f) {
	var req = new XMLHttpRequest()
	if (!f) {
		req.open("GET", url, false)
		req.send()
		return req.responseText
	}
	req.onreadystatechange = function () {
		if (req.readyState === 4 && req.status === 200) { f(req.responseText) }
	}
	req.open("GET", url, true)
	req.send()
}

// json fetch, with expectations
function fetchx(x, url = "", obj = {}) {
	let ip = URLParams.ip
	if (ip && !url.startsWith("http")) {
		url = "http://" + ip + url
	}
	if (URLParams.test)
		return Promise.resolve(x)
	return fetch(url, obj).then(b => b.json())
}
// post form using fetch
function postForm(url = "", data = {}) {
	let ip = URLParams.ip
	if (ip)
		url = "http://" + ip + url
	if (URLParams.test) {
		console.log("postForm", url, data)
		return delay({ ok: true })
	}
	let fd = new FormData()
	for (let i in data)
		fd.append(i, data[i])

	return fetch(url, {
		method: "post",
		body: fd,
	})
}

function arr_remove(arr, pos) {
	return arr.splice(pos, 1)[0]
}
let remove = arr_remove
utils.testRemove = function () {
	let A = [1, 2, 3]
	test.eq(remove(A, 1), 2)
	return test.eq(A, [1, 3])
}

function replace_str(str, replaced, replacer) {
	return str.split(replaced).join(replacer)
}
utils.testReplace_str = function () {
	return test.eq(replace_str("AA", "A", "B"), "BB")
}

function remove_val(arr, val) {
	arr.splice(arr.indexOf(val), 1)
}
utils.testRemove_val = function () {
	var A = [1, 2, 3]
	var B = [2, 3]
	remove_val(A, 1)
	return test.eq(A, B)
}

function replace_val(arr, val, repl) {
	arr[arr.indexOf(val)] = repl
}
utils.testReplace_val = () => {
	var A = [1, 2, 2, 3]
	var B = [1, 4, 2, 3]
	replace_val(A, 2, 4)
	return test.eq(A, B)
}

function arr_insert(arr, pos, val) {
	if (pos < 0 || pos > arr.length)
		console.error("out of range", pos, arr)
	arr.splice(pos, 0, val)
	return arr
}
let insert = arr_insert
utils.testInsert = function () {
	test.eq(arr_insert([0], 0, 1), [1, 0])
	test.eq(arr_insert([0], 1, 1), [0, 1])
	test.eq(arr_insert([0, 0], 1, 1), [0, 1, 0])
	return true
}

// take a position in the array and move it to a another position
function arr_reorderAt(arr, pos0, pos1) {
	let val = arr[pos0]
	pos1 = Math.min(arr.length - 1, Math.max(0, pos1))
	arr_remove(arr, pos0)
	arr_insert(arr, pos1, val)
	return arr
}

// take a value in the array and move it to a specific position
function arr_reorder(arr, val, pos) {
	arr_reorderAt(arr, arr.indexOf(val), pos)
	return arr
}
utils.testArr_reorder = () => {
	test.eq(arr_reorder([1, 2, 3, 4], 2, -1), [2, 1, 3, 4])
	test.eq(arr_reorder([1, 2, 3, 4], 2, 0), [2, 1, 3, 4])
	test.eq(arr_reorder([1, 2, 3, 4], 2, 1), [1, 2, 3, 4])
	test.eq(arr_reorder([1, 2, 3, 4], 2, 2), [1, 3, 2, 4])
	test.eq(arr_reorder([1, 2, 3, 4], 2, 3), [1, 3, 4, 2])
	test.eq(arr_reorder([1, 2, 3, 4], 2, 4), [1, 3, 4, 2])
	test.eq(arr_reorder([1, 2, 3, 4], 2, 5), [1, 3, 4, 2])
	return true
}

// [[0], [0]] -> [0, 0]
function arr_flatten(arr) {
	return arr.reduce((a, b) => { return a.concat(b) }, [])
}
utils.testArr_flatten = () => {
	test.eq(arr_flatten([[0], [0]]), [0, 0])
	test.eq(arr_flatten([0, 0]), [0, 0])
	test.eq(arr_flatten([[[0]], [0]]), [[0], 0])
	return true
}

// take a value in the array and move it to a specific position following HTML's insertBefore logic
function arr_reorder_html(arr, val, pos) {
	let i = arr.indexOf(val)
	if (i === pos)
		return arr
	if (i < pos)
		pos--
	if (pos < 0)
		pos = 0
	if (pos >= arr.length)
		pos = arr.length - 1
	remove_val(arr, val)
	insert(arr, pos, val)
	return arr
}
utils.testArr_reorder_html = () => {
	test.eq(arr_reorder_html([1, 2, 3, 4], 2, -1), [2, 1, 3, 4])
	test.eq(arr_reorder_html([1, 2, 3, 4], 2, 0), [2, 1, 3, 4])
	test.eq(arr_reorder_html([1, 2, 3, 4], 2, 1), [1, 2, 3, 4])
	test.eq(arr_reorder_html([1, 2, 3, 4], 2, 2), [1, 2, 3, 4])
	test.eq(arr_reorder_html([1, 2, 3, 4], 2, 3), [1, 3, 2, 4])
	test.eq(arr_reorder_html([1, 2, 3, 4], 2, 4), [1, 3, 4, 2])
	test.eq(arr_reorder_html([1, 2, 3, 4], 2, 5), [1, 3, 4, 2])
	test.eq(arr_reorder_html([1, 2, 3, 4], 4, 3), [1, 2, 3, 4])
	test.eq(arr_reorder_html([1, 2, 3, 4], 4, 1), [1, 4, 2, 3])
	return true
}

function foreach(arr, func) {
	[].forEach.call(arr, func)
}

// check if v has a value between a and b
function between(v, a, b) {
	return ((v >= a) && (v <= b)) || ((v >= b) && (v <= a))
}
utils.testBetween = () => {
	test.eq(between(1, 0, 2), true)
	test.eq(between(1, 1, 2), true)
	test.eq(between(1, 0, 1), true)
	test.eq(between(1, 1, 1), true)
	test.eq(between(1, -1, 0), false)
	test.eq(between(1, 2, 3), false)
	test.eq(between(1, 2, 2), false)
	return true
}

// check if p is a point inside rectangle ab
function inRectangle(px = 0, py = 0, ax = 0, ay = 0, bx = 0, by = 0) {
	return between(px, ax, bx) && between(py, ay, by)
}

//stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function rgbToHex(rgb) {
	return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)
}
function hexToRgb(out, hex) {
	let i = parseInt(hex, 16)
	out[0] = (i >> 16) & 255
	out[1] = (i >> 8) & 255
	out[2] = i & 255
	return out
}

function isPow2(n) {
	let l = Math.log2(n)
	return l === Math.floor(l)
}

var decrash_count = 0
function decrash() {
	console.log("no crash " + decrash_count)
	decrash_count++
}

function bad_str(val) {
	return !val || val === ""
}
utils.testBad_str = function () {
	return bad_str("") && bad_str()
}

// returns the difference between arr1 and arr2 (arr1 - arr2)
function diff(arr1, arr2) {
	return arr1.filter(function (i) { return arr2.indexOf(i) < 0 })
}
utils.testDiff = function () {
	var A = [1, 2, 3, 4]
	var B = [0, 2, 3, 5]
	return test.eq(diff(A, B), [1, 4]) && test.eq(diff(B, A), [0, 5])
}

// removes the elems of arr that prop === val
function arr_removeby(arr, prop, val) {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i][prop] === val) {
			remove(arr, i)
			i--
		}
	}
	return arr
}
utils.testArr_Removeby = function () {
	var A = utils.objs_arr(3)
	var B = [utils.obj(0), utils.obj(2)]
	arr_removeby(A, "prop1", "p1")
	return test.eq(A, B)
}

// returns a copy of the values of arr with value.prop !== val
function arr_filter_out(arr, prop, val) {
	return arr.filter(function (v) { return v[prop] !== val })
}
utils.testArr_filter_out = function () {
	var A = utils.objs_arr(3)
	var B = [utils.obj(0), utils.obj(2)]
	A = arr_filter_out(A, "prop1", "p1")
	return test.eq(A, B)
}

// returns a copy of the values of arr with value.prop === val
function arr_filter(arr, prop, val) {
	return arr.filter(function (v) { return v[prop] === val })
}
utils.testArr_filter = function () {
	var A = utils.objs_arr(3)
	var B = [utils.obj(1)]
	A = arr_filter(A, "prop1", "p1")
	return test.eq(A, B)
}

// returns the value of arr with value.prop === val
function arr_find(arr, prop, val) {
	return arr.find(v => { return v && v[prop] === val })
}
utils.testArr_find = function () {
	let A = utils.objs_arr(3)
	let B = A[1]
	test.eq(arr_find([null, null], "prop1", "p1"), undefined)
	A = arr_find(A, "prop1", "p1")
	return test.eq(A, B)
}

// returns the index of the value of arr with value.prop === val
function arr_findIndex(arr = [], prop = "", val) {
	return arr.findIndex(v => { return v && v[prop] === val })
}
utils.testArr_findIndex = () => {
	let A = utils.objs_arr(3)
	test.eq(arr_findIndex([null, null], "prop1", "p1"), -1)
	return test.eq(arr_findIndex(A, "prop1", "p1"), 1)
}

// swaps the values at i0 and i1
function arr_swapIndexes(arr = [], i0 = 0, i1 = 0) {
	let aux = arr[i0]
	arr[i0] = arr[i1]
	arr[i1] = aux
}
utils.testArr_swapIndexes = () => {
	let A = utils.objs_arr(2), B = utils.objs_arr(2)
	arr_swapIndexes(A, 0, 0)
	test.eq(A, B)
	arr_swapIndexes(A, 0, 1)
	test.eq(A[1], B[0])
	return test.eq(A[0], B[1])
}

// returns the value of arr with value.prop === val and removes it
function arr_extract(arr, prop, val) {
	let i = arr.findIndex(v => { return v && v[prop] === val })
	if (i === -1)
		return undefined
	let r = arr[i]
	arr_remove(arr, i)
	return r
}
utils.testArr_extract = function () {
	test.eq(arr_extract([null, null], "a", 1), undefined)
	let A = [{ a: 1 }, { b: 2 }, { c: 3 }], B = [{ b: 2 }, { c: 3 }]
	let a = arr_extract(A, "a", 1)
	test.eq(a, { a: 1 })
	test.eq(A, B)
	return true
}

function minmax(values) {
	return [Math.min(...values), Math.max(...values)]
}
utils.testMinmax = () => {
	return test.eq(minmax([0, 1, 2, 3]), [0, 3])
}

function arr_indexOfAll(arr, values) {
	return values.map(_v => arr.indexOf(_v))
}
utils.testIndexOfAll = () => {
	return test.eq(arr_indexOfAll([3, 2, 1, 0], [1, 2, 3]), [2, 1, 0])
}

// returns a shallow copy of a portion of an array
function arr_RangeIndex(arr, i0, i1) {
	return arr.slice(i0, i1)
}
function arr_RangeIndexArr(arr, indexs) {
	const [min, max] = minmax(indexs)
	return arr.slice(min, max + 1)
}

// returns arr_RangeIndex but finds indexs for you
function arr_Range(arr, v0, v1) {
	return arr_RangeIndex(arr.indexOf(v0), arr.indexOf(v1))
}
function arr_RangeArr(arr, values) {
	const indexs = arr_indexOfAll(arr, values)
	return arr_RangeIndexArr(arr, indexs)
}
utils.testArrRangeArr = () => {
	return test.eq(arr_RangeArr(["a", "b", "c", "d"], ["b", "d"]), ["b", "c", "d"])
}

// compares 2 arrays
function arr_compare(a, b) {
	return a.every((v, i) => v === b[i])
}
utils.testArr_compare = () => {
	test.true(arr_compare([], []))
	test.true(arr_compare([0.0], [0]))
	test.false(arr_compare([0, 0, 1], [0, 0, 0]))
	return true
}

// removes the elems of obj that prop === val
function removeby(obj, prop, val) {
	for (var k in obj) {
		var v = obj[k]
		if (obj[k][prop] === val)
			delete obj[k]
	}
	return obj
}
utils.testRemoveby = function () {
	var A = utils.objs(3)
	var B = { 0: utils.obj(0), 2: utils.obj(2) }
	removeby(A, "prop1", "p1")
	return test.eq(A, B)
}

// returns the elems of obj
function obj2arr(obj) {
	var arr = []
	for (var k in obj)
		arr.push(obj[k])
	return arr
}
utils.testObj2arr = function () {
	var A = utils.objs(2)
	var B = [utils.obj(0), utils.obj(1)]
	A = obj2arr(A)
	return test.eq(A, B)
}

// returns elems from its keys
function keys2objs(obj, keys) {
	var arr = []
	for (var i in keys)
		arr.push(obj[keys[i]])
	return arr
}
utils.testKeys2objs = function () {
	var A = utils.objs(5)
	var B = utils.objs_arr(2)
	A = keys2objs(A, [0, 1])
	return test.eq(A, B)
}

// returns the key of a value in an obj
function getKey(obj, value) {
	return Object.keys(obj).find(key => obj[key] === value)
}
utils.testGetKey = () => {
	return test.eq(getKey({ a: 1, b: 2, c: 3 }, 2), "b")
}

// returns the values of prop of all the elems
function by(obj, prop) {
	var arr = []
	for (var k in obj)
		arr.push(obj[k][prop])
	return arr
}
utils.testBy = function () {
	var A = utils.objs(3)
	var B = ["p0", "p1", "p2"]
	A = by(A, "prop1")
	return test.eq(A, B)
}

// returns the values of prop of all the elems of the array
function arr_by(arr = [], prop = "") {
	let r = []
	for (let e of arr) {
		if (e)
			r.push(e[prop])
	}
	return r
}
utils.testArr_by = function () {
	let A = utils.objs_arr(3)
	A.push(null)
	let B = ["p0", "p1", "p2"]
	A = arr_by(A, "prop1")
	return test.eq(A, B)
}
// arr_by applied multiple times
function arr_byby(arr = [], ...props) {
	for (let p of props) {
		arr = arr_by(arr, p)
	}
	return arr
}

// returns the objs with a prop === val
function filter(obj, prop, val) {
	var arr = []
	for (var k in obj) {
		var v = obj[k]
		if (v[prop] === val)
			arr.push(v)
	}
	return arr
}
utils.testFilter = function () {
	var A = utils.objs(3)
	var B = [utils.obj(1)]
	A = filter(A, "prop1", "p1")
	return test.eq(A, B)
}

// returns the first obj with a prop === val
function obj_find(obj, prop, val) {
	for (let k in obj) {
		let v = obj[k]
		if (v[prop] === val)
			return v
	}
	return null
}
utils.testObjFind = function () {
	let A = obj_find(utils.objs(3), "prop1", "p1")
	return test.eq(A, utils.obj(1))
}

// returns the number of keys of an object
function num_keys(obj) {
	return Object.keys(obj).length
}
utils.testNum_keys = function () {
	var A = num_keys(utils.obj(1))
	return test.eq(A, 2)
}

// a new array [n0..n]
function countArray(n, n0 = 0) {
	let arr = new Array(n - n0)
	for (let i = n0; i < n; i++)
		arr[i - n0] = i
	return arr
}
utils.testCountArray = () => {
	test.eq(countArray(3), [0, 1, 2])
	test.eq(countArray(3, 1), [1, 2])
	return true
}

// copy some properties from a to b
function copy_props(props, a, b) {
	for (let p of props)
		b[p] = a[p]
}

// reverse array elems from ini to fi
function reverse_arr(arr, ini, fi) {
	for (let i = ini, f = fi; i < f; i++ , f--) {
		let aux = arr[i]
		arr[i] = arr[f]
		arr[f] = aux
	}
	return arr
}
utils.testReverse_arr = () => {
	return test.eq(reverse_arr([0, 1, 2, 3, 4], 1, 3), [0, 3, 2, 1, 4])
}

function checkIP(str = "") {
	if (!/^\d+\.\d+\.\d+\.\d+$/.test(str))
		return false
	let arr = str.split(".")
	for (let v of arr) {
		let l = 1 // remove left 0's
		let n = v | 0
		if (n > 9)
			l++
		if (n > 99)
			l++
		if (v.length > l || n > 255 || n < 0)
			return false
	}
	return true
}
utils.testCheckIP = () => {
	test.eq(checkIP(""), false)
	test.eq(checkIP("2.2.2."), false)
	test.eq(checkIP("-1.2.2.2"), false)
	test.eq(checkIP("256.2.2.2"), false)
	test.eq(checkIP("1.1.1.e"), false)
	test.eq(checkIP("1.1.1.2e"), false)
	test.eq(checkIP("1.1.1.+1"), false)
	test.eq(checkIP("01.1.1.1"), false)
	test.eq(checkIP("0.0.0.0"), true)
	test.eq(checkIP("255.255.255.255"), true)
	return true
}

// reverse array vec3 from ini to fi
function reverse_vec3_arr(arr, ini, fi) {
	for (let i = ini * 3, f = fi * 3; i < f; i += 3, f -= 3) {
		vec3.copyOffset(v0, 0, arr, i)
		vec3.copyOffset(arr, i, arr, f)
		vec3.copyOffset(arr, f, v0, 0)
	}
	return arr
}
utils.testReverse_vec3_arr = () => {
	return test.eq(reverse_vec3_arr(
		[0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4], 1, 3),
		[0, 0, 0, 3, 3, 3, 2, 2, 2, 1, 1, 1, 4, 4, 4]
	)
}

// gets max and min of a vec3 component
function vec3MinMax(arr, start = 0) {
	const l = arr.length
	let min = arr[start], max = arr[start]

	for (let i = start + 3; i < l; i += 3) {
		let v = arr[i]
		if (v < min)
			min = v
		else if (v > max)
			max = v
	}
	return [min, max]
}
utils.testVec3MinMax = () => {
	const t0 = [0, 0, 0, 1, 0, 0, 2, 0, 0]
	test.eq(vec3MinMax(t0), [0, 2])
	return true
}

// bind an obj variable to a setter func
function bindVar(obj, varname, v0, func) {
	let _varname = "_" + varname
	obj[_varname] = v0 // initial value
	objgetset(obj, varname, () => {
		return obj[_varname]
	}, v => {
		if (v === obj[_varname])
			return
		obj[_varname] = v
		func(v)
	})
}

function newIDPool() {
	const g = {
		next: 1,
		pool: [],
		clear() {
			g.pool.length = 0
			g.next = 1
		},
		get() {
			if (g.pool.length === 0)
				return g.next++
			return g.pool.pop()
		},
		remove(id) {
			if (id >= g.next) // maybe check the pool too
				console.error("newIDPool", id, "not emited")
			g.pool.push(id)
		},
		active() { // returns the number of active IDs
			return g.next - g.pool.length - 1
		},
	}
	return g
}

// creates a pool of reusable resources
function newPool(constructor) {
	const g = {
		pool: [],
		clear() {
			g.pool.length = 0
		},
		get() {
			if (g.pool.length === 0)
				return constructor()
			return g.pool.pop()
		},
		put(obj) {
			g.pool.push(obj)
		},
	}
	return g
}

function newPubSub() {
	let IDPool = newIDPool()
	let IDs = [], subs = [], publishing = false

	const obj = {
		publish(v) {
			if (!subs) {
				console.error("this pubsub is already shutdown")
				return
			}
			if (publishing)
				return
			publishing = true
			for (let f of subs)
				f(v)
			publishing = false
		},
		subscribe(f) {
			if (!subs) {
				console.error("this pubsub is already shutdown")
				return
			}
			subs.push(f)
			let id = IDPool.get()
			IDs.push(id)
			return id
		},
		unsubscribe(id) {
			if (!subs)
				return
			if (publishing)
				console.error("unsubscribe during publishing")
			let i = IDs.indexOf(id)
			if (i === -1) {
				console.error("subscription not found")
				return
			}
			remove(IDs, i)
			remove(subs, i)
			IDPool.remove(id)
		},
		// not allow further operations in this pubsub
		shutdown() {
			IDs = null
			subs = null
			IDPool = null
		},
		clear() {
			IDPool.clear()
			IDs.length = 0
			subs.length = 0
		},
		active() {
			return subs.length
		}
	}
	return obj
}

function newWaitGroup() {
	let promises = []

	let obj = {
		add(p) {
			promises.push(p)
		},
		wait() {
			let ps = promises
			promises = null
			return Promise.all(ps)
		},
	}
	return obj
}

// give unique name given an arr of objs with unique names
function getUniqueName(names = null, name = "") {
	if (!names.has(name))
		return name

	let n = 0
	// new name has number	
	let matches = name.match(/ \d+$/)
	if (matches) {
		n = parseInt(matches[0])
		name = name.substring(0, name.length - matches[0].length)
	}

	// increment previous match
	while (names.has(name + " " + n))
		n++

	return name + " " + n
}
utils.testGetUniqueName = () => {
	let A = new Set()
	A.add(getUniqueName(A, "ola"))
	A.add(getUniqueName(A, "ola 0"))
	A.add(getUniqueName(A, "ola 1"))
	A.add(getUniqueName(A, "ola"))
	A.add(getUniqueName(A, "oli"))
	test.eq(Array.from(A.values()), ["ola", "ola 0", "ola 1", "ola 2", "oli"])

	//test.performance(() => {
	//	A.push(getUniqueName("ola"))
	//})

	return true
}

// gives obj a getset for its unique name based on arr
function bindName(obj = null, arr = [], callback = noop) {
	obj._name = ""
	obj.name_changes = newPubSub()
	if (!arr.names) {
		arr.names = new Set()
		project.onclear.subscribe(() => {
			arr.names.clear()
		})
	}
	obj.ondelete.subscribe(() => {
		arr.names.delete(obj._name)
	})

	objgetset(obj, "name", () => {
		return obj._name
	}, (v) => {
		if (!v || v === obj._name)
			return
		let old_name = obj._name
		arr.names.delete(old_name)

		obj._name = getUniqueName(arr.names, v)
		arr.names.add(obj._name)
		obj.name_changes.publish(obj._name)
		callback(obj._name)

		if (!old_name)
			return

		ws.expect(obj._name) // send to core
		ws.get("rename" + obj.type, old_name, obj._name).then((_name) => {
			if (obj._name !== _name)
				console.error("obj.name", name, "!==", _name)
		})
	})
}

function coreConfParse(arr, prefix = "", obj = {}) {
	for (let v of arr) {
		if (v.subgroup) {
			coreConfParse(v.subgroup, prefix + v.name + ":", obj)
			continue
		}
		obj[prefix + v.name] = v.value
		if (v.values)
			obj[v.name + "_values"] = v.values
	}
	return obj
}

// return an object to set a function to be executed next frame
function newFrameAction() {
	let f = null // final function
	return {
		set value(v) {
			if (!f) {
				requestAnimationFrame(() => {
					f()
					f = null
				})
			}
			f = v
		}
	}
}

// schedule work to execute on a later frame, can override by tag name
let schedule = {
	fs: [], tags: [],
	push(f = noop, tag = "") {
		if (tag) {
			let pos = schedule.tags.indexOf(tag)
			if (pos !== -1) {
				arr_remove(schedule.tags, pos)
				arr_remove(schedule.fs, pos)
			}
			schedule.tags.push(tag)
			schedule.fs.push(f)
		}
	},
	work() {
		if (!schedule.fs.length)
			return
		schedule.tags.shift()
		schedule.fs.shift()()
	}
}


function CallUntilResolved(f) {
	return f().then(r => {
		return r
	}).catch(() => {
		return CallUntilResolved(f)
	})
}

function delay(r = null, time = 1000) {
	return new Promise(ok => {
		setTimeout(() => {
			ok(r)
		}, time)
	})
}

function promiseInterval(pf, callback, interval = 1000) {
	pf().then(v => {
		callback(v)
		delay(null, interval).then(() => promiseInterval(pf, callback, interval))
	})
}

function promise_arr(values = [], f = noop) {
	const ps = []
	for (const v of values) {
		ps.push(f(v))
	}
	return Promise.all(ps)
}

function defaultProps(o = {}, def = {}) {
	for (let p in o)
		def[p] = o[p]
	return def
}

// return v clamped between min and max
function clamp(v = 0, min = 0, max = 0) {
	if (v < min)
		return min
	if (v > max)
		return max
	return v
}

// dynamic obj getters and setters
const getset = Object.defineProperty
/* example:
getset(obj, "value", {
	get() {
		return v
	},
	set(_v) {
		v = _v
	}
})*/

// native version of openFileDialog
function getFileDialog(extensions = "", multiple = false) {
	return new Promise(ok => {
		if (getFileDialog.pending) {
			getFileDialog.pending(null)
		}
		getFileDialog.pending = ok

		let input = getFileDialog.input
		input.accept = extensions
		input.multiple = multiple
		input.onchange = e => {
			getFileDialog.pending = null
			if (multiple)
				ok(input.files)
			else
				ok(input.files[0])
		}
		input.click()
	})
}
getFileDialog.input = newElem("input")
getFileDialog.input.type = "file"
getFileDialog.pending = null

function inputFileDialog(extensions = "", multiple = false) {
	return getFileDialog(extensions, multiple).then(f => {
		if (!f) {
			console.log("cancelled")
			return f
		}
		return f.path || URL.createObjectURL(f)
	})
}

function openFileDialog(title, filters) {
	if (!in_electron)
		return inputFileDialog(filters[0].extensions[0])

	const { dialog, getCurrentWindow } = electron.remote
	let p = new Promise((resolve, reject) => {
		dialog.showOpenDialog(getCurrentWindow(), { title: title, properties: ['openFile'], filters: filters }, (filename) => {
			if (filename) {
				resolve(filename[0])
			} else {
				reject("Cancelled")
			}
		})
	})
	return p
}

//TODO: implement for browser
function saveFileDialog(title, filters) {
	if (!in_electron) { // todo
		let p = filters[0]
		return Promise.resolve("/path/" + p.name + "." + p.extensions)
	}
	const { dialog, getCurrentWindow } = electron.remote
	let p = new Promise((resolve, reject) => {
		dialog.showSaveDialog(getCurrentWindow(), { title: title, filters: filters }, (filename) => {
			if (filename) {
				resolve(filename)
			} else {
				reject("Cancelled")
			}
		})
	})
	return p
}

function yesnoDialog(question) {
	if (in_electron) {
		const { dialog, getCurrentWindow } = electron.remote

		return new Promise((resolve, reject) => {
			dialog.showMessageBox(
				getCurrentWindow(),
				{
					message: question,
					type: 'question',
					buttons: ['Yes', 'No'],
					defautId: 0,
					cancelId: 1
				},
				(response) => {
					resolve(response == 0)
				}
			)
		})
	} else {
		return Promise.resolve(confirm(question))
	}
}

registerCustomElem("dialog-input", () => {
	const elem = newCustomElem("dialog")
	setStyle(elem.style, {
		color: "white",
		background: "grey",
		borderRadius: "1em",
		padding: "1em",
	})

	const txt = append(elem, newDIV())
	const input = append(elem, newINPUT("text"))

	setAPIElem("txt", txt)
	setAPIElem("input", input)

	return elem
})

function inputStringDialog(txt = "", f = noop) {
	const d = newCustomElem("dialog-input")
	getAPIElem("txt", d).textContent = txt
	append(document.body, d)
	showElem(d)

	const input = getAPIElem("input", d)
	input.onkeydown = () => {
		if (event.key === "Enter") {
			f(input.value)
			document.body.removeChild(d)
		}
		else if (event.key === "Escape") {
			f(false)
			document.body.removeChild(d)
		}
	}

	return d
}

function newWindow(url = "test", w = 200, h = 200, left = 0, top = 0) {
	return window.open(url, "", "width=" + w + ",height=" + h + ",top=" + top + ",left=" + left)
}

function trackMouseCycle(ev, coord_elem = document.body, down = noop, move = noop, up = noop) {
	const r = coord_elem.getBoundingClientRect()
	let x = ev.pageX - r.left, y = ev.pageY - r.top
	down(x, y, x / r.width, y / r.height) // x, y, %x, %y
	const mm = window.onmousemove, mu = window.onmouseup
	const tm = coord_elem.ontouchmove, te = coord_elem.ontouchend

	window.onmousemove = e => {
		x = e.pageX - r.left, y = e.pageY - r.top
		move(x, y, x / r.width, y / r.height)
	}
	coord_elem.ontouchmove = e => {
		window.onmousemove(e.targetTouches[0])
		e.preventDefault()
	}
	window.onmouseup = e => {
		x = e.pageX - r.left, y = e.pageY - r.top
		up(x, y, x / r.width, y / r.height)
		window.onmousemove = mm
		window.onmouseup = mu
		coord_elem.ontouchmove = tm
		coord_elem.ontouchend = te
	}
	coord_elem.ontouchend = e => {
		window.onmouseup(e.changedTouches[0])
	}
}

function setMouseCycle(coord_elem = document.body, down = noop, move = noop, up = noop) {
	coord_elem.onmousedown = e => {
		trackMouseCycle(e, coord_elem, down, move, up)
	}
	coord_elem.ontouchstart = e => {
		coord_elem.onmousedown(e.targetTouches[0])
	}
}

function trackPointerCycle(o = {}) {
	o = defaultProps(o, { start: document.body, coord: null, down: noop, move: noop, up: noop, any: noop })
	o.coord = o.coord || o.start

	o.start.style.touchAction = "none"

	o.start.onmousedown = e => {
		cycle(e)
	}
	o.start.ontouchstart = e => {
		e.preventDefault()
		cycle(e.targetTouches[0])
	}

	let r = null // bounding rectangle

	function call(ev, f) {
		const x = ev.pageX - r.left, y = ev.pageY - r.top
		const _x = x / r.width, _y = y / r.height // %x, %y
		f(x, y, _x, _y)
		o.any(x, y, _x, _y)
	}

	function cycle(ev) {
		r = o.coord.getBoundingClientRect()
		call(ev, o.down)
		const mm = window.onmousemove, mu = window.onmouseup
		const tm = o.start.ontouchmove, te = o.start.ontouchend

		window.onmousemove = e => {
			call(e, o.move)
		}
		o.start.ontouchmove = e => {
			window.onmousemove(e.targetTouches[0])
		}
		window.onmouseup = e => {
			call(e, o.up)
			window.onmousemove = mm
			window.onmouseup = mu
			o.start.ontouchmove = tm
			o.start.ontouchend = te
		}
		o.start.ontouchend = e => {
			window.onmouseup(e.changedTouches[0])
		}
	}
}

function polyfill(fname = "", f) {
	if (!window[fname])
		window[fname] = f
	else
		console.warn(`remove ${fname} polyfill`)
}
