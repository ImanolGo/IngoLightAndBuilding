/*************************************************************************
 * Protopixel Widgets v1 . Icon
 * 21/11/2016
 *************************************************************************
 *
 * @description
 * Icon.
 *
 *************************************************************************/
"use strict"

function iconButtonDecorator() {
	let ICON = newIMG()
	//ICON.src = assets_path + "folder.svg"
	ICON.classList.add("pointer")

	return (src = "") => {
		let i = ICON.cloneNode(true)
		i.src = src
		let obj = { elem: i }
		widgetDecorator(obj)

		obj.onchange = noop
		i.onclick = () => {
			obj.onchange()
		}
		return obj
	}
}
widgets.iconButton = iconButtonDecorator()