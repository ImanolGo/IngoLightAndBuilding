// Protopixel Library

"use strict"

function noop() { }
//let noop = Function.prototype
function yes() { return true }
function echo(v) { return v }
function log(l) { console.log(l) }
function warn(w) { console.warn(w) }
function error(err) { console.error(err) }
function foo() { console.log("foo") }
function copy(obj) { return JSON.parse(JSON.stringify(obj)) }

let in_electron = true // to know if electron is available

// if no electron, create a stub require function
if (!window.require) {
	window.require = str => {
		return noop
	}
	in_electron = false
}

let PL = {}

PL.color = "#3F51B5"

function get(url, f, args) {
	let req = new XMLHttpRequest()
	args = args || {}
	req.responseType = args.type || ""
	req.timeout = args.timeout || 0
	//req.onerror = error
	req.onload = () => {
		f(req.response)
	}
	req.open("GET", url, true)
	req.send()
	return req
}

// Flags
function map2obj(map = null) {
	const o = {}
	for (const p of map)
		o[p[0]] = p[1]
	return o
}
let URLMap = new URLSearchParams(location.search + "&" + location.hash.substr(1))
let URLParams = map2obj(URLMap)

PL.checkParams = obj => {
	for (let k in obj) {
		if (!obj[k]) {
			console.error(k + " not given")
			return false
		}
	}
	return true
}

PL.newPathMap = function () {
	const PM = {
		data: {},
		_get(path) {
			return PM.data[path]
		},
		get(path) {
			let p = PM._get(path)
			if (!p)
				console.error("no path " + path)
			return p
		},
		add(path) {
			PM.data[path] = {}
			return PM.data[path]
		},
		_search(path) {
			let ps = []
			for (let p in PM.data) {
				if (p.startsWith(path))
					ps.push(p)
			}
			return ps
		},
		search(path) {
			let ps = PM._search(path)
			if (ps.length === 0)
				console.error("no path " + path)
			return ps
		},
		getAll(path) {
			let objs = []
			for (let p of PM.search(path))
				objs.push(PM.data[p])
			return objs
		},
		rm(path) {
			PM.get(path) // error checking
			delete PM.data[path]
		},
		rmAll(path) {
			for (let p of PM.search(path))
				delete PM.data[p]
		},
		_common(path) {
			path = path.split(":")
			let p
			while (path.length > 0) {
				let path_str = path.join(":")
				p = PM._get(path_str)
				if (p)
					return path_str
				path.pop()
			}
			return p
		},
		common(path) {
			let p = PM._get(PM._common(path))
			if (!p) {
				console.error("no common path: " + path)
				console.warn(JSON.stringify(PM.data))
			}
			return p
		},
	}
	return PM
}
PL.test_newPathMap = () => {
	let PM = PL.newPathMap()

	PM.add("a:b:c")
	test.eq(PM.get("a:b:c"), {})
	PM.add("a:b2:c2").x = 1
	test.eq(PM.get("a:b2:c2"), { x: 1 })
	PM.add("a:b2:c3")
	test.eq(PM.getAll("a:b2"), [{ x: 1 }, {}])

	test.eq(PM._common("a:b:d"), undefined)
	test.eq(PM._common("a:b:c:d"), "a:b:c")

	PM.rmAll("a:b2")
	test.eq(PM.search("a"), ["a:b:c"])
	PM.rmAll("a")
	test.eq(PM.data, {})
	return true
}

