/*************************************************************************
 * Protopixel Widgets v1 . Color selector
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * Color selectoron floating panel.
 *
 *************************************************************************/
"use strict"

// derived from gist.github.com/mjackson/5311256
function rgbToHsv(r, g, b, vec) {
	r /= 255, g /= 255, b /= 255

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

	vec[0] = h, vec[1] = s, vec[2] = v
}
// hsl [0, 1], rgb [0, 255]
function hsvToRgb(h, s, v, vec) {
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
	return "rgb(" + v.join(",") + ")"
}
function rgba2css(v) {
	return "rgba(" + v.join(",") + ")"
}

// return a value from v between a and b
function range(v, a, b) {
	if (v < a)
		return a
	if (v > b)
		return b
	return v
}

function color2Decorator() {
	let COLOR = newElem("div")
	COLOR.style.display = "flex"
	COLOR.style.flexDirection = "column"
	COLOR.style.width = "100%"

	let PICKER = newElem("div")
	PICKER.style.background = `linear-gradient(to bottom, white, rgba(255, 255, 255, 0)),
		linear-gradient(to right, red, yellow, lime, cyan, blue, fuchsia, red)`
	PICKER.style.borderRadius = "4px"
	PICKER.style.flex = "3"
	PICKER.style.width = "100%"
	PICKER.style.cursor = "crosshair"
	COLOR.appendChild(PICKER)

	let G1 = newElem("div")
	G1.style.display = "flex"
	G1.style.flexDirection = "row"
	G1.style.flex = "1"

	let BRIGHTNESS = newElem("div")
	BRIGHTNESS.style.background = "linear-gradient(to right, red, black)"
	BRIGHTNESS.style.borderRadius = "4px"
	BRIGHTNESS.style.width = "75%"
	BRIGHTNESS.style.cursor = "crosshair"
	G1.appendChild(BRIGHTNESS)

	let RESULT = newElem("div")
	RESULT.style.background = "red"
	RESULT.style.borderRadius = "4px"
	RESULT.style.width = "25%"
	G1.appendChild(RESULT)

	COLOR.appendChild(G1)

	let G2 = newElem("div")
	G2.style.display = "flex"
	G2.style.flexDirection = "row"
	G2.style.flex = "1"
	COLOR.appendChild(G2)

	return obj => {
		let elem = COLOR.cloneNode(true)
		obj.elem = elem

		let g1 = elem.children[1], g2 = elem.children[2]
		let picker = elem.children[0], brightness = g1.children[0], result = g1.children[1]

		let color = new Uint8Array(4), c3 = new Uint8Array(3), v3 = vec3.create()
		color[3] = 255
		let hue = 0.0, saturation = 0.0, value = 1.0 // white

		let rgba = [] // direct rgba inputs
		for (let i = 0; i < 4; i++) {
			let r = widgets.number({})
			rgba.push(r)
			r.min = 0, r.max = 255, r.step = 1
			r.elem.classList.remove("ppx_input_number")
			r.elem.classList.add("no_builtin_number")
			r.style.width = "25%"
			r.style.height = ""
			r.style.textAlign = "center"
			r.onchange = v => {
				color[i] = v | 0
				obj.value = color
				obj.onchange(color)
			}
			g2.appendChild(r.elem)
		}
		rgba[3].style.color = "black"
		rgba[3].style.textShadow = "0 0 1px white"

		obj.onchange = noop

		objgetset(obj, "value", () => {
			return color.slice()
		}, v => {
			if (!v)
				return
			vec4.copy(color, v)
			fillHSV()
			propagate()
		})

		function fillHSV() {
			rgbToHsv(color[0], color[1], color[2], v3)
			hue = v3[0], saturation = v3[1], value = v3[2]
		}

		function propagate() {
			vec4.copy(c3, color)
			result.style.background = rgb2css(c3)
			hsvToRgb(hue, saturation, 1, c3)
			brightness.style.background = "linear-gradient(to right, " + rgb2css(c3) + ", black)"
			for (let i = 0; i < 4; i++)
				rgba[i].value = color[i]
			rgba[0].style.background = rgb2css([color[0], 0, 0])
			rgba[1].style.background = rgb2css([0, color[1], 0])
			rgba[2].style.background = rgb2css([0, 0, color[2]])
			rgba[3].style.background = rgb2css([color[3], color[3], color[3]])
		}
		function changeColor(x, y, _x, _y) {
			hue = range(_x, 0, 1)
			saturation = range(_y, 0, 1)
			hsvToRgb(hue, saturation, value, color)
			propagate()
			obj.onchange(color)
		}
		function changeBrightness(x, y, _x, _y) {
			value = 1 - range(_x, 0, 1)
			hsvToRgb(hue, saturation, value, color)
			propagate()
			obj.onchange(color)
		}

		setMouseCycle(picker, changeColor, changeColor)
		setMouseCycle(brightness, changeBrightness, changeBrightness)

		propagate()
		return obj
	}
}
widgets.color = color2Decorator()
