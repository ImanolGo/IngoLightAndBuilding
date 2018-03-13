"use strict"

newImports("widgets/cssvars.js")

registerCustomElem("button", () => {
	const elem = newDIV()
	setStyle(elem, {
		padding: "0.4em",
		textAlign: "center",
		borderRadius: "4px",
		background: "linear-gradient(to bottom, var(--highlight), var(--highlight2))",
		color: "var(--textColorBold)",
		letterSpacing: "0.1em",
		cursor: "pointer",
	})
	return elem
})

function newButton(name = "", _elem = null) {
	const elem = _elem || newCustomElem("button")
	elem.textContent = name

	const o = {
		elem,
		onchange: noop,
		value: null,
	}

	elem.onclick = e => {
		o.onchange()
	}

	return o
}