PL.new_websocket = (url = "") => {
	return new Promise(ok => {
		const nodeID = URLParams.node

		function getWS() {
			if (!url)
				return { send: noop }

			if (nodeID) {
				const ch = newChannel()
				ch.BridgeURL = "test.protopixel.net/ws"
				return node.dial(ch, nodeID, "SERVICE WEBSOCKET " + url)
			}

			return new WebSocket(url)
		}

		Promise.resolve(getWS()).then(ws => {
			ws.mute = true
			let send = ws.send.bind(ws)
			ws.send = data => {
				send(data)
				if (!ws.mute)
					console.log("-> " + data)
			}
			ws.plsend = data => {
				let str = JSON.stringify(data)
				send(str)
				if (!ws.mute)
					console.log("-> " + str)
			}
			ws.plurl = url
			ws.success = false

			ws.onerror = e => {
				send = noop
				//console.warn("certificate error? visit https://"+url)
				console.error("new_websocket error", e)
				ok(ws)
			}
			ws.onclose = e => {
				//developer.mozilla.org/en-US/docs/Web/API/CloseEvent
				console.log("ws closed with code " + e.code)
			}
			ws.onopen = () => {
				ws.success = true
				ok(ws)
			}
			ws.onmessage = e => {
				const data = e.data || e
				console.log("ws.onmessage <- " + data)
			}
			if (nodeID)
				return ws.onopen()
			if (!url)
				ok(ws)
		})

	})
}

function ws_url(url = "") {
	url = url || URLParams.ip || location.hostname || "localhost"
	let protocol = "wss", port = "8080"
	if (window.location.protocol !== "https:") {
		protocol = "ws"
		port = "8181"
	}
	return protocol + "://" + url + ":" + port
}

PL.websocket_api = (url = "") => { // "192.168.1.46"
	let URL = ws_url(url) + "/websocket_api"
	if (URLParams.test)
		URL = false

	return PL.new_websocket(URL).then(ws => {
		ws.hostname = url
		PL.ws_api_init(ws)
		if (!ws.success)
			PL.ws_api_test(ws)
		return ws
	})
}

PL.ws_api_init = ws => {
	ws.onmessage = e => {
		const data = e.data || e
		if (!ws.mute)
			console.log("<- " + data)

		const r = JSON.parse(data)
		if (r.error)
			ws.error(r)
		else if ('result' in r)
			response(r)
		else if (r.event)
			update(r.event)
	}

	const uint32 = new Uint32Array(1)
	ws.cmd_id = 0
	ws.exec = data => {
		data.id = ws.cmd_id
		ws.plsend(data)

		uint32[0]++
		ws.cmd_id = uint32[0]
	}

	ws.error = r => {
		console.error("server error: " + r.error)
	}

	ws.command = (command, ...args) => {
		if (!command)
			console.error("no command given")
		ws.exec({ id: 0, command: command, args: args })
	}

	ws.pending = new Map()
	function response(r) {
		let f = ws.pending.get(r.id)
		if (!f) {
			console.error(r.id + " response not listened")
			return
		}
		f(r.result)
		ws.pending.delete(r.id)
	}
	ws.get = (command, ...args) => {
		return new Promise(ok => { // detect if ok exists?
			ws.pending.set(ws.cmd_id, ok)
			ws.command(command, ...args)
		})
	}
	ws.expect = noop // for testing
	ws.expect_subs = noop // for testing

	ws.topics = PL.newPathMap()
	function update(u) {
		let k = u.domain + ":" + u.type
		const filter = u.args.address || ""
		if (filter)
			k += ":" + filter

		let pathMap = ws.topics.common(k)
		if (!pathMap) {
			console.error(k + " not an interesting subscription")
			return
		}
		pathMap.callback(u.args)
	}

	/*
	Content, WorkSpace, Controller, Fixture
		rename, parameter_modified, created, deleted, before_created, after_deleted, parameter_called
	Content
		new_texture_file
	Log
		entry
	
	(un)subscribe: {
		domain: "Content",
		type: "parameter_modified",
		filters: ["myvideo:params:position"] //optional
	}
	args: { // parameter_modified
		//this depends on the event domain and type.
		update: "myvideo",
		param: "params:position",
		address: "myvideo:params:position", // this is the address that we used for filtering
		value: {
			//The usual stuff here
		}
	}
	args: { // rename
		oldname: "myvideo",
		newname: "myvideo2"
	}
	*/
	//tree.taiga.io/project/chaosct-protolight/task/281
	//url = domain:type:path
	ws.subscribe = (url, callback) => {
		url = checkSubscribeURL(url)
		if (!callback) {
			console.error("no callback given")
			return
		}
		const subs = parseSubscribeURL(url)
		if (!PL.checkParams(subs))
			return

		ws.exec({ id: 0, subscribe: subs })

		let handler = ws.topics.add(url)
		handler.callback = callback
		return handler
	}
	ws.unsubscribe = (url) => {
		url = checkSubscribeURL(url)
		const unsubs = parseSubscribeURL(url)
		if (!PL.checkParams(unsubs))
			return

		//ws.exec({id:0, unsubscribe: unsubs})
		unsubs.filters = ""

		for (let f of ws.topics.search(url)) { // potser no cal
			ws.topics.rm(f)
			let arr = f.split(":")
			arr.splice(0, 2)
			unsubs.filters = [arr.join(":")]
			ws.exec({ id: 0, unsubscribe: unsubs })
		}
	}
}

