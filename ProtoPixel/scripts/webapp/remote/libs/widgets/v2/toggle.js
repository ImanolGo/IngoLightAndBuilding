"use strict"

newImports("widgets/cssvars.js")

registerCustomElem("toggle", () => {
	const elem = newElem("label")
	setStyle(elem, {
		position: "relative",
		display: "inline-block",
		width: "2em",
		height: "1em",
		cursor: "pointer",
	})

	const checkbox = append(elem, newINPUT("checkbox"))
	checkbox.checked = true
	hideElem(checkbox)

	const slider = append(elem, newDIV(), {
		position: "absolute",
		top: 0, left: 0, right: 0, bottom: 0,
		transition: ".4s",
		boxShadow: "0 0 1px 0 rgba(0, 0, 0, 0.5)",
		borderRadius: "0.6em",
		cursor: "pointer",
	})

	slider.classList.add("switch")
	slider.classList.add("switchA")

	newCSSRule("input:checked + .switch", "background:var(--highlight)")
	newCSS(`.switch:before {
		position: absolute;
		content: "";
		transition: .4s;
		box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.5);
		border-radius: 0.6em;
	}`)

	// switch A
	newCSS(`.switchA {
		background-color: rgba(120,120,120,0.5);
	}`)
	newCSS(`.switchA:before {
		width: 50%;
		height: 100%;
		left: 0px;
		bottom: 0px;
		background-color: var(--textColorBold);
	}`)
	newCSS(`input:checked + .switchA:before {
		transform: translateX(100%);
	}`)

	return { elem, checkbox }
})

function newToggle(_elem = null) {
	const elem = _elem || newCustomElem("toggle")
	const cb = useAPIElem("checkbox", elem)

	elem.onclick = e => {
		e.stopPropagation()
		e.preventDefault()
		cb.checked = !cb.checked
		o.onchange(cb.checked)
	}

	const o = {
		elem: elem,
		onchange: noop,
		get value() {
			return cb.checked
		},
		set value(v) {
			cb.checked = v
		}
	}

	return o
}
