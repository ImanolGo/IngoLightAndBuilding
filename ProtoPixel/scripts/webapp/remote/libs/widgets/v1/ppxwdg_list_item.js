/*************************************************************************
 * Protopixel Widgets v1 . List item
 * 28/10/2016
 *************************************************************************
 *
 * @description
 * List item.
 *
 *************************************************************************/
"use strict"

function listItemDecorator() {

	let ICON = newElem("div")

	ICON.style.display = "inline-block"
	ICON.style.width = "3em"
	ICON.style.height = "1.5em"

	return (obj, elem) => {

		widgets.flex(obj, elem)
		obj.elem.style.padding = "0.5em"
		obj.elem.style.alignItems = "center"

		let name = obj.push_txt(obj.name || "")
		name.flex = 1
		setStyle(name.elem.style, {
			overflow: "hidden",
			textOverflow: "ellipsis",
		})

		obj.get("item_name", () => {
			return name.elem
		})

		obj.addElemLeft = (hover, elem) => {
			obj.insert(elem, obj.item_name)
			elem.title = hover
			elem.style.marginRight = "1em"
			return elem
		}
		obj.addElemRight = (hover, elem) => {
			obj.push(elem)
			elem.title = hover
			return elem
		}

		obj.addIconLeft = (hover, filename) => {
			return obj.addElemLeft(hover, newIMG(assets_path + filename))
		}
		obj.addIconRight = (hover, filename) => {
			return obj.addElemRight(hover, newIMG(assets_path + filename))
		}
		return obj
	}
}
widgets.listItem = listItemDecorator()
