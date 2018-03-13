/*************************************************************************
 * Protopixel Widgets v1 . Menu Bar
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * Creates text and icon based horizontal bars.
 *
 *************************************************************************/
"use strict"


function FAToggleIconDecorator () {

	let ICON = newElem("div")
	ICON.style.display = "inline-block"
	ICON.style.width = "1.8em"
	ICON.style.height = "1.8em"
	ICON.style.marginRight = "0.3em"
			
	ICON.classList.add("pointer")

	return (obj, filenameOn, filenameOff, toggleStatus = false, lastItem = false) => {

		let onIcon = filenameOn;
		let offIcon = filenameOff;
		let iconStatus = toggleStatus;

		obj.elem = ICON.cloneNode(true)
		widgetDecorator(obj)
	
		if(lastItem === true)
			obj.style.marginLeft = "auto"

		obj.elem.onclick = () => {
			obj.toggleStatus()
			obj.onclick()
		}
		obj.onclick = noop
		obj.updateIcon = () => {
			if(iconStatus)
				obj.style.background = "url('" + assets_path + filenameOn+".svg') no-repeat center center"
			else
				obj.style.background = "url('" + assets_path + filenameOff+".svg') no-repeat center center"
		}
		obj.setStatus = (newStatus) => {
			iconStatus = newStatus
			obj.updateIcon();
		}
		obj.setStatus(toggleStatus)
		obj.toggleStatus = () => {
			iconStatus = !iconStatus
			obj.updateIcon();
		}	
		return obj
	}
}
widgets.FAToggleIcon = FAToggleIconDecorator() 	

function FAIconDecorator () {

	let ICON = newElem("div")
	ICON.style.display = "inline-block"
	ICON.style.width = "1.8em"
	ICON.style.height = "1.8em"
	ICON.style.marginRight = "0.3em"
			
	ICON.style.backgroundColor = gui.colors.iconOff

	ICON.classList.add("pointer", "white_hover")

	return (obj, filename, lastItem = false) => {
		obj.elem = ICON.cloneNode(true)
		widgetDecorator(obj)
		obj.style.webkitMask = "url('" + assets_path + filename+".svg') no-repeat center center"
		//console.log(lastItem)
		if(lastItem === true)
			obj.style.marginLeft = "auto"

		obj.rotate = (r) => {
			obj.style.display = "inline-block"
			obj.style.transform = "rotate("+r+"deg)"
		}
		obj.elem.onclick = () => {
			obj.onclick()
		}
		obj.onclick = noop
		return obj
	}
}
widgets.FAIcon = FAIconDecorator()

function DDIconDecorator () {

	let LINE = newElem("div")
	LINE.style.height = "2.25em"
	LINE.style.marginTop = "0.75em"
	LINE.style.paddingLeft = "0.5em"
	LINE.style.backgroundColor = "none"
	LINE.classList.add("pointer", "white_hover_text", "blue_hover_background")

	let TEXT = newElem("div")
	TEXT.style.display = "inline-block"
	TEXT.style.marginTop = "0.3em"
	TEXT.style.marginLeft = "0.6em"

	TEXT.style["font-family"] = gui.text.font
	TEXT.style["font-size"] = gui.text.baseSize

	let ICON = newElem("div")
	
	ICON.style.display = "inline-block"
	ICON.style.float = "left"
	ICON.style.width = "2.25em"
	ICON.style.height = "2.25em"

	ICON.style.backgroundColor = gui.colors.iconOff

	/*  TODO: Apply icon border styling. Problem with mask.
	ICON.style.borderradius = "2px"
  	ICON.style.boxsShadow = "0 0 0 0 rgba(0, 0, 0, 0.5)"
  	ICON.style.border = "solid 0.5px #9c9c9c"	

	*/

	LINE.appendChild(ICON)
	LINE.appendChild(TEXT)

	return (obj, txt, filename) => {
		obj.elem = LINE.cloneNode(true)
		widgetDecorator(obj)
		obj.elem.children[0].style.webkitMask = "url('" + assets_path + filename+".svg') no-repeat left center"
		obj.elem.children[0].title = txt
		obj.elem.children[1].innerText = txt
		obj.elem.onclick = () => {
			obj.onclick()
		}
		obj.onclick = noop
		return obj
	}
}
widgets.DDIcon = DDIconDecorator()

