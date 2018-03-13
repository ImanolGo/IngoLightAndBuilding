"use strict"

registerCustomElem("string", () => {
	const elem = newINPUT("text")
	setStyle(elem, {
		fontSize: "1em",
		padding: "0 0.3em 0 0.3em",
		color: "var(--textColorBold)",
		border: "none",
		background: "var(--inputBg)",
		cursor: "text",
	})
	return elem
})

function newString(_elem = null) {
	const elem = _elem || newCustomElem("string")

	const o = {
		elem,
		onchange: noop, onenter: noop,
		get value() {
			return o.elem.value
		},
		set value(v) {
			o.elem.value = v
		},
	}

	elem.oninput = e => {
		o.onchange(o.value)
	}
	elem.onkeydown = e => {
		if(e.key === "Enter")
			o.onenter(o.value)
	}

	return o
}
