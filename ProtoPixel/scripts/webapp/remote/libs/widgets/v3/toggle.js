"use strict"

newImports("widgets/cssvars.js")

customElements.define("ppx-toggle", class extends HTMLElement {
	constructor() {
		super()
		this._value = false
		this.onchange = noop

		const sh = this.attachShadow({ mode: "open" })
		const elem = append(sh, newDIV())
		setStyle(elem, {
			position: "relative",
			display: "inline-block",
			width: "2em",
			height: "1em",
			marginBottom: "-0.1em",
			cursor: "pointer",
		})

		this.onclick = e => {
			e.stopPropagation()
			this.value = !this._value
			this.onchange(this._value)
		}

		this.slider = append(elem, newDIV(), {
			position: "absolute",
			top: 0, left: 0, right: 0, bottom: 0,
			transition: ".4s",
			borderRadius: "0.6em",
			boxShadow: "0 0 1px 0 rgba(0, 0, 0, 0.5)",
			cursor: "pointer",
		})

		this.handle = append(this.slider, newDIV(), {
			position: "absolute",
			width: "50%",
			height: "100%",
			borderRadius: "0.6em",
			boxShadow: "0 0 1px 0 rgba(0, 0, 0, 0.5)",
			backgroundColor: "var(--textColorBold)",
			transition: ".4s",
			cursor: "pointer",
		})

		this.value = false
	}

	get value() {
		return this._value
	}
	set value(v) {
		this._value = v
		const hs = this.handle.style, ss = this.slider.style
		if (v) {
			hs.transform = "translateX(100%)"
			ss.backgroundColor = "var(--highlight)"
		}
		else {
			hs.transform = "none"
			ss.backgroundColor = "rgba(120,120,120,0.5)"
		}
	}

	// Monitor the 'name' attribute for changes.
	/*static get observedAttributes() { return ["toggle"] }

	// Respond to attribute changes.
	attributeChangedCallback(attr, oldValue, newValue) {
		if (attr == "toggle") {
			this.textContent = `Hello, ${newValue}`
		}
	}*/
})
