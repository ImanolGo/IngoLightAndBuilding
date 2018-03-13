/*************************************************************************
 * Protopixel Widgets v1 . Section
 * 27/10/2016
 *************************************************************************
 *
 * @description
 * Elements conforming a section in the panel
 *
 *************************************************************************/
"use strict"

function sectionDecorator () {

	let SECTION = document.createElement("div")
	SECTION.style.display = "flex"
	SECTION.style.flexDirection = "column"

	let TITLE = newDIV()
	TITLE.style.height = "27px"
	TITLE.style.margin = "0.5em 0.5em 0.5em 0.8em"
	TITLE.style.fontSize = "0.8em"
	TITLE.style.fontWeight = "bolder"
	TITLE.style.fontStyle = "normal"
	TITLE.style.fontStretch = "normal"
	TITLE.style.color = "var(--textColorBold)"

	let CONTENT = newDIV()
	CONTENT.style.border = "2px solid black"
	CONTENT.style.background = "#232323"
	CONTENT.style.flex = "1"
	CONTENT.style.overflowY = "auto"

	SECTION.appendChild(TITLE)
	SECTION.appendChild(CONTENT)

	return (obj) => {
		obj.elem = SECTION.cloneNode(true)
		widgetDecorator(obj)

		obj.title = widgets.flex({}, obj.elem.children[0])
		obj.title.align = "center"
		obj.content = obj.elem.children[1]

		return obj
	}
}
widgets.section = sectionDecorator()

function sectionListDecorator () {
	let CHILD = newDIV()
	CHILD.style.whiteSpace = "nowrap"
	CHILD.style.padding = "0.5em"
	CHILD.style.fontSize = "0.9em"
	CHILD.classList.add("pointer")

	return (obj, elem) => {
		widgets.list(obj, elem)

		// overriding
		obj.push_txt = function (txt) {
			let container = CHILD.cloneNode(true)
			container.innerText = txt
			return obj.push(container)
		}

		obj.marked = []
		obj.mark = (elem, color) => {
			if(color === "none")
				console.error("none is not a color")
			elem.style.background = color
			obj.marked.push(elem)
		}
		obj.unmark = (elem) => {
			elem.style.background = "none"
			remove_val(obj.marked, elem)
		}
		obj.unmarkAll = () => {
			for(let e of obj.marked)
				e.style.background = "none"
			obj.marked.length = 0
		}

		return obj
	}
}
widgets.sectionList = sectionListDecorator()
