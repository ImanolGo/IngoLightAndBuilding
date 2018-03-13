"use strict"

let widgets = {
	CSSvars: {
		test: "red",
		textColor: "#979797",
		textColorBold: "#e2e2e2",
		inputBg: "#2c2c2c",
		inputBgDark: "#202020",
		highlight: "#2995d2",
		highlight2: "#1e84bd",
		background: "#1b1b1b",
		border: "#292929",
	}
}

const assets_path = "../assets/"

function objgetset(obj, key, get, set) { // custom get and set
	Object.defineProperty(obj, key, {
		get: get,
		set: set,
	})
}
function objget(obj, key, get) { // custom get
	Object.defineProperty(obj, key, {
		get: get,
	})
}
function objset(obj, key, set) { // custom set
	Object.defineProperty(obj, key, {
		set: set,
	})
}

function widgetDecorator(w) {
	if (w.appendTo) // already a widget
		return
	w.appendTo = function (parent) {
		w.parent = parent
		parent.appendChild(w.elem)
	}
	w.detach = function () {
		if (!w.parent)
			return
		w.parent.removeChild(w.elem)
		delete w.parent
	}
	w.getset = function (key, get, set) {
		objgetset(w, key, get, set)
	}
	w.get = function (key, get) {
		objget(w, key, get)
	}
	w.set = function (key, set) {
		objset(w, key, set)
	}
	w.bind = function (attr) {
		w.getset(attr, function () {
			return w.elem.getAttribute(attr)
		}, function (v) {
			w.elem.setAttribute(attr, v)
		}
		)
	}
	w.$ = function (q) {
		return w.elem.querySelector(q)
	}
	w.$$ = function (q) {
		return w.elem.querySelectorAll(q)
	}
	w.getset("id", () => {
		return w.elem.id
	}, (v) => {
		w.elem.id = v
	}
	)
	w.getset("innerText", () => {
		return w.elem.innerText
	}, (v) => {
		w.elem.innerText = v
	}
	)
	w.get("classList", () => { // add, remove, toggle, contains, item
		return w.elem.classList
	}
	)
	w.get("dataset", () => { // (map)
		return w.elem.dataset
	}
	)
	w.get("style", () => {
		return w.elem.style
	}
	)
	return w
}

function divDecorator() {
	let DIV = document.createElement("div")
	return (obj) => {
		obj.elem = DIV.cloneNode(true)
		widgetDecorator(obj)
		return obj
	}
}
widgets.div = divDecorator()

function spanDecorator() {
	let SPAN = document.createElement("span")
	return (obj) => {
		obj.elem = SPAN.cloneNode(true)
		widgetDecorator(obj)

		obj.getset("txt", () => {
			return obj.elem.innerText
		}, (v) => {
			obj.elem.innerText = v
		})
		return obj
	}
}
widgets.span = spanDecorator()

// css-tricks.com/snippets/css/a-guide-to-flexbox/
function flexDecorator() {
	return (obj, elem) => {
		obj.elem = elem
		widgets.list(obj, elem)

		obj.style.display = "flex"

		// row | row-reverse | column | column-reverse
		obj.set("dir", (v) => {
			obj.style.flexDirection = v
		})

		// flex-start | flex-end | center | baseline | stretch
		obj.set("align", (v) => {
			obj.style.alignItems = v
		})

		let push_txt = obj.push_txt
		obj.push_txt = txt => {
			let _elem = push_txt(txt)
			let _obj = widgetDecorator({})
			_obj.elem = _elem

			_obj.getset("flex", () => {
				return _obj.style.flex
			}, v => {
				_obj.style.flex = v
			})
			return _obj
		}
		return obj
	}
}
widgets.flex = flexDecorator()

function stateDecorator() {
	return function (obj) {
		obj._current = {
			onExit: noop
		}

		objgetset(obj, "current", function () {
			return obj._current
		}, function (v) {
			obj._current.onExit(v)
			v.onEnter(obj._current)
			obj._current = v
		})
		return obj
	}
}
widgets.state = stateDecorator()

function listDecorator() {
	let LIST = document.createElement("div")
	return (obj, elem) => {
		if (!elem) {
			elem = LIST.cloneNode(true)
			obj.elem = elem
		}
		widgetDecorator(obj)

		if (obj.items)
			return // already a list

		obj.get("items", () => {
			return elem.children
		})
		obj.getset("length", () => {
			return elem.children.length
		}, v => {
			while (elem.children.length > v)
				elem.removeChild(elem.lastChild)
		})

		obj.pushElem = _elem => {
			elem.appendChild(_elem)
			return _elem
		}
		obj.push = _elem => {
			return obj.pushElem(_elem)
		}
		obj.push_txt = txt => {
			let div = newElem("div")
			div.innerText = txt
			return obj.push(div)
		}

		obj.clearElems = () => {
			elem.innerHTML = ""
		}
		obj.clear = () => {
			obj.clearElems()
		}

		obj.removeElemAt = i => {
			return elem.removeChild(elem.children[i])
		}
		obj.remove = i => {
			return obj.removeElemAt(i)
		}
		obj.removeElem = (e) => {
			return elem.removeChild(e)
		}

		obj.insertElemBefore = (e, before_elem) => {
			elem.insertBefore(e, before_elem)
		}
		obj.insertBefore = (e, before_elem) => {
			obj.insertElemBefore(e, before_elem)
		}
		obj.insert = (e, before_elem) => {
			obj.insertBefore(e, before_elem)
		}
		obj.insertAfter = (e, after_elem) => {
			obj.insertBefore(e, after_elem.nextSibling)
		}

		obj.reorderElem = (e, pos) => {
			elem.removeChild(e)
			obj.insertElemBefore(e, elem.children[pos])
		}
		obj.reorder = (e, pos) => {
			obj.reorderElem(e, pos)
		}

		obj.indexOfElem = e => {
			return [].indexOf.call(elem.children, e)
		}
		obj.indexOf = e => {
			return obj.indexOfElem(e)
		}

		return obj
	}
}
widgets.list = listDecorator()

