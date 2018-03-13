/*************************************************************************
 * Protopixel Widgets v1 . Button
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * Simple buton.
 *
 *************************************************************************/
"use strict"

function buttonDecorator() {

	let BUTTON = newElem("div")
	BUTTON.style.padding = "0.4em"
	BUTTON.style.textAlign = "center"

	BUTTON.style.borderRadius = "4px"
	BUTTON.style.background = "linear-gradient(to bottom, var(--highlight), var(--highlight2))"
	BUTTON.style.cursor = "pointer"

	BUTTON.style.fontSize = "1em"
	BUTTON.style.color = "var(--textColorBold)"
	BUTTON.style.letterSpacing = "0.1em"

	return obj => {
		let elem = BUTTON.cloneNode(true)
		obj.elem = elem
		widgetDecorator(obj)

		obj.getset("value", () => {
			return elem.innerText
		}, v => {
			elem.innerText = v
		})

		obj.onchange = noop
		elem.onclick = () => {
			obj.onchange(obj.value)
		}

		return obj
	}

}
widgets.button = buttonDecorator()
