"use strict"

newImports(
	"pl.js",
	"pl_testing.js",
	"utils.js",
	"gl-matrix-min.js",
	"gl-matrix-ppx.js"
).then(() => { core.init() })

const core = {
	stub: false,
	load_mode: false,
	init() {
		if (!URLParams.test)
			return
		document.title += " test"
		core.stub = true
		core._detectDevice()
		core._detectDevice()
		core.refreshInterval *= 10
	},
	refreshInterval: 3000,

	ping() {
		ws.expect(true)
		return ws.get("ping")
	},
	getVersionInfo() {
		ws.expect(["2017-03-23 11:53:43", "1071619", "2.0.0-beta4"])
		return ws.get("getVersionInfo")
	},
	getUpdateAvailable(b = randomBool()) {
		return fetchx({ upgradeable: b }, "/admin/update/check").then(v => {
			if (v.error)
				return console.error(v.error)
			return v.upgradeable
		})
	},
	update(b = randomBool()) {
		return postForm("/admin/update/check").then(v => {
			if (v.error) // ex: "Error downloading update"
				return console.error(v.error)
			if(core.stub)
				return b
			return v.ok
		})
	},

	license_cache: {
		begin: new Date(2016),
		end: new Date(2017),
		left() { // time left in 1/10 seconds
			const duration = this.end.valueOf() - (new Date()).valueOf()
			return Math.floor(duration / (100 * 60 * 60 * 24))
		},
	},
	getLicenseStatus() {
		const l = core.license_cache
		if (core.stub) {
			ws.expect({
				begin: l.begin.toISOString(), //"2017-03-21"
				end: l.end.toISOString(), //"2017-04-20"
				is_perpetual: false,
				is_valid: false,
				client: "unknown",
				client_email: "unknown@alpha.create.protopixel",
				client_id: "7309ee38-3167-4449-b26a-99f0179e4bfa"
			})
		}
		return ws.get("getLicenseStatus").then(v => {
			l.begin = Date.parse(v.begin)
			l.end = Date.parse(v.end)
			return v
		})
	},
	setLicense(v, valid = true) {
		if (core.stub && valid) {
			const now = new Date(), l = core.license_cache
			l.begin = now
			l.end = new Date(now.valueOf() + 30 * 24 * 60 * 60 * 1000)
		}
		ws.expect(valid)
		return ws.get("setLicense", v)
	},
	getSubscriptionCertRequest() {
		if (core.stub)
			ws.expect(randomString(135) + "==")
		return ws.get("getSubscriptionCertRequest")
	},
	getCurrentProject(expect = "path/to/project A.ppxproj") {
		ws.expect(expect)
		return ws.get("getCurrentProject")
	},
	isNode(b = randomBool()) {
		ws.expect(b)
		return ws.get("isNode")
	},
	getFPS() {
		ws.expect(randomRange((1, 150)))
		return ws.get("getFPS")
	},

	saveProject(filepath = "") {
		ws.command("saveProject", filepath)
	},
	loadProject(filepath) {
		ws.expect(!!filepath)
		return ws.get("loadProject", filepath)
	},
	exportProjectToString() {
		if (core.stub)
			ws.expect(randomString(99))
		return ws.get("exportProjectToString")
	},

	create(_obj, ...params) {
		if (core.load_mode)
			return
		if (core.stub) {
			if (!_obj.name)
				console.error("no name given", _obj)
			ws.expect(_obj.name)
		}
		ws.get("create" + _obj.type, _obj.name, ...params).then(_name => {
			if (_obj.name !== _name)
				console.error("sync:", _obj.name, "!==", _name)
		})
	},

	getWorkSpaceItems() {
		// fill expectations
		if (core.stub) {
			let names = []
			for (let name of arr_by(geometry.order, "_name"))
				names.push("fixture:" + name)
			for (let name of arr_by(contents.order, "_name"))
				names.push("content:" + name)

			if (!names.length) { // invent new items
				for (let i = 0; i < 10; i++)
					names.push((randomBool() ? "fixture:F" : "content:C") + randomString(8))
			}
			ws.expect(names)
		}
		return ws.get("getWorkSpaceItems", "root")
	},
	setWorkSpaceItemsOrder(items = []) {
		ws.expect(true)
		ws.get("setWorkSpaceItemsOrder", "root", items).then(success => {
			if (!success) {
				core.getWorkSpaceItems().then(wi => {
					console.error("GUI workspace order inconsistent with core:", wi)
				})
			}
		})
	},

	getAllFixtures() {
		if (core.stub)
			ws.expect(arr_by(geometry.order, "_name"))
		return ws.get("getAllFixtures")
	},

	detectedDevices: [],
	_detectDevice(name = "D" + randomString(8)) {
		let dd = core.detectedDevices
		let n = dd.length
		if (n < 10)
			n = "0" + n
		dd.push(["00:00:00:00:00:" + n, name])
	},
	// get every device [MAC, name]
	getAllDetectedDevices() {
		ws.expect(core.detectedDevices)
		return ws.get("getAllDetectedDevices")
	},
	_renameDevice(MAC, name) {
		let dd = core.detectedDevices
		for (let i in dd) {
			if (MAC === dd[i][0]) {
				dd[i][1] = name
				return
			}
		}
	},

	getConfFixture(name) {
		if (!core.stub)
			return ws.get("getConfFixture", name)
		const f = geometry.find(name) || {}
		const _types = ["Point", "Line", "Matrix", "Custom"]
		const type = f.type2 || _types[randomIntRange(0, _types.length - 1)]
		const size = f.LED_size || round(randomRange(0.003, 0.01), 3)
		let args = []
		let w = f.w || randomIntRange(1, 10), p = f.pitch || randomIntRange(1, 10) * 0.001 + 0.01, h = 0
		p = round(p, 3)

		if (type === "Matrix")
			args = [w, f.h || randomIntRange(1, 10), p]
		else
			args = [w, p]

		ws.expect([
			{ name: "js_payload", value: { type: type, args: args, LED_size: size }, type: "JSONvalue" },
			{ name: "light_positions", value: [0.01, 0.01, 0, 0.02, 0.02, 0], type: "JSONvalue" },
			{
				name: "DMX parameters", type: "string", subgroup: [
					{ name: "channel layout", value: "0,255,r,g,b,0,0", type: "string" },
				]
			},
			{ name: "PPX GRB ordering", value: false, type: "bool" },
			{ name: "PPx double points", value: false, type: "bool" },
			{ name: "PPx gamma correction", value: false, type: "bool" },
			{ name: "PPx temporal dithering", value: false, type: "bool" },
		])
		return ws.get("getConfFixture", name)
	},

	getControllers() {
		if (core.stub) {
			let names = arr_by(controllers.order, "_name")
			if (!names.length) { // invent new items
				for (let i = 0; i < 5; i++)
					names.push("P" + randomString(8))
			}
			ws.expect(names)
		}
		return ws.get("getControllers")
	},

	getControllerOutlets(name = "") {
		if (core.stub) {
			let names = []
			for (let name of arr_by(geometry.order, "_name"))
				names.push("fixture:" + name)
			ws.expect([names]) // all fixtures in the first outlet
		}
		return ws.get("getControllerOutlets", name)
	},

	getConfController(name) {
		if (core.stub) {
			let test_arr = [
				{ name: "connected", value: randomBool() },
				{ name: "outlets", value: randomIntRange(1, 8) },
				{ name: "type", value: "ProtoPixel" },
				{ name: "Device", value: "00:00:00:00:00:0" + randomIntRange(0, 9) },
			]
			ws.expect(test_arr)
		}
		return ws.get("getConfController", name)
	},

	getConfDevice(MAC) {
		if (!core.stub)
			return ws.get("getConfDevice", MAC)

		let test_arr = [
			{ read_only: true, display_name: "Device Type", name: "Device Type", workspace_widget: false, value: "PPx test", type: "string" },
			{ read_only: true, display_name: "HW version", name: "HW version", min: 0, max: 99, value: randomIntRange(0, Math.pow(2, 3)), workspace_widget: false, type: "int" },
			{ read_only: true, display_name: "Firmware Version", name: "Firmware Version", min: 0, max: 99, value: randomIntRange(0, Math.pow(2, 3)), workspace_widget: false, type: "int" },
			{ read_only: true, display_name: "MAC Address", name: "MAC Address", workspace_widget: false, value: MAC, type: "string" },
			{ read_only: true, display_name: "Actual IP Address", name: "Actual IP Address", workspace_widget: false, value: randomIP(), type: "string" },
			{ read_only: true, display_name: "Installed outlets", name: "Installed outlets", min: 0, max: 99, value: randomIntRange(1, Math.pow(2, 4)), workspace_widget: false, type: "int" },
			{ read_only: false, display_name: "name", name: "name", workspace_widget: false, value: "D" + randomString(8), type: "string" },
			{ read_only: true, display_name: "lights per outlet", name: "lights per outlet", min: 1, max: Math.pow(10, 6), value: randomIntRange(1, 2000), workspace_widget: false, type: "int" },
			{ read_only: false, display_name: "DHCP enabled", name: "DHCP enabled", workspace_widget: false, value: randomBool(), type: "bool" },
			{ read_only: false, display_name: "static IP", name: "static IP", workspace_widget: false, value: randomIP(), type: "string" },
			{ read_only: false, display_name: "static gateway", name: "static gateway", workspace_widget: false, value: randomIP(), type: "string" },
			{ read_only: false, display_name: "static mask", name: "static mask", workspace_widget: false, value: "255.255.255.0", type: "string" },
			{ type: "button", display_name: "reset", name: "reset" },
			{ type: "button", display_name: "factory reset", name: "factory reset" },
			{ read_only: false, display_name: "test mode", name: "test mode", workspace_widget: false, value: randomBool(), type: "bool" },
			{ read_only: false, display_name: "auto power off", name: "auto power off", workspace_widget: false, value: randomBool(), type: "bool" },
			{ read_only: false, display_name: "notification LED", name: "notification LED", workspace_widget: false, value: randomBool(), type: "bool" },
			{ read_only: true, name: "FPS", value: randomIntRange(0, 60), type: "string" },
		]
		let d = devices.detected[MAC]
		if (d) {
			let p = d.properties
			for (let prop of test_arr) {
				prop.value = p[prop.name]
			}
		}

		ws.expect(test_arr)
		return ws.get("getConfDevice", MAC)
	},

	getDeviceState(MAC) {
		if (core.stub)
			ws.expect({ connection: randomBool() ? "connected" : "disconnected", fps: randomRange(0, 60) })
		return ws.get("getDeviceState", MAC)
	},

	getConfContent(name = "") {
		if (!core.stub)
			return ws.get("getConfContent", name)
		//let c = contents.find(name)
		let types = ["py:image", "py:color", "py:video", "PythonProgram", "ProgramTestSquares", "SyphonPipe"]
		let type = types[randomIntRange(0, types.length - 1)]

		let test_arr = [
			{ type: "string", name: "Name", value: "omit me" },
			{ type: "string", name: "type", value: type },
			{ type: "bool", name: "enabled", value: true /*randomBool()*/ },
			{ type: "bool", name: "loop", value: randomBool() },
			{ values: ["overdraw", "alpha", "add", "subtract", "multiply", "screen"], type: "choose", name: "blend mode", value: "alpha" },
			{ type: "ofColor", name: "color levels", value: [255, 255, 255, 255] },
			{ values: ["flatsimple"], type: "choose", name: "projection type", value: "flatsimple" },
			{
				type: "group", name: "projection parameters", subgroup: [{ max: -3.402823466385289e+38, type: "float", name: "width", value: 1, min: -3.402823466385289e+38 },
				{ max: -3.402823466385289e+38, type: "float", name: "height", value: 1, min: -3.402823466385289e+38 }]
			},
			{ type: "FilePath", name: "python script", value: "/Users/edu/Desktop/parameters.py" },
			{
				type: "group", name: "params", subgroup: [
					{ type: "bool", name: "a_boolean", value: true },
					{ max: 5, type: "int", name: "a_integer", value: 5, min: 0 },
					{ max: 5, type: "float", name: "a_float", value: 0, min: 0 },
					{ type: "string", name: "a_string", value: "Hello" },
					{ type: "FilePath", name: "a_filepath", value: "/a/path" },
					{ type: "ofColor", name: "a_color", value: [0, 0, 0, 255] },
					{ type: "button", name: "a_button" },
					{ type: "ofColor", name: "color", value: [255, 0, 0, 255] },
					{ type: "FilePath", name: "image_path", value: assets_path + "logo.png" },
					{ type: "FilePath", name: "video_path", value: assets_path + "test_video.mp4" },
					{ type: "FilePath", name: "python script", value: "/foo/bar.py" }, // test
					{ type: "choose", name: "Syphon Pipe", value: "server1", values: ["server1", "server2"] },
				]
			},
			{ type: "button", name: "reload" },
		]

		// add random props
		const params = test_arr[test_arr.length - 2].subgroup
		params.push({ type: "string", name: randomString(10), value: "randoms" })

		ws.expect(test_arr)
		return ws.get("getConfContent", name)
	},

	_setConfCustomID(obj = null, id = "", param = "", v) {
		if (core.load_mode)
			return
		ws.command("setConf" + obj.type, id, param, v)
	},
	setConf(obj = null, param = "", v) {
		core._setConfCustomID(obj, obj.name, param, v)
	},

	getConfGlobal() {
		ws.expect([
			{ name: "default project", value: "/path/to/test_proj.ppxproj", display_name: "Starting Project", type: "path" },
			{ name: "autosave", value: true, display_name: "Autosave", type: "bool" },
			{ name: "use PBO", value: true, display_name: "Async Rendering", type: "bool" },
		])
		return ws.get("getConfGlobal")
	},

	_transforms: new Map(),
	setTransformation(e = null) {
		if (core.load_mode)
			return
		let t = Array.from(e.transform)
		if (core.stub)
			core._transforms.set(e.name, t)
		return ws.command("set" + e.type + "Transformation", e.name, t)
	},
	_getTransformation(name = "", type = "") {
		if (!URLParams.test)
			return ws.get(`get${type}Transformation`, name)

		const m = mat4Pool.get(), v = vec4Pool.get()
		mat4.identity(m)
		const r = 0.3
		mat4.setPosition(m, randomRange(-r, r), randomRange(-r, r), 0)

		if (type === "Content") {
			v[0] = randomRange(0.05, r), v[1] = randomRange(0.05, r), v[2] = 1
			mat4.scale(m, m, v)
		}

		ws.expect(Array.from(m))
		mat4Pool.put(m)
		vec4Pool.put(v)
		return ws.get(`get${type}Transformation`, name)
	},
	getTransformation(e = null) {
		let cb = () => ws.get("get" + e.type + "Transformation", e.name)
		if (!core.stub)
			return cb()

		let t = core._transforms.get(e.name)
		if (t) {
			console.error(e.name, "already found")
			ws.expect(t)
			return cb()
		}

		mat4.identity(m0)
		let r = 0.3
		mat4.setPosition(m0, randomRange(-r, r), randomRange(-r, r), 0)

		if (e.type === "Content") {
			v0[0] = randomRange(0.05, r), v0[1] = randomRange(0.05, r), v0[2] = 1
			mat4.scale(m0, m0, v0)
		}

		core._transforms.set(e.name, Array.from(m0))

		ws.expect(Array.from(m0))
		return cb()
	},

	_lightpositions: [
		[-0.045, 0.045, 0], [-0.035, 0.045, 0], [-0.025, 0.045, 0], [-0.015, 0.045, 0],
		[-0.005, 0.045, 0], [0.005, 0.045, 0], [0.015, 0.045, 0], [0.025, 0.045, 0],
	],
	getAllLightsPositions() {
		ws.expect(core._lightpositions)
		return ws.get("getAllLightsPositions")
	},
	getFixturePositions(names = []) {
		if (!names.length)
			return Promise.resolve([])

		return promise_arr(names, name => {
			ws.expect(core._lightpositions)
			return ws.get("getFixturePositions", name)
		}).then(ps => {
			return arr_flatten(ps)
		})
	},
}
