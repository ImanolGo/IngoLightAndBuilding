"use strict"

function newIcon(title = "", icon = "", type = "") {
	const i = type ? newCustomElem(type) : newSPAN()
	i.textContent = icon
	i.title = title
	return i
}

registerCustomElem("greyIcon", () => { // ex: 🔒
	// css-tricks.com/almanac/properties/f/filter/
	const elem = newSPAN()
	elem.style.filter = "grayscale() invert() contrast(50%)"
	return elem
})

registerCustomElem("mIcon", () => {
	const elem = newSPAN()
	setStyle(elem, {
		fontFamily: "Material Icons",
		"-webkit-font-smoothing": "antialiased",
	})
	return elem
})

function newIconSVG(_title = "", icon = "", type = "icon") {
	const elem = newCustomElem(type + "SVG")
	const { txt, title } = useAPIs(elem)
	txt.textContent = icon
	title.textContent = _title
	return { elem, txt, title }
}

/*registerCustomElem("iconSVG", () => {
	const elem = newSVG("svg")
	const g = append(elem, newSVG("g")) // else title does not show up
	const title = append(g, newSVG("title"))
	const txt = append(g, newSVG("text", {
		y: "1",
		"font-size": "1",
	}))
	//if (!elem.dataset)
	//	return elem // todo: update electron
	return { elem, txt, title }
})

registerCustomElem("mIconSVG", () => {
	const elem = newCustomElem("iconSVG")
	getAPIs(elem).txt.setAttribute("font-family", "Material Icons")
	return elem
})*/