function iconDropDownDecorator() {

	let LIST = newElem("div")
	LIST.style.display = "inline-block"
	LIST.style.width = "10em"
	LIST.style.height = "2.25em"
	LIST.style.marginRight = "0.3em"
  	LIST.style.border = "solid 1px #000000"
  	LIST.style.borderRadius = "4px"
  	//LIST.style.verticalAlign = "middle"
  	LIST.style.marginTop = "0.1em"

  	LIST.style["font-family"] = gui.text.font
	LIST.style["font-size"] = gui.text.baseSize

  	let DROPDOWN = newElem("div")
  	DROPDOWN.style.position = "absolute"
  	DROPDOWN.style.marginTop = "2.5em"
  	DROPDOWN.style.paddingBottom = "1em"
  	DROPDOWN.style.width = "15em"
	DROPDOWN.style.backgroundColor = "var(--background)"
	DROPDOWN.style.boxShadow = "1px 2px 4px 0 #000000"
	DROPDOWN.style.border = "solid 0.5px #383838"
	DROPDOWN.style.zIndex = 2 
	DROPDOWN.style.borderRadius = "4px"
	DROPDOWN.style.display = "none" 

	let HITAREA = newElem("div")
	HITAREA.style.position = "absolute"
	HITAREA.style.width = "10em"
	HITAREA.style.height = "3em"
	HITAREA.style.zIndex = 2 
	HITAREA.classList.add("pointer", "white_hover")

	let TRIANGLE = newElem("div")
	TRIANGLE.style.postion = "relative"
	TRIANGLE.style.width = "0px"
	TRIANGLE.style.height = "0px"
	TRIANGLE.style.borderBottom = "6px solid " + gui.colors.folder
	TRIANGLE.style.borderLeft = "6px solid transparent"
	TRIANGLE.style.marginLeft = "90%"
	TRIANGLE.style.marginTop = "1.1em"

	LIST.appendChild(DROPDOWN)
	LIST.appendChild(HITAREA)
	LIST.appendChild(TRIANGLE)

	return (obj, elem) => {
		if(!elem) {
			elem = LIST.cloneNode(true)
			obj.elem = elem
		}
		widgetDecorator(obj)

		if(obj.items)
			return

		obj.get("items", () => {
			return elem.children
		})
		obj.get("length", () => {
			return elem.children.length
		})

		obj.push = (_elem) => {
			elem.appendChild(_elem)
			return _elem
		}
		obj.push_txt = (txt) => {
			let div = document.createElement("div")
			div.style.display = "inline-block"
			div.innerText = txt
			div.style.marginTop = "0.3em"
			div.style.marginLeft = "0.3em"
			return elem.children[1].appendChild(div)
		}
		obj.push_icon = (icon) => {
			let div = document.createElement("div")
			div.style.float = "left"
			div.style.display = "inline-block"
			div.style.width = "2.25em"
			div.style.height = "2.25em"
			div.style.marginRight = "0.3em"
			div.style.marginLeft = "0.3em"
			div.style.backgroundColor = gui.colors.iconOff
			div.style.webkitMask = "url('" + assets_path + icon + ".svg') no-repeat center center"
			return elem.children[1].appendChild(div)
		}
		obj.push_listitem = (txt,icon) => {
			let element = widgets.DDIcon ({}, txt, icon);
			elem.children[0].appendChild(element.elem)
			return element
		}
		obj.clear = () => {
			elem.innerHTML = ""
		}
		obj.remove = (i) => {
			return elem.removeChild(elem.children[i])
		}
		obj.removeElem = (e) => {
			return elem.removeChild(e)
		}
		obj.insert = (e, before_elem) => {
			elem.insertBefore(e, before_elem)
		}
		obj.indexOf = (e) => {
			return [].indexOf.call(elem.children, e)
		}
		obj.elem.onclick = (e) => {
			var state = elem.children[0].style.display
			if(state === "block") {
				elem.children[0].style.display = "none"
			} else {
				elem.children[0].style.display = "block"
			}
			e.preventDefault()
		}
		obj.elem.onmouseenter = () => {
			elem.children[2].style.borderBottom = "6px solid " + gui.colors.highlight
		}
		obj.elem.onmouseleave = () => {
			elem.children[0].style.display = "none"
			elem.children[2].style.borderBottom = "6px solid " + gui.colors.folder
		}
		return obj
	}

}
widgets.iconDropDown = iconDropDownDecorator()

function iconBarDecorator () {
	return (obj) => {
		if(!obj.push)
			widgets.list(obj)

		obj.addIcon = (txt, filename, lastIcon) => { // name for hover
			let icon = widgets.FAIcon({}, filename, lastIcon)
			icon.elem.title = txt
			obj.push(icon.elem)
			return icon
		}
		obj.addToggleIcon = (txt, filename, lastIcon) => { // name for hover
			let icon = widgets.FAToggleIcon({}, filename, lastIcon)
			icon.elem.title = txt
			obj.push(icon.elem)
			return icon
		}
		return obj
	}
}
widgets.iconBar = iconBarDecorator()

function barDecorator () {
	return obj => {
		widgets.list(obj)

		obj.elem.style.margin = "0"
		obj.elem.style.padding = "0.5em"
		obj.elem.style.fontSize = "1.4em"
		obj.elem.style.color = gui.icons.color

		obj.elem.style.display = "inline-flex" 
		obj.elem.style.flexWrap = "wrap"
		obj.elem.style.width = "100%"
		obj.elem.style.minHeight = "3em"
	
		widgets.iconBar(obj)
		obj.addTxt = (txt, name) => {
			let btn = widgets.span({})
			btn.style.margin = "1em"
			btn.innerText = txt
			obj.push(btn.elem)
			return btn
		}
		obj.addSeparator = () => {
			let sep = widgets.div({})
			sep.style.float = "left"
			sep.style.margin = "0.8em"
			obj.push(sep.elem)
			return sep
		}
		return obj
	}
}
widgets.bar = barDecorator()
