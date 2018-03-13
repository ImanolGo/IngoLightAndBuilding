"use strict"

// Protopixel Library Testing

newImport(
	"pl.js"
).then(() => {
	PL.throttling = 50

	PL.ws_api_test = function (ws) {
		console.log("using test ws")
		ws.send = noop

		let pending_msgs = 0 // introduce much fake lag
		ws.fake_message = function (r) {
			pending_msgs++
			setTimeout(function () {
				ws.onmessage({ data: JSON.stringify(r) })
				pending_msgs--
			}, pending_msgs * PL.throttling)
		}

		let get_response = false
		ws.expect = function (r) {
			if (get_response)
				console.error("previous get response not listened")

			get_response = r
		}

		let get = ws.get
		ws.get = function (command, ...args) {
			if (get_response === undefined)
				console.error("no response for next get")

			ws.fake_message({ id: ws.cmd_id, result: get_response })
			get_response = false
			return get(command, ...args)
		}

		let subscribe_response = false
		let subscribe_response_time = 0
		let subscribe_response_delay = 0
		ws.expect_subs = function (r, r_time, delay) {
			if (subscribe_response)
				console.error("previous subscribe needs an expectation")

			subscribe_response = r
			subscribe_response_time = r_time || 0
			subscribe_response_delay = delay || 0.5
		}

		let subs_handlers = new Map()
		let subscribe = ws.subscribe
		ws.subscribe = function (url, callback) {
			if (!subscribe_response)
				console.error("no expectation for next subscribe")

			url = checkSubscribeURL(url)
			let subs = parseSubscribeURL(url)
			subs.args = subscribe_response
			let R = JSON.stringify({ event: subs })
			subscribe_response = false

			let time = subscribe_response_time
			subscribe_response_time = 0
			let delay = subscribe_response_delay
			subscribe_response_delay = 0

			let path = subscribe(url, callback)
			if (path.test_handler)
				return path

			let send_random = function () {
				let f = Math.random()
				let i = Math.round(f * 100)
				let str = f.toString(36).substr(2)
				let b = i > 50
				let byte = Math.round(f * 255)
				let rgba = "[" + [byte, byte, byte, byte] + "]"
				let path = "/" + str.split("a").join("/")

				let macros = { f: f, i: i, b: b, rgba: rgba }
				let r = R

				for (let m in macros)
					r = r.split('"{' + m + '}"').join(macros[m])

				macros.str = str
				macros.path = path
				for (let m in macros)
					r = r.split("{" + m + "}").join(macros[m])

				ws.onmessage({ data: r })
			}

			if (time)
				path.test_handler = setInterval(send_random, time * 1000)
			else
				path.timeout_handler = setTimeout(send_random, delay * 1000)

			return path
		}

		let unsubscribe = ws.unsubscribe
		ws.unsubscribe = function (url) {
			for (let p of ws.topics.getAll(url)) {
				let h = p.test_handler
				if (h)
					clearInterval(h)
				if (p.timeout_handler)
					clearTimeout(p.timeout_handler)
			}
			unsubscribe(url)
		}
	}

	PL._test_settings = function (name) {
		name = name || "a_program"
		let settings = [{
			"name": "Name",
			"type": "string",
			"callback": "saveConfProgram",
			"value": name,
			osc_address: "/Program/" + name + "/Name",
		}, {
			"name": "enabled",
			"type": "bool",
			"callback": "saveConfProgram",
			"value": true,
			osc_address: "/Program/" + name + "/enabled",
		}, {
			"name": "a float",
			"type": "float",
			"callback": "saveConfProgram",
			"value": 10.2,
			"min": -2.5,
			"max": 101,
			osc_address: "/Program/" + name + "/a_float",
		}, {
			"name": "an int",
			"type": "int",
			"callback": "saveConfProgram",
			"value": 50,
			"min": -2,
			"max": 100,
			osc_address: "/Program/" + name + "/an_int",
		}, {
			"name": "a custom int",
			"type": "CustomInt",
			"callback": "saveConfProgram",
			"value": 8181,
			"min": 0,
			"max": 9999,
			osc_address: "/Program/" + name + "/a_customint",
		}, {
			"name": "str",
			"type": "string",
			"callback": "saveConfProgram",
			"value": "ola",
			osc_address: "/Program/" + name + "/str",
		}, {
			"name": "a button",
			"type": "button",
			"callback": "executeAction",
			osc_address: "/Program/" + name + "/a_button",
		}, {
			"name": "a file",
			"type": "FilePath",
			"callback": "saveConfProgram",
			//"value" : "lib/programs/video.py",
			osc_address: "/Program/" + name + "/a_file",
		}, {
			"name": "options",
			"type": "choose",
			"callback": "saveConfProgram",
			"values": ["t1", "t2", "t3", "t4", "t5", "t6"],
			"value": "t2", // testing
			osc_address: "/Program/" + name + "/options",
		}, {
			name: "color RGBA",
			type: "ofColor",
			value: [255, 100, 0, 0],
			callback: "saveConfProgram",
			osc_address: "/Program/" + name + "/color_RGBA",
		}, {
			name: "params",
			type: "group",
			subgroup: [{
				"name": "an int",
				"type": "int",
				"callback": "saveConfProgram",
				"value": 50,
				"min": -2,
				"max": 100,
				osc_address: "/Program/" + name + "/an_int",
			}],
		}
		]
		let sub = settings
		sub = sub[sub.length - 1].subgroup = copy(settings)
		sub = sub[sub.length - 1].subgroup
		sub = sub[sub.length - 1].subgroup = copy(settings)
		return settings
	}
})


// random results

function randomBool() {
	return Math.random() > 0.5
}

function randomString(chars = 34) {
	const arr = new Uint8Array(Math.ceil((chars + 2) / 4)) // every byte becomes 4 chars
	crypto.getRandomValues(arr)
	return btoa(arr).substr(2, chars)
}

function randomInt(digits = 1) {
	//return Math.round(Math.random() * (10 ** digits))
	return Math.round(Math.random() * pow(10, digits)) // safari
}

function randomRange(min = 0, max = 10) {
	return Math.random() * (max - min) + min
}

function randomIntRange(min = 0, max = 10) {
	return Math.round(randomRange(min, max))
}

function randomIP() {
	let ip = () => randomIntRange(1, 255)
	return ip() + ":" + ip() + ":" + ip() + ":" + ip()
}

// docs help

// prepares an element to be in the documentation
function docElem(elem) {
	let e = cloneElem(elem)

	let b = document.body
	hideChildren(b)
	b.style.background = "white"

	e.classList.add("documentation")
	append(b, e)
	showElem(e)
}
