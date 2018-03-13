/*************************************************************************
 * Protopixel Widgets v1 . Toggle
 * 17/10/2016
 *************************************************************************
 *
 * @description
 * Simple Toggle.
 *
 *************************************************************************/
"use strict"

function toggleIconDecorator() {

	let ICON = newElem("div")
	ICON.style.display = "inline-block"
	ICON.style.width = "1.8em"
	ICON.style.height = "1.8em"
	ICON.style.marginRight = "0.3em"
	ICON.style.backgroundColor = "var(--textColor)"
	ICON.classList.add("pointer", "white_hover")

	return (obj, filenameOn, filenameOff) => {

		let elem = ICON.cloneNode(true)
		obj.elem = elem
		widgetDecorator(obj)
		let value = false

		elem.onclick = e => {
			e.preventDefault() // prevent checkboxes from firing onclick
			obj.value = !value
			obj.onchange(value)
		}
		obj.onchange = noop

		obj.updateIcon = () => {
			if (value)
				obj.style.webkitMask = "url('" + assets_path + filenameOn + ".svg') no-repeat center center"
			else
				obj.style.webkitMask = "url('" + assets_path + filenameOff + ".svg') no-repeat center center"
		}

		obj.getset("value", () => {
			return value
		}, v => {
			value = !!v
			obj.updateIcon()
		})
		obj.updateIcon()

		return obj
	}

}
widgets.toggle_icon = toggleIconDecorator()

function toggleIcon2Decorator() {
	return (src1, src2) => {
		let obj = widgets.iconButton(src1)
		obj.value = true

		obj.elem.onclick = () => {
			obj.value = !obj.value

			if (obj.value)
				obj.elem.src = src1
			else
				obj.elem.src = src2

			obj.onchange(obj.value)
		}

		return obj
	}

}
widgets.toggleIcon2 = toggleIcon2Decorator()

function toggleDecorator(use_small_version = false) {

	let SWITCH = newElem("label")
	setStyle(SWITCH.style, {
		position: "relative",
		display: "inline-block",
	})

	let INPUT = newElem("input")
	INPUT.type = "checkbox"
	INPUT.style.display = "none"

	let SLIDER = newElem("div")
	SLIDER.classList.add("switch")

	if (!use_small_version) {
		SLIDER.classList.add("switchA")
		SWITCH.style.width = "30px"
		SWITCH.style.height = "18px"
	} else {
		SLIDER.classList.add("switchB")
		SWITCH.style.width = "20px"
		SWITCH.style.height = "12px"
		SWITCH.style.marginTop = "3px"
	}

	newCSSRule("input:checked + .switch", "background:var(--highlight)")

	setStyle(SLIDER.style, {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		transition: ".4s",
		boxShadow: "0 0 1px 0 rgba(0, 0, 0, 0.5)",
		borderRadius: "76.6px",
		cursor: "pointer",
	})

	newCSS(`
		.switch:before {
			position: absolute;
			content: "";
			transition: .4s;
			box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.5);
			border-radius: 76.6px;
		}`)

	// switch A
	newCSS(`
		.switchA {
			background-color: #000000;
		}`)
	newCSS(`
		.switchA:before {
			width: 18px;
			height: 18px;
			left: 0px;
			bottom: 0px;
			background-color: var(--textColorBold);
		}`)
	newCSS(`
		input:checked + .switchA:before {
			transform: translateX(14px);
		}`)

	// switch B, smaller than switch A
	newCSS(`
		.switchB {
			background-color: var(--textColorBold);
		}`)
	newCSS(`
		.switchB:before {
			width:8px;
			height:8px;
			left:2px;
			bottom:2px;
			background-color: #000000;
		}`)
	newCSS(`
		input:checked + .switchB:before {
			transform: translateX(8px);
		}`)

	SWITCH.appendChild(INPUT)
	SWITCH.appendChild(SLIDER)

	return obj => {
		let elem = SWITCH.cloneNode(true)
		obj.elem = elem
		widgetDecorator(obj)

		let input = elem.children[0]
		obj.onchange = noop

		obj.getset("value", () => {
			return input.checked
		}, v => {
			input.checked = v
		})
		obj.value = true

		elem.onclick = e => {
			e.preventDefault() // prevent checkboxes from firing onclick
			obj.value = !obj.value
			obj.onchange(obj.value)
		}

		return obj
	}

}
widgets.toggle = toggleDecorator()
widgets.toggle_mini = toggleDecorator(true)
