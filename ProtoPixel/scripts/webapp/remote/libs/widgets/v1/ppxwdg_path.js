/*************************************************************************
 * Protopixel Widgets v1 . Path 
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * Specifies a path to a file in a box.
 *
 *************************************************************************/
"use strict"

function pathDecorator() {

	let PATH = newDIV()
	PATH.style.display = "flex"
	PATH.style.flexDirection = "row"
	PATH.style.alignItems = "center"

	let ICON = newIMG()
	ICON.src = assets_path + "folder.svg"
	ICON.style.height = "2em"
	ICON.classList.add("pointer")
	PATH.appendChild(ICON)

	let TXT = newElem("div")
	TXT.style.flex = "1"
	TXT.style.padding = "0.25em"
	TXT.style.fontSize = "1em"
	TXT.style.letterSpacing = "0.1em"
	TXT.style.direction = "rtl"
	TXT.style.whiteSpace = "nowrap"
	TXT.style.overflow = "hidden"
	TXT.style.textOverflow = "ellipsis"
	PATH.appendChild(TXT)

	return obj => {
		obj.elem = PATH.cloneNode(true)
		widgetDecorator(obj)

		let icon = obj.elem.children[0], txt = obj.elem.children[1]

		obj.onchange = noop, obj.extensions = ""

		icon.onclick = () => {
			//return openFileDialog("Open Project", [{name: 'change file', extensions: [obj.extension]}])
			return inputFileDialog(obj.extensions).then(filepath => {
				txt.innerText = filepath
				obj.onchange(filepath)
			}).catch(noop)
		}

		obj.getset("value", () => {
			return txt.innerText
		}, v => {
			if (!v || v === txt.innerText)
				return
			txt.innerText = v
			txt.title = v
		})

		return obj
	}
}
widgets.path = pathDecorator()
