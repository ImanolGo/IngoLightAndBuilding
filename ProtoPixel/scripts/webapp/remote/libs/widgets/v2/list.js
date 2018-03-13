"use strict"

// a vertical list
registerCustomElem("list", () => {
	const elem = newDIV()
	setStyle(elem, {
		display: "flex",
		flexDirection: "column",
		overflow: "auto",
	})
	return elem
})

function newList(_elem = null) {
	const elem = _elem || newCustomElem("list")

	const o = {
		elem: elem,
		add(item = null) {
			append(elem, item.elem)
			return item
		},
		addTxt(name = "") {
			const it = newListItem(name)
			return o.add(it)
		}
	}
	return o
}

// a list item
registerCustomElem("listItem", () => {
	const elem = newDIV()
	setStyle(elem, {
		display: "flex",
		padding: "0.5em",
		alignItems: "center",
	})

	const name = append(elem, newDIV(), {
		flex: 1,
		overflow: "hidden",
		textOverflow: "ellipsis",
	})

	return { elem, name }
})

function newListItem(name0 = "", _elem = null) {
	const elem = _elem || newCustomElem("listItem")
	const name = useAPIElem("name", elem)
	name.textContent = name0

	const o = {
		elem, name,
	}
	return o
}
