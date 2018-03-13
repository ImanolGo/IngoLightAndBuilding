"use strict"

newImport("utils.js")

registerCustomElem("input2D", () => {
	const elem = newDIV()
	setStyle(elem, {
		position: "relative",
		cursor: "crosshair",
	})

	const pointer = append(elem, newDIV(), {
		position: "absolute",
		width: "0.5em", height: "0.5em",
		border: "1px solid black",
		top: 0, left: 0,
		transform: "translate(-50%, -50%)",
		pointerEvents: "none",
	})

	return { elem, pointer }
})

function newInput2D(_elem = null, cb = {}) {
	const elem = _elem || newCustomElem("input2D")
	const { pointer } = useAPIs(elem)

	const o = {
		elem, pointer,
		onchange: noop,
		_value: new Float32Array([0, 0]),
		absValue: new Float32Array([0, 0]),
		get value() { return o._value },
		set value(_v) {
			const v = o._value, [x, y] = _v
			v[0] = clamp(x, 0, 1)
			v[1] = clamp(y, 0, 1)

			if (!o.pointer)
				return
			const pos = o.pointer.style
			pos.left = `${v[0] * 100}%`
			pos.top = `${v[1] * 100}%`
		},
	}
	function calc(x, y, _x, _y) {
		const a = o.absValue
		a[0] = x, a[1] = y
		o.value = [_x, _y]
		o.onchange(o._value)
	}
	cb.start = elem
	cb.any = calc
	trackPointerCycle(cb)

	return o
}
