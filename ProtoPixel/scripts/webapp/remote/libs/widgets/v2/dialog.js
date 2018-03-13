"use strict"

function showDialog(elem = null) {
	appendFirst(document.body, elem)
}

function hideDialog(elem = null) {
	removeElem(document.body, elem)
}

class ppxmodal extends HTMLElement {
	constructor() {
		super()

		const sh = this.attachShadow({ mode: "open" })
		const elem = append(sh, newDIV())
		setStyle(elem, {
			// fullscreen
			position: "absolute",
			height: "100%",
			width: "100%",
			top: 0, left: 0,

			background: "rgba(0,0,0, 0.3)",
			zIndex: 1, // todo: fix toggle.js z
		})
		this.background = elem

		this.dialog = append(elem, newDIV(), {
			position: "absolute",
			top: "50%", left: "50%",
			transform: "translate(-50%, -50%)",
		})
	}
}
customElements.define("ppx-modal", ppxmodal)

class ppxalert extends ppxmodal {
	constructor() {
		super()

		const dialog = this.dialog
		setStyle(dialog, {
			padding: "0.5em",
			background: "rgb(200,200,200)",
			borderRadius: "0.3em",
		})

		this.background.tabIndex = 0 // to get keyboard events

		const content = append(dialog, newDIV("content"), {
			marginBottom: "1em",
		})
		this.content = content
		const actions = append(dialog, newDIV(), {
			display: "flex",
		})
		append(actions, newFlexible())
		this.ok = append(actions, newCustomElem("button", "ok"))

		this.ok.onclick = () => {
			this.hide(true)
		}

		this.onkeydown = e => {
			if (e.key === "Enter")
				this.hide(true)
			else if (e.key === "Escape")
				this.hide(false)
		}
	}

	show(txt = "") {
		this.content.textContent = txt
		showDialog(this)
		this.background.focus() // to get keyboard events

		return new Promise(ok => {
			this.pending = ok
		})
	}
	hide(v) {
		this.pending(v)
		hideDialog(this)
	}
}
customElements.define("ppx-alert", ppxalert)

customElements.define("ppx-confirm", class extends ppxalert {
	constructor() {
		super()
		this.cancel = appendBefore(this.ok, newCustomElem("button", "cancel"), {
			marginRight: "0.5em",
		})
		this.cancel.onclick = () => {
			this.hide(false)
		}
	}
})

function newAlert(txt = "", ok = "") {
	const elem = newElem("ppx-alert")
	if (ok)
		elem.ok.textContent = ok
	return elem.show(txt)
}

function newConfirm(txt = "", ok = "", cancel = "") {
	const elem = newElem("ppx-confirm")
	if (ok)
		elem.ok.textContent = ok
	if (cancel)
		elem.cancel.textContent = cancel
	return elem.show(txt)
}

function newLoading(txt = "") {
	const elem = newElem("ppx-modal")
	elem.dialog.textContent = txt
	showDialog(elem)
	return elem
}
