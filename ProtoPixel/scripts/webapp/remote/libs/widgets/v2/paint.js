"use strict"

newImports(
	"widgets/v2/color.js",
	"widgets/v2/button.js",
	"widgets/v2/input2D.js",
	"gl-matrix-min.js",
).then(initCustomElem("paint"))

defineCustomElem("paint", () => {
	const elem = newDIV()
	setStyle(elem, {
		display: "flex",
		flexDirection: "column",
		background: "black",
		cursor: "crosshair",
	})
	setCSSvar(elem, "color", "white")

	const container = append(elem, newDIV(), {
		flex: 1,
		position: "relative",
	})

	const canvasBg = append(container, newElem("canvas"), {
		position: "absolute",
		width: "100%", height: "100%"
	})

	const canvas = append(container, cloneElem(canvasBg), {
		zIndex: 1,
		pointerEvents: "none",
	})

	const controls = append(elem, newDIV(), {
		display: "flex",
	})

	const picker = append(controls, newCustomElem("colorH"), {
		flex: 1,
	})

	const state = append(controls, newDIV())

	const clear = append(state, newCustomElem("button", "✕"), {
		width: "3em",
		padding: "0.3em 0.4em 0.4em 0.4em",
	})

	const color = append(state, newDIV(), {
		height: "3em",
		background: "var(--color)",
	})

	return { elem, canvas, canvasBg, picker, clear, color }
})

function newPaint() {
	const elem = newCustomElem("paint")
	const { clear, color, picker: epicker, canvas: ecanvas, canvasBg } = useAPIs(elem)
	const picker = newInput2D(epicker)

	const w = 1024, h = 1024, last = new Float32Array([0, 0])
	function initCanvas(elem) {
		const c = elem.getContext("2d")
		elem.width = w, elem.height = h
		return c
	}

	const c = initCanvas(canvasBg), front = initCanvas(ecanvas)

	const canvas = newInput2D(canvasBg, {
		down(x, y, _x, _y) {
			// break continuity
			coords(v0, _x, _y)
			last[0] = _x, last[1] = _y
		},
		up() {
			c.beginPath()
			o.ondrawend()
		},
	})
	canvas.onchange = v => {
		draw()
		o.pointer[0] = v[0], o.pointer[1] = v[1]
		o.ondraw(canvas.value, last) // new, old
		o.onchange(o.value, canvas.value)
		last[0] = v[0], last[1] = v[1]
	}

	picker.onchange = v => {
		o.hsv[0] = v[0]
		hsvToRgb2(o.hsv, o.value)
		const css = rgb2css(o.value)
		c.strokeStyle = css
		color.style.background = css
		o.onchangecolor(o.value)
		o.onchange(o.value, canvas.value)
	}

	clear.onclick = e => {
		o.clear()
		o.onclear()
	}

	const o = {
		elem: elem, canvas: canvasBg,
		onchange: noop, ondraw: noop, onchangecolor: noop,
		onclear: noop, ondrawend: noop,
		value: new Uint8Array([255, 255, 255]),
		hsv: new Float32Array([0, 1, 1]),
		pointer: new Float32Array([0, 0]),
		lights: null, focus: null,

		clear() {
			c.clearRect(0, 0, w, h)
		},

		setLights(t = null, ps = null, focus = null) {
			o.lights = ps, o.focus = focus
			mat4.invert(t, t)
			// convert ps to % coords
			transformPoints(ps, t)
			transformPoints(focus, t)
			drawLights()
		},

		paintLine(x1, y1, x2, y2, color) {
			c.strokeStyle = rgb2css(color)
			c.beginPath()
			c.moveTo(x1 * w, y1 * h)
			c.lineTo(x2 * w, y2 * h)
			c.stroke()
		},

		endPaintLine() {
			c.strokeStyle = rgb2css(o.value)
		},
	}

	const v3_0 = new Float32Array(3)
	let v0 = canvas.value.slice()
	c.lineWidth = 70
	c.lineJoin = "round"
	c.lineCap = "round"
	c.strokeStyle = rgb2css(o.value)
	front.lineWidth = 2 // circles

	function coords(v, x, y) {
		v[0] = x * w, v[1] = y * h
	}

	function draw() {
		c.beginPath()

		const v = canvas.value.slice()
		coords(v, v[0], v[1])

		c.moveTo(v0[0], v0[1])
		c.lineTo(v[0], v[1])
		c.stroke()
		v0 = v.slice()
	}

	function drawCircle(x = 0, y = 0) {
		front.beginPath()
		front.arc(x, y, 7, 0, 2 * Math.PI)
		front.stroke()
	}

	function drawLights() {
		front.strokeStyle = "rgba(255,255,255,0.3)"
		drawPoints(o.lights)
		front.strokeStyle = "#2995d2" // ppx highlight color
		drawPoints(o.focus)
	}

	function drawPoints(ps = null) {
		if (!ps)
			return
		const l = ps.length
		for (let i = 0; i < l; i += 3) {
			drawCircle(ps[i], ps[i + 1])
		}
	}

	// convert arr to % coords
	function transformPoints(ps = null, t = null) {
		if (!ps || !t)
			return
		const l = ps.length, _w = w * 0.5, _h = h * 0.5
		for (let i = 0; i < l; i += 3) {
			v3_0[0] = ps[i], v3_0[1] = ps[i + 1], v3_0[2] = 1

			vec3.transformMat4(v3_0, v3_0, t)

			ps[i] = v3_0[0] * w + _w, ps[i + 1] = -v3_0[1] * h + _h
		}
	}

	return o
}
