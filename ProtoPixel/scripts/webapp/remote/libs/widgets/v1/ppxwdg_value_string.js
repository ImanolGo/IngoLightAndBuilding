/*************************************************************************
 * Protopixel Widgets v1 . String Value
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * String values on inspection panels.
 *
 *************************************************************************/
"use strict"

function stringDecorator() {

	let STRING = newDIV()

	return obj => {

		obj.elem = STRING.cloneNode(true)
		widgetDecorator(obj)

		obj.getset("value", () => {
			return obj.elem.innerText
		}, v => {
			obj.elem.innerText = v
		})

		return obj
	}

}
widgets.string = stringDecorator()

function stringInputDecorator() {
	return (obj, elem) => {
		widgets.input(obj, elem)
		elem = obj.elem
		elem.type = "text"
		elem.style.paddingLeft = "0.5em"
		elem.style.paddingRight = "1em"

		obj.valid = yes
		obj.immediate_mode = false

		obj._value = ""
		obj.getset("value", () => {
			return elem.value
		}, v => {
			elem.value = v
			obj._value = v
		})

		objset(obj, "pattern", v => {
			elem.pattern = v
		})

		elem.oninput = () => {
			if (!obj.immediate_mode)
				return
			obj._value = obj.value
			obj.onchange(obj.value)
		}
		elem.onkeydown = () => {
			if (event.key === "Enter")
				change()
			else if (event.key === "Escape")
				abort_change()
		}

		elem.onblur = () => {
			change()
			actions.ignore = false
		}

		function change() {
			if (obj.value === obj._value)
				return
			if (bad_str(obj.value))
				return abort_change()

			if (!elem.validity.valid || !obj.valid(obj.value)) {
				elem.classList.add("error")
				return
			}
			elem.classList.remove("error")

			obj._value = obj.value
			obj.onchange(obj.value)
		}
		function abort_change() {
			elem.value = obj._value
		}

		return obj
	}

}
widgets.stringInput = stringInputDecorator()
