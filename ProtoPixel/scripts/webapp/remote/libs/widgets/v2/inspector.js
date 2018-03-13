"use strict"

const inspector = {
	observe(obj = null) { // omiting more than 1
		if (!obj)
			return hideElem(inspector.Content.elem)
		inspector.Content.refresh(obj)
	},
	refresh(t = null) {
		const c = inspector.Content
		c.refresh(t || c.prev)
	},
}

function newPropertyMap() {
	const pl = new Map()
	pl.newProp = (name = "", props = {}) => {
		if (!props.type)
			console.error("addProperty needs a type", name)
		if (props.type === "button") {
			props.var = name
			props.onshow = () => {
				return props.var
			}
		}
		if (!props.var)
			console.error("addProperty needs a var", name)

		// default behaviour
		let p = {
			type: "", var: "", display_name: "", path: "", onchange: noop, prechange: noop, widget: null,
			postchange: noop, onshow: echo, oninit: noop, ondestroy: noop,
			ontranslate: echo, oncompare(a, b) { return a === b },
		}
		// custom behaviour
		for (let pr in props)
			p[pr] = props[pr]

		pl.set(name, p)
		return p
	}
	pl.filtered = []
	pl.dynamic = new Set()
	pl.addFilter = (f = "") => {
		pl.filtered.push(f)
	}
	pl.find = (path = "") => {
		for (let p of pl.values()) {
			if (p.path === path)
				return p
		}
	}

	return pl
}

function corePropsParse(obj, arr, onchange = noop, subgroup = "") {
	const ps = obj.properties
	for (let k of ps.keys()) {
		if (ps.dynamic.has(k)) {
			ps.delete(k)
		}
	}
	ps.dynamic.clear()
	_corePropsParse(obj, arr, onchange, subgroup)
}

//recursive bits
function _corePropsParse(obj, arr, onchange = noop, subgroup = "") {
	const props = obj.properties
	for (let p of arr) {
		if (p.workspace_widget) // ex: controller connected
			continue

		if (p.subgroup) {
			props.newProp(p.name, {
				type: "separator",
				var: "separator_" + p.name,
			})
			_corePropsParse(obj, p.subgroup, onchange, p.name + ":")
			props.newProp(p.name + "End", {
				type: "separatorEnd",
				var: "separatorEnd_" + p.name,
			})
			continue
		}
		if (!p.type)
			console.error(p.name, "must have a type")

		let varname = "conf_" + p.name, varvalues = varname + "_values", onshow = echo, oninit = noop

		if (p.type === "JSONvalue")
			continue // minification messed this up when inside the switch

		switch (p.type) {
			case "ofColor":
				onshow = v => {
					if (!v) {
						v = [0, 0, 0, 255]
					}
					return Array.from(v)
				}
				break
			case "choose":
				obj[varvalues] = p.values
				oninit = (_obj, w) => {
					w.options = _obj[varvalues]
					w.value = _obj[varvalues]
				}
				break
		}
		if (p.read_only)
			p.type = "label"
		obj[varname] = p.value
		let path = subgroup + p.name

		// add dynamic property to list
		// TODO: use path as keys instead of p.name as they could collide
		props.dynamic.add(p.name)

		props.newProp(p.name, {
			type: p.type,
			var: varname,
			display_name: p.display_name,
			path: path,
			onchange(_obj, v) {
				_obj[varname] = v
				onchange(_obj, onshow(v), path)
			},
			oninit: oninit,
			onshow: onshow,
		})
	}
}

function inspectionDynamic() {
	const I = newInspection({})
	I.prev = null

	I.append = t => {
		for (const [k, p] of t.properties) {
			const type = I[p.type]
			if (!type)
				console.error(p.type, "not in inspector")
			const w = type(p.display_name || k)
			p.oninit(t, w, I)
			p.widget = w
			w.onchange = _v => {
				const v = p.ontranslate(_v)
				p.prechange(t, v, I)
				p.onchange(t, v)
				p.postchange(t, v, I)
			}
			w.value = p.onshow(t[p.var])
		}
	}

	I.removeProps = t => {
		for (const p of t.properties.values()) {
			if (p.widget)
				I.remove(p.widget.entry)
		}
	}

	I._refresh = t => {
		if (I.prev) {
			for (let p of I.prev.properties.values()) {
				p.ondestroy(I.prev, p.widget)
			}
			I.prev = null
		}
		I.clear()
		if (!t)
			return
		I.title.value = t.name || t.type
		I.title.elem.readOnly = false
		if (t.type === "Selection") {
			I.title.elem.readOnly = true
			intersect_properties(t)
		}
		I.append(t)
		I.prev = t
	}
	return I
}

registerCustomElem("inspectionEntry", () => {
	const elem = newDIV()
	setStyle(elem, {
		display: "flex",
		alignItems: "center",
		margin: "0.9em 0.5em 0.9em 0.5em",
	})
	const name = append(elem, newDIV())
	append(elem, newCustomElem("flexible"))

	return { elem, name }
})
function newInspectionEntry(_name = "", widget = null) {
	const elem = newCustomElem("inspectionEntry")
	const { name } = useAPIs(elem)
	name.textContent = _name
	append(elem, widget.elem)

	return { elem, name, widget }
}

