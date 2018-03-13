"use strict"


newImports(
	"widgets/v2/input2D.js",
	"widgets/v2/string.js",
	"widgets/v2/slider.js"
)
	.then(initCustomElem("colorHS"))
	.then(initCustomElem("color"))

const gradient = {
	compile(dir = "", steps = "") {
		return `linear-gradient(${dir}, ${steps})`
	},
	combine(dir_steps_arr = [["", ""]]) {
		let s = ""
		for (const ds of dir_steps_arr)
			s += gradient.compile(ds[0], gradient[ds[1]]) + ","
		return s.slice(0, -1)
	},
	hue: "red, yellow, lime, cyan, blue, fuchsia, red",
	kelvin: "#ff6c00, white 45%, #b5cdff",
	toWhite: "rgba(255, 255, 255, 0), white",
	toBlack: "rgba(0, 0, 0, 0), black",
}

registerCustomElem("colorH", () => {
	const elem = newDIV()
	setStyle(elem, {
		background: gradient.compile("to right", gradient.hue),
		cursor: "crosshair",
	})
	return elem
})

defineCustomElem("colorHS", () => {
	const elem = newCustomElem("input2D")
	elem.style.background = gradient.combine([["to top", "toWhite"], ["to right", "hue"]])
	return elem
})

function newColorHS(_elem = null) {
	const xy = newInput2D(_elem || newCustomElem("colorHS"))

	const o = {
		elem: xy.elem, xy,
		onchange: noop,
		_value: new Float32Array([0, 0, 1]),
		get value() { return o._value },
		set value(_hsv) {
			o.xy.value = _hsv
			const val = o._value
			if (val !== _hsv) {
				const [h, s, v] = _v
				val[0] = h, val[1] = s, hsv[2] = v
			}
		},
	}

	xy.onchange = v => {
		o._value[0] = v[0]
		o._value[1] = v[1]
		o.onchange(o._value)
	}

	return o
}

defineCustomElem("color", () => {
	const elem = newDIV()
	setStyle(elem, {
		display: "flex",
		flexDirection: "column",
	})

	const hue = append(elem, newCustomElem("colorHS"), {
		flex: 3,
	})

	const g = append(elem, newDIV(), {
		flex: 1,
		display: "flex",
	})

	const input = append(elem, newCustomElem("string"), {
		flex: 1,
		textAlign: "center",
	})

	const brightness = newCustomElem("slider")
	append(g, brightness, {
		flex: 4,
		background: "linear-gradient(to right, black, white)",
		cursor: "crosshair",
	})

	const mode = append(g, newDIV(), {
		flex: 1,
		background: gradient.compile("to top", gradient.kelvin),
		cursor: "pointer",
	})

	return { elem, hue, brightness, mode, input }
})

function newColor(_elem = null) {
	const elem = _elem || newCustomElem("color")
	const { hue, brightness, mode, input } = getAPIs(elem)
	const { pointer: result } = getAPIs(brightness)

	const o = {
		elem,
		hue: newColorHS(hue),
		brightness: newSlider(brightness),
		mode: mode,
		input: newString(input),
		_value: new Uint8Array([255, 255, 255, 255]),
		onchange: noop,

		_white_mode: false,
		get white_mode() { return o._white_mode },
		set white_mode(wm) {
			o._white_mode = wm
			const h = newColor.gradientHue, w = newColor.gradientWhite
			let b1 = h, b2 = h
			if (wm)
				b1 = w
			else
				b2 = w
			o.hue.elem.style.background = b1
			o.mode.style.background = b2
		},

		_temperature: 0, // only in white_mode
		get temperature() {
			if(!o._white_mode)
				return 0
			return o._temperature
		},
		set temperature(t) {
			o._temperature = t
			const v = o._value, hsv = o.hsv, b = hsv[2]
			temperature2rgb(t, v)
			rgbToHsv2(v, hsv)
			hsv[2] = b // keep brightness
			hsvToRgb2(hsv, v)
			o.update(hsv)
			if (o._white_mode)
				o.hue.xy.value = [0.5, t]
		},

		get hsv() { return o.hue._value },
		set hsv(_hsv) {
			const hsv = o.hsv
			if (hsv !== _hsv) {
				const [h, s, v] = _hsv
				hsv[0] = h, hsv[1] = s, hsv[2] = v
			}
			hsvToRgb2(hsv, o._value)
			o.update(hsv)
		},

		get value() { return o._value },
		set value(_v) { // rgb
			const v = o._value
			if (_v && v !== _v) {
				const [r, g, b, a] = _v
				v[0] = r, v[1] = g, v[2] = b, v[3] = a
			}
			o.update(v)
		},

		update(origin = null) {
			const v = o._value, hsv = o.hsv

			if (origin !== hsv) {
				rgbToHsv2(v, hsv)
				o.hue.value = hsv
				o.brightness.value = hsv[2]
			}
			if (origin !== o.input)
				o.input.value = v.join(", ")

			// common
			const hsV = hsv[2], aux = newColor.aux_rgb
			hsv[2] = 1
			hsvToRgb2(hsv, aux)
			hsv[2] = hsV
			brightness.style.background = "linear-gradient(to left, " + rgb2css(aux) + ", black)"
		},
	}

	mode.onclick = () => {
		const wm = o.white_mode
		o.white_mode = !wm
		if (wm)
			o.update(o._value)
		else
			o.temperature = 0.55
		o.onchange(o._value)
	}

	o.hue.onchange = v => {
		if (o.white_mode)
			o.temperature = v[1]
		else {
			const hsv = o.hsv
			hsv[0] = v[0]
			hsv[1] = v[1]
			o.hsv = hsv
		}
		o.onchange(o._value)
	}
	o.brightness.onchange = v => {
		o.hsv[2] = v
		o.hsv = o.hsv
		o.onchange(o._value)
	}
	o.input.onchange = (str = "") => {
		const arr = str.split(" ").join("").split(",")
		if (arr.length !== 4)
			return
		const v = o._value, [r, g, b, a] = arr
		v[0] = r | 0, v[1] = g | 0, v[2] = b | 0, v[3] = a | 0
		o.update(o.input)
		if (o.white_mode)
			o.white_mode = false
		o.onchange(o._value)
	}
	o.brightness.value = 1

	return o
}
newColor.aux_rgb = new Uint8Array(3)
newColor.gradientHue = gradient.combine([["to top", "toWhite"], ["to right", "hue"]])
newColor.gradientWhite = gradient.compile("to top", gradient.kelvin)

