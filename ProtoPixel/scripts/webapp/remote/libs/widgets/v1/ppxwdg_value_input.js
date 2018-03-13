/*************************************************************************
 * Protopixel Widgets v1 . Input Value
 * 21/11/2016
 *************************************************************************
 *
 * @description
 * Generic input values on inspection panels.
 *
 *************************************************************************/
"use strict"

function inputDecorator() {

	let INPUT = newElem("input")

	INPUT.style.height = "2.0em"
	INPUT.style.border = "solid 1px #202020"
	INPUT.style.borderRadius = "4px"
	INPUT.style.backgroundColor = widgets.CSSvars.inputBg

	INPUT.style.fontSize = "1em"
	INPUT.style.color = "var(--textColor)"

	return function (obj, elem) {
		if (!elem)
			elem = INPUT.cloneNode(true)

		obj.elem = elem
		widgetDecorator(obj)
		obj.onchange = noop

		elem.oninput = () => {
			obj.onchange(obj.value)
		}
		if (typeof actions !== 'undefined') { // check if actions exist
			elem.onfocus = () => {
				actions.ignore = true
			}
			elem.onblur = () => {
				actions.ignore = false
			}
		}

		return obj
	}
}
widgets.input = inputDecorator()