// Define what an Inspection looks like
registerCustomElem("inspection", () => {
	const elem = newDIV()
	elem.style.borderRadius = "2px"
	elem.style.boxShadow = "1px 1px 3px 0 rgba(0, 0, 0, 0.5)"

	let TITLE = document.createElement("input")
	TITLE.type = "text"
	TITLE.style.border = "0"
	TITLE.style.width = "100%"
	TITLE.style.padding = "0.5em 0.5em 0.5em 0.5em"
	TITLE.style.fontFamily = "OpenSans"
	TITLE.style.fontSize = "1em"
	TITLE.style.letterSpacing = "0.1em"
	TITLE.style.fontWeight = "700"
	TITLE.style.background = "var(--inputBg)"
	TITLE.style.color = "var(--textColorBold)"
	elem.appendChild(TITLE)

	let CONTENT = newDIV()
	CONTENT.style.background = "#232323"
	CONTENT.style.overflow = "auto"
	CONTENT.appendChild(newDIV()) // static
	CONTENT.appendChild(newDIV()) // dynamic
	elem.appendChild(CONTENT)

	let ENTRY = newDIV()
	ENTRY.style.display = "flex"
	ENTRY.style.alignItems = "center"
	ENTRY.style.margin = "0.9em 0.5em 0.9em 0.5em"

	ENTRY.appendChild(newDIV()) // name

	let SPACE = newDIV()
	SPACE.style.flex = 1
	ENTRY.appendChild(SPACE) // space, then a widget

	let SEPARATOR = newDIV()
	SEPARATOR.style.fontSize = "1em"
	SEPARATOR.style.color = "var(--textColorBold)"
	SEPARATOR.style.margin = "1.5em 0.5em 0.5em 0.5em"
	SEPARATOR.style.padding = "0.5em 0 0.5em 0"
	SEPARATOR.style.borderTop = "solid 2px #383838"

	return elem
})
function newInspection(obj) {
	const elem = newCustomElem("inspection")
	obj.elem = elem

	//hideElem(elem)
	//obj.title = widgets.stringInput({}, elem.children[0])
	obj.title = elem.children[0]
	obj.content = elem.children[1]
	obj.static = obj.content.children[0]
	obj.dynamic = obj.content.children[1]

	obj.title.onchange = _name => {
		let t = inspector.Content.prev
		t.name = _name
		obj.title.value = t.name
	}

	obj.refresh = t => {
		if (!t)
			return
		obj._refresh(t)
		showElem(elem)
	}

	obj.Content = newList()
	append(elem, obj.Content.elem)
	//widgets.list(obj.Content, obj.dynamic)

	obj.clear = () => {
		obj.Content.clear()
	}
	obj.remove = elem => {
		obj.Content.removeElem(elem)
	}

	obj.newEntry = (_name = "", w = null) => {
		return obj.Content.add(newInspectionEntry(_name, w))
	}

	obj.newWidget = w => {
		w.entry = w.elem
		obj.newElem(w.elem)
	}

	obj.newElem = elem => {
		obj.Content.push(elem)
	}

	obj.newToggle = name => {
		const w = newToggle()
		obj.newEntry(name, w)
		return w
	}
	obj.bool = obj.newToggle
	obj.label = name => {
		let w = widgets.string({})
		w.elem.style.userSelect = "text"
		obj.newEntry(name, w)
		return w
	}
	obj.newString = obj.label
	obj.newStringInput = name => {
		let w = widgets.stringInput({})
		w.elem.style.width = "65%"
		obj.newEntry(name, w)
		return w
	}
	obj.string = obj.newStringInput
	obj.number = name => {
		let w = widgets.number({})
		w.elem.style.width = "65%"
		obj.newEntry(name, w)
		w.style.paddingLeft = "0.5em"
		return w
	}
	obj.newNumber = obj.number
	obj.int = obj.number
	obj.CustomInt = obj.number
	obj.float = name => {
		let w = obj.int(name)
		w.min = 0.001
		w.max = 1
		w.step = 0.001
		return w
	}
	obj.color = name => {
		let w = widgets.color({})
		obj.newEntry(name, w)
		w.elem.style.width = "65%"
		w.elem.style.height = "2.5cm"
		return w
	}
	obj.newColor = obj.color
	obj.ofColor = obj.color
	obj.path = name => {
		const w = newPath(name)
		w.elem.style.margin = "0.9em 0.5em 0.9em 0.5em"
		obj.newWidget(w)
		return w
	}
	obj.newPath = obj.path
	obj.FilePath = obj.path
	obj.newImg = name => {
		let w = { elem: newDIV() }
		w.elem.style.width = "100%"
		obj.newWidget(w)
		return w
	}
	obj.newVideo = name => {
		let w = { elem: newDIV() }
		w.elem.style.width = "100%"
		obj.newWidget(w)
		return w
	}
	obj.select = name => {
		let w = widgets.select({})
		obj.newEntry(name, w)
		return w
	}
	obj.newSelect = obj.select
	obj.choose = obj.select
	obj.newSlider = name => {
		let w = widgets.slider({})
		w.classList.add("slider")
		w.style.width = "2cm"
		obj.newEntry(name, w)
		return w
	}
	obj.newButton = name => {
		let w = widgets.button({})
		w.style.width = "65%"
		w.value = name
		obj.newEntry("", w)
		return w
	}
	obj.button = obj.newButton
	obj.newList = name => {
		let w = widgets.sectionList({})
		w.value = name
		obj.newWidget(w)
		return w
	}
	obj.list = obj.newList
	obj.newDragList = name => {
		let w = obj.newList(name)
		widgets.dragList(w)
		return w
	}
	obj.dragList = obj.newDragList
	obj.newSeparator = name => {
		let w = { elem: SEPARATOR.cloneNode(true) }
		w.elem.innerText = name
		obj.newWidget(w)
		return w
	}
	obj.separator = obj.newSeparator
	obj.separatorEnd = name => {
		let w = obj.separator(name)
		w.elem.innerText = ""
		return w
	}

	return obj
}
