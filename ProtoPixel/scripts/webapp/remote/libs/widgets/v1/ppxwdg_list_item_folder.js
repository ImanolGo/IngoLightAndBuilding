/*************************************************************************
 * Protopixel Widgets v1 . Folder List item
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * Folder list item.
 *
 *************************************************************************/
"use strict"

function folderListDecorator() {

	let FOLDER = document.createElement("div")

	let HEADER = document.createElement("div")
	HEADER.classList.add("pointer")
	HEADER.style.padding = "0.3em"

	let CONTENT = document.createElement("div")
	CONTENT.style.paddingLeft = "4em"

	FOLDER.appendChild(HEADER)
	FOLDER.appendChild(CONTENT)

	return obj => {
		obj.elem = FOLDER.cloneNode(true)
		widgetDecorator(obj)

		// the header is a list item too
		obj.header = widgets.listItem({ name: obj.name }, obj.elem.children[0])
		let name = obj.header.item_name
		name.style.color = gui.colors.folder
		name.style.fontWeight = "bold"

		obj.get("content", () => {
			return obj.elem.children[1]
		})

		const srcOpen = "scene-arrow-open.svg", srcClosed = "scene-arrow-closed.svg"

		let icon = obj.header.addIconLeft("Close folder", srcOpen)
		icon.onclick = () => {
			obj.open = !obj.open
		}

		obj.getset("open", () => {
			return icon.title === "Close folder"
		}, v => {
			if (v) {
				icon.title = "Close folder"
				icon.src = assets_path + "scene-arrow-open.svg"
				showElem(obj.content)
			} else {
				icon.title = "Open folder"
				icon.src = assets_path + "scene-arrow-closed.svg"
				hideElem(obj.content)
			}
		})

		widgets.sectionList(obj, obj.content)
		return obj
	}
}
widgets.folderList = folderListDecorator()
