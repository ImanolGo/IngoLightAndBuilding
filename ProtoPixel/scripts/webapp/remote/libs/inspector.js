"use strict"

let inspector = {
	observe(s = null) { // selection
		let n = s.length
		if (n < 1) {
			hideElem(inspector.Content.elem)
			return
		}
		let t = s[0]
		if (n > 1) {
			function make_selection_t(s) {
				return {
					type: "Selection",
					selected: s.slice(),
					properties: newPropertyMap(),
					getLocator() {
						let locators = []
						let locator_str = ""
						for (let it of s) {
							let l = it.getLocator()
							locators.push(l)
							locator_str += l.id + "_"
						}
						let l = () => {
							let s = []
							for (let loc of locators) {
								s.push(loc())
							}
							return make_selection_t(s)
						}
						l.id = locator_str
						return l
					}
				}
			}
			t = make_selection_t(s)
		}

		inspector.Content.refresh(t)
	},
	refresh(t = null) {
		let c = inspector.Content
		c.refresh(t || c.prev)
	},
}

function newPropertyMap() {
	let pl = new Map()
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
			makeundo(_t, v) {
				let old_v = p.onshow(_t[p.var])
				let new_v = p.onshow(v)
				let locator = _t.getLocator()
				return {
					undo() {
						let t = locator()
						let oldv = p.ontranslate(old_v)
						p.onchange(t, oldv)
						inspector.refresh()
					},
					redo() {
						let t = locator()
						let v = p.ontranslate(new_v)
						p.onchange(t, v)
						inspector.refresh()
					},
				}
			},
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
			makeundo: () => null,
		})
	}
}

function inspectionDynamic() {
	const I = widgets.inspection({})
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
				if (!t.getLocator)
					console.error("no locator", t.type)
				const locator = t.getLocator()
				const undo_obj = p.makeundo(t, v)
				p.prechange(t, v, I)
				p.onchange(t, v)
				p.postchange(t, v, I)
				if (undo_obj)
					user_actions.insert_undo_properties(locator.id + ':' + p.var, undo_obj.undo, undo_obj.redo)
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

function intersect_properties(t) {
	let items = t.selected
	let it0 = items.pop()

	function in_common(k = "", cmp) {
		let v = it0[k]
		for (let it of items) {
			let _v = it[k]
			if (_v === undefined)
				return [_v, false]
			if (!cmp(_v, v))
				v = undefined
		}
		return [v, true] // value, found
	}

	for (let [k, p] of it0.properties) {
		if (p.type === "label")
			continue
		let [v, found] = in_common(p.var, p.oncompare)
		if (!found)
			continue
		t[p.var] = v
		// create a property to controll them all
		t.properties.newProp(k, {
			type: p.type,
			var: p.var,
			oninit(_t, w) {
				p.oninit(it0, w)
			},
			ondestroy(_t, w) {
				p.ondestroy(it0, w)
			},
			ontranslate: p.ontranslate,
			onchange(_t, v) {
				p.onchange(it0, v)
				for (let it of items) {
					it.properties.get(k).onchange(it, v)
				}
			},
			makeundo(_t, v) {
				let uobjs = [p.makeundo(it0, v)]
				for (let it of items) {
					uobjs.push(it.getProp(k).makeundo(it, v))
				}
				return {
					undo() {
						for (let uo of uobjs) {
							uo.undo()
						}
					},
					redo() {
						for (let uo of uobjs) {
							uo.redo()
						}
					}
				}
			},
			onshow: p.onshow,
			prechange: p.prechange,
			postchange: p.postchange,
		})
	}
}

// Define what an Inspection looks like
function inspectionDecorator() {

	let SECTION = newDIV()
	SECTION.style.borderRadius = "2px"
	SECTION.style.boxShadow = "1px 1px 3px 0 rgba(0, 0, 0, 0.5)"

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
	SECTION.appendChild(TITLE)

	let CONTENT = newDIV()
	CONTENT.style.background = "#232323"
	CONTENT.style.overflow = "auto"
	CONTENT.appendChild(newDIV()) // static
	CONTENT.appendChild(newDIV()) // dynamic
	SECTION.appendChild(CONTENT)

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

	return obj => {
		let elem = SECTION.cloneNode(true)
		obj.elem = elem
		widgetDecorator(obj)

		hideElem(elem)
		obj.title = widgets.stringInput({}, elem.children[0])
		obj.content = elem.children[1]
		obj.static = obj.content.children[0]
		obj.dynamic = obj.content.children[1]

		obj.title.onchange = _name => {
			let t = inspector.Content.prev
			t.name = _name
			obj.title.value = t.name
			return // todo: repair undo rename
			user_actions.rename(t, _name, t => {
				obj.refresh(t)
			}).then(() => {
				obj.title.value = t.name
			})
		}

		obj.refresh = t => {
			if (!t)
				return
			obj._refresh(t)
			showElem(elem)
		}

		obj.Content = {}
		widgets.list(obj.Content, obj.dynamic)

		obj.clear = () => {
			obj.Content.clear()
		}
		obj.remove = elem => {
			obj.Content.removeElem(elem)
		}

		obj.newEntry = (name, w) => {
			let e = ENTRY.cloneNode(true)
			e.appendChild(w.elem)
			obj.Content.push(e)
			w.entry = e
			e.children[0].innerText = name
			return e
		}

		obj.newWidget = w => {
			w.entry = w.elem
			obj.newElem(w.elem)
		}

		obj.newElem = elem => {
			obj.Content.push(elem)
		}

		obj.newToggle = name => {
			let w = widgets.toggle({})
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
			//let w = widgets.color({})
			const w = newColor()
			obj.newEntry(name, w)
			setStyle(w, {
				width: "65%",
				height: "2.5cm",
			})
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
}
widgets.inspection = inspectionDecorator()