function dragListDecorator() {
	return (obj, elem) => {
		widgets.list(obj, elem)

		if (obj.ondragstart)
			return // already a dragList

		obj.dragging = null
		obj.ondragstart = noop
		obj.ondragover = noop
		obj.ondrop = noop
		obj.ondragend = noop

		let push = obj.push
		obj.push = (elem) => {
			elem.draggable = true
			elem.ondragstart = () => {
				obj.dragging = elem
				event.dataTransfer.effectAllowed = "move"
				event.dataTransfer.dropEffect = "move"
				window.ondragend = () => {
					obj.ondragend()
					window.ondragend = noop
				}
				obj.ondragstart(obj.indexOf(obj.dragging))
			}
			elem.ondragover = () => {
				event.preventDefault()
				obj.ondragover(elem)
			}
			elem.ondrop = () => {
				let pos = obj.indexOfElem(elem)
				obj.reorder(obj.dragging, pos)
				obj.ondrop(elem, pos)
			}
			return push(elem)
		}
		return obj
	}
}
widgets.dragList = dragListDecorator()

function objListDecorator() {
	return (obj, elem, arr) => {
		widgets.list(obj, elem)

		if (obj.pushObj)
			return // already an objList

		obj.pushObj = _obj => {
			arr.push(_obj)
			return _obj
		}
		let push_txt = obj.push_txt
		obj.push_txt = txt => {
			arr.push({ name: txt })
			return push_txt(txt)
		}
		obj.pushElemObj = (_elem, _obj) => {
			return [obj.push(_elem), obj.pushObj(_obj)]
		}
		obj.pushBundle = _obj => {
			obj.pushObj(_obj)
			obj.pushElem(_obj.elem)
			return _obj
		}

		obj.clearObjs = () => {
			arr.length = 0
		}
		obj.clear = () => {
			obj.clearElems()
			obj.clearObjs()
		}

		obj.fill_txt = txts => {
			for (let txt of txts)
				push_txt(txt)
		}
		obj.removeObjAt = i => {
			return arr_remove(arr, i)
		}
		obj.remove = i => {
			return [obj.removeElemAt(i), obj.removeObjAt(i)]
		}
		obj.removeObj = o => {
			return obj.remove(arr.indexOf(o))
		}

		obj.insertObjBefore = (_obj, before_elem) => {
			let pos = obj.indexOfElem(before_elem)
			arr_reorder(arr, _obj, pos)
		}
		obj.insertBefore = (e, before_elem) => {
			// find obj to move
			let i = obj.indexOfElem(e)
			let _obj = arr[i]
			// insert obj and elem
			obj.insertObjBefore(_obj, before_elem)
			obj.insertElemBefore(e, before_elem)
		}
		obj.reorder = (e, pos) => {
			arr_reorderAt(arr, obj.indexOfElem(e), pos)
			obj.reorderElem(e, pos)
		}

		obj.indexOfObj = o => {
			return arr.indexOf(o)
		}

		return obj
	}
}
widgets.objList = objListDecorator()

// filters by innerText. todo: maybe generalize
function listFilterDecorator() {
	return (obj, elemlist) => {
		const filter = widgets.stringInput({})
		const elem = newElem("div")
		const input = filter.elem
		filter.elem = elem
		obj.elem = elem
		elem.appendChild(input)

		filter.immediate_mode = true

		//input.placeholder = "Filter..."
		let border0 = input.style.border
		input.style.width = "100%"

		let clear = newElem("span")
		elem.appendChild(clear)
		clear.innerText = "x"
		clear.style.marginLeft = "-1em"
		clear.style.cursor = "pointer"
		clear.onclick = () => {
			filter.value = ""
			filter.onchange("")
		}

		filter.onchange = v => {
			input.style.border = border0
			if (!v) {
				showChildren(elemlist)
				obj.onchange()
				return
			}
			input.style.border = "1px solid var(--highlight)"
			v = v.toLowerCase()
			hideChildren(elemlist)
			for (let e of $$(`[data-search*="${v}"]`, elemlist))
				showElem(e)

			obj.onchange()
		}

		obj.onchange = noop

		return obj
	}
}
widgets.listFilter = listFilterDecorator()