function checkSubscribeURL(url) {
	if (url.charAt(url.length - 1) === ":")
		url = url.substring(0, url.length - 1)
	return url
}

function parseSubscribeURL(url) {
	let path = url.split(":")
	return { domain: path.shift(), type: path.shift(), filters: [path.join(":")] }
}

// app specific websocket
PL.app_channel = (channel_name = "", url = "") => {
	channel_name = channel_name || decodeURI(window.location.pathname.split('/')[2])
	if (location.search)
		channel_name = URLParams.id || channel_name

	console.log("app channel is " + channel_name)

	let URL = ws_url(url) + "/websocket"
	if (URLParams.test)
		URL = ""

	//return PL.new_websocket(protocol+"://"+window.location.host+"/websocket")
	return PL.new_websocket(URL).then(ws => {
		ws.channel_name = channel_name
		ws.send(channel_name)

		PL.ws_init(ws)
		return ws
	})
}

PL.ws_init = ws => {
	ws.onmessage = e => {
		const msg = e.data || e
		if (!ws.mute)
			console.log("<- " + msg)

		const data = JSON.parse(msg)
		if (data.error)
			ws.error(data.error)
		else if (data.id === undefined)
			ws.onevent(data.r)
		else
			response(data)
	}

	const uint32 = new Uint32Array(1)
	ws.cmd_id = 0
	ws.exec = msg => {
		msg.id = ws.cmd_id
		ws.plsend(msg)

		uint32[0]++
		ws.cmd_id = uint32[0]
	}

	ws.error = msg => {
		console.error("server error: " + msg)
	}

	ws.command = (command, ...args) => {
		if (!command)
			console.error("no command given")
		ws.exec({ id: 0, command, args })
	}

	ws.pending = new Map()
	function response(data) {
		const f = ws.pending.get(data.id)
		if (!f)
			return console.error(data.id + " response not listened")

		f(data.r)
		ws.pending.delete(data.id)
	}
	ws.get = (command, ...args) => {
		return new Promise(ok => { // detect if ok exists?
			ws.pending.set(ws.cmd_id, ok)
			ws.command(command, ...args)
		})
	}
	ws.respond = r => {
		if (!URLParams.test)
			return
		response({ id: ws.cmd_id - 1, r })
	}
}

//legacy
function PL_websocket() {
	function newWebSocket(url) {
		let protocol = "wss"
		if (window.location.protocol !== "https:") {
			protocol = "ws"
		}
		var ws = new WebSocket(protocol + "://" + window.location.host + url)
		ws.onerror = () => {
			console.error("ws error")
			ws.send = val => {
				console.log("ws send: " + val)
			}
		}
		ws.onclose = event => {
			console.warn("ws closed")
			console.log(event)
		}
		return ws
	}

	var connection = newWebSocket("/websocket")

	var channame = window.location.pathname.split('/')[1]

	connection.onopen = () => {
		connection.send(channame)
		connection.on_open()
	}

	connection.on_open = noop

	return connection
}