// derived from gist.github.com/mjackson/5311256
// rgb 0..255 -> hsv 0..1
function rgbToHsv2(rgb, hsv) {
	const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255

	let max = Math.max(r, g, b), min = Math.min(r, g, b)
	let h, s, v = max

	let d = max - min
	s = max == 0 ? 0 : d / max

	if (max == min) {
		h = 0 // achromatic
	} else {
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6
	}

	hsv[0] = h, hsv[1] = s, hsv[2] = v
}

// hsv 0..1 -> rgb 0..255
function hsvToRgb2(hsv, vec) {
	let h = hsv[0], s = hsv[1], v = hsv[2]
	let r, g, b

	let i = Math.floor(h * 6)
	let f = h * 6 - i
	let p = v * (1 - s)
	let q = v * (1 - f * s)
	let t = v * (1 - (1 - f) * s)

	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}

	vec[0] = r * 255, vec[1] = g * 255, vec[2] = b * 255
}

function rgb2css(v) {
	//return "rgb(" + v.join(",") + ")"
	return `rgb(${v[0]},${v[1]},${v[2]})`
}

function temperature2rgb(t = 0, rgb = null) {
	// approximation
	// kelvin2rgb((1 - t) * 11000 + 1400, rgb)

	// less accurate approximation
	t2rgb(t, rgb)
}

function t2rgb(t = 0, rgb = null) {
	t *= 2
	let a = t2rgb.gw, b = t2rgb.rw
	if (t > 1) {
		a = t2rgb.bw, b = t2rgb.gw
		t--
	}

	const _t = 1 - t
	rgb[0] = a[0] * t + b[0] * _t
	rgb[1] = a[1] * t + b[1] * _t
	rgb[2] = a[2] * t + b[2] * _t
}
t2rgb.rw = new Uint8Array([243, 242, 255])
t2rgb.gw = new Uint8Array([255, 184, 123])
t2rgb.bw = new Uint8Array([255, 127, 14])


function t2rgb(t = 0, rgb = null) {
	t *= 2
	let a = t2rgb.gw, b = t2rgb.rw
	if (t > 1) {
		a = t2rgb.bw, b = t2rgb.gw
		t--
	}

	const _t = 1 - t
	rgb[0] = a[0] * t + b[0] * _t
	rgb[1] = a[1] * t + b[1] * _t
	rgb[2] = a[2] * t + b[2] * _t
}
t2rgb.rw = new Uint8Array([243, 242, 255])
t2rgb.gw = new Uint8Array([255, 184, 123])
t2rgb.bw = new Uint8Array([255, 127, 14])


// www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/
function kelvin2rgb(k = 0, rgb = null) {
	let r = 0, g = 0, b = 0

	k = k / 100

	// red
	if (k <= 66) {
		r = 255
	} else {
		r = k - 60
		r = 329.698727446 * Math.pow(r, -0.1332047592)
		r = clamp(r, 0, 255)
	}

	// green
	if (k <= 66) {
		g = k
		g = 99.4708025861 * Math.log(g) - 161.1195681661
		g = clamp(g, 0, 255)
	} else {
		g = k - 60
		g = 288.1221695283 * Math.pow(g, -0.0755148492)
		g = clamp(g, 0, 255)
	}

	// blue
	if (k >= 66) {
		b = 255
	} else {
		if (k <= 19) {
			b = 0
		} else {
			b = k - 10
			b = 138.5177312231 * Math.log(b) - 305.0447927307
			b = clamp(b, 0, 255)
		}
	}

	rgb[0] = r, rgb[1] = g, rgb[2] = b
}
