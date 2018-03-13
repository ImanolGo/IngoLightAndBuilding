"use strict"

newImport(
	"widgets/v2/input2D.js"
).then(initCustomElem("slider"))

defineCustomElem("slider", () => {
	const elem = newCustomElem("input2D")
	setStyle(elem, {
		cursor: "pointer",
	})

	const { pointer } = getAPIs(elem)
	setStyle(pointer, {
		height: "100%", width: "2px",
		border: "none",
		background: "white",
		transform: "translate(-50%)",
		//boxShadow: "0 2px 4px 0 black",
	})
	return elem
})

function newSlider(_elem = null) {
	const xy = newInput2D(_elem || newCustomElem("slider"))

	const o = {
		elem: xy.elem, pointer: xy.pointer, xy,
		onchange: noop,
		get value() { return o.xy._value[0] },
		set value(_v) {
			const v = o.xy._value
			v[0] = _v, v[1] = 0
			o.xy.value = v
		},
	}

	xy.onchange = v => {
		o.pointer.style.top = 0
		// o.value = v[1] // vertical slider
		o.onchange(v[0])
	}

	return o
}

customElements.define("ppx-range", class extends HTMLElement {
	constructor() {
		super()
		this.onchange = noop

		const sh = this.attachShadow({ mode: "open" })
		const elem = append(sh, newINPUT("range"))
		this.elem = elem
		elem.max = 1, elem.step = 0.01

		elem.oninput = () => {
			this.onchange(this.value)
		}
		elem.onclick = e => {
			e.stopPropagation()
		}
	}

	get value() { return parseFloat(this.elem.value) }
	set value(v) { this.elem.value = v }
})
