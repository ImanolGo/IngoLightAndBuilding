"use strict"

// HTML utils

// Selectors
//let $ = document.querySelector.bind(document)
const $ = (q = "", elem = document) => {
	return elem.querySelector(q)
}
//let $$ = document.querySelectorAll.bind(document)
const $$ = (q = "", elem = document) => {
	return elem.querySelectorAll(q)
}
const ID = document.getElementById.bind(document)
function on(elem = null, type = "", opt = null, f = null) {
	elem.addEventListener(type, f, opt)
}
function noop() { }


// Browser detection
const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

// Element creation
function newElem(type = "", txt = "") {
	const e = document.createElement(type)
	if (txt)
		e.textContent = txt
	return e
}
function newDIV(txt = "") {
	return newElem("div", txt)
}
function newSPAN(txt = "") {
	return newElem("span", txt)
}
function newBold(txt = "") {
	return setStyle(newSPAN(txt), {
		fontWeight: "bold"
	})
}
function newIMG(src = "") {
	const img = newElem("img")
	img.draggable = false
	if (src)
		img.src = src
	return img
}
function newINPUT(type = "", value = "") {
	const i = newElem("input")
	i.type = type
	i.value = value
	return i
}
function newSVG(type = "", props = null) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", type)
	if (type === "svg")
		svg.setAttribute("viewBox", "0 0 1 1")
	return setElemVars(svg, props)
}
function newA(txt = "", url = "", tab = false) {
	const a = newElem("a", txt)
	a.href = url
	if (tab)
		a.target = "_blank"
	return a
}
function newIframe(src = "") {
	const e = newElem("iframe")
	setStyle(e, {
		display: "block",
		border: "none",
	})
	if (src)
		e.src = src
	return e
}

function cloneElem(elem, txt = "") {
	const e = elem.cloneNode(true)
	if (txt)
		e.textContent = txt
	return e
}
function append(parent, child, style) {
	const p = parent.elem || parent, c = child.elem || child
	p.appendChild(c)
	if (style)
		setStyle(child, style)
	return child
}
function appendBefore(before, child, style) {
	const b = before.elem || before, p = b.parentNode, c = child.elem || child
	p.insertBefore(c, b)
	if (style)
		setStyle(c, style)
	return c
}
function appendFirst(parent, child, style) {
	const p = parent.elem || parent, c = child.elem || child
	p.insertBefore(c, p.firstChild)
	if (style)
		setStyle(child, style)
	return child
}
function removeElem(parent, child) {
	return parent.removeChild(child)
}


// Show and hide elements
function hideElem(elem) {
	const e = elem.elem || elem
	e.classList.add("hidden")
}
function showElem(elem) {
	const e = elem.elem || elem
	e.classList.remove("hidden")
}
function toggleElem(elem) {
	const e = elem.elem || elem
	e.classList.toggle("hidden")
}
function hideElems(...elems) {
	for (const e of elems)
		hideElem(e)
}
function showElems(...elems) {
	for (const e of elems)
		showElem(e)
}
function hideChildren(elem) {
	for (let c of elem.children)
		hideElem(c)
}
function showChildren(elem) {
	for (let c of elem.children)
		showElem(c)
}
function showOne(elem = null, tag = "") {
	const _elem = showOne.shown.get(tag)
	if (elem === _elem)
		return
	if (_elem)
		hideElem(_elem)
	showOne.shown.set(tag, elem)
	if (elem)
		showElem(elem)
}
showOne.shown = new Map()

function newPresenter() {
	return {
		current: [],
		present(...e1) {
			const e0 = this.current
			for (let e of e0)
				hideElem(e)
			for (let e of e1)
				showElem(e)
			this.current = e1
		},
		add(...e0) {
			for (let e of e0)
				showElem(e)
			this.current.push(...e0)
		}
	}
}

function newActivator(start = noop, end = noop) {
	return {
		start: start, end: end,
		active: [],
		activate(...a1) {
			const a0 = this.active
			for (let a of a0) {
				if (a)
					this.end(a)
			}
			for (let a of a1) {
				if (a)
					this.start(a)
			}
			this.active = a1
		},
		add(...a0) {
			for (let a of a0)
				this.start(a)
			this.current.push(...a0)
		}
	}
}


// Styling
const styleSheet = document.styleSheets[0]

// returns css index. ex: newCSS("#blanc { color: white }")
function newCSS(css = "", index = styleSheet.cssRules.length) {
	if (isFirefox && css.includes("-webkit"))
		return
	return styleSheet.insertRule(css, index)
}
// ex: newCSSRule("pre", "font: 14px verdana")
function newCSSRule(selector, rule) {
	return newCSS(selector + "{" + rule + ";}")
}
newCSSRule(".hidden", "display: none !important")

function setStyle(elem = null, style = null) {
	const e = elem.elem || elem, s = e.style || e // elem.style search
	for (let p in style)
		s[p] = style[p]
}
function setCSSvar(style = null, prop = "", v = "") {
	if (style.style)
		style = style.style

	style.setProperty("--" + prop, v)
}
function setCSSvars(style = null, props = null) {
	if (style.style)
		style = style.style

	for (let p in props)
		style.setProperty("--" + p, props[p])
}
function setElemVars(elem = null, props = null) {
	for (const p in props)
		elem.setAttribute(p, props[p])
	return elem
}


// Custom elements
function registerCustomElem(name = "", f) {
	const e = f(), elem = e.elem || e
	if (e.elem) { // compatibility
		for (const api in e) {
			if (api !== "elem") // root needs no api
				setAPIElem(api, e[api])
		}
	}
	newCustomElem.elems.set(name, elem)
}
function newCustomElem(name = "", txt = "") {
	const e = newCustomElem.elems.get(name).cloneNode(true)
	if (txt)
		e.textContent = txt
	return e
}
newCustomElem.elems = new Map()

// like registerCustomElem, but without elem creation (initCustomElem for that)
function defineCustomElem(name = "", f) {
	defineCustomElem.pending.set(name, f)
}
defineCustomElem.pending = new Map()

function initCustomElem(name = "") {
	return () => {
		const p = defineCustomElem.pending, d = p.get(name)
		if (!d)
			return console.error(name, "is not a defined elem")
		registerCustomElem(name, d)
		p.delete(name)
	}
}

function getAPIs(elem) {
	if (elem.elem)
		return elem // already parsed
	const obj = {}
	for (const e of $$(`[data-api]`, elem))
		obj[e.dataset.api] = e

	return obj
}
function useAPIs(elem) {
	if (elem.elem)
		return elem // already parsed
	const obj = {}
	for (const e of $$(`[data-api]`, elem)) {
		obj[e.dataset.api] = e
		delete e.dataset.api
	}
	return obj
}
function clearAPIs(elem) {
	const e = elem.elem || elem
	for (const _e of $$(`[data-api]`, e)) {
		delete _e.dataset.api
	}
}
function newElemAPI(name = "", txt = "") {
	const elem = newCustomElem(name, txt)
	const obj = useAPIs(elem)
	obj.elem = elem
	return obj
}


// Elements api
function setAPIElem(name = "", elem) {
	elem.dataset.api = name
	return elem
}
function getAPIElem(name = "", parent) {
	return $(`[data-api=${name}]`, parent)
}
function getSameAPIElems(name = "", parent) {
	return $$(`[data-api=${name}]`, parent)
}
function getAPIElems(parent, ...names) {
	let elems = []
	for (let name of names)
		elems.push(getAPIElem(name, parent))
	return elems
}
function useAPIElem(name = "", parent) {
	let e = getAPIElem(name, parent)
	delete e.dataset.api
	return e
}
function useAPIElems(parent, ...names) {
	let elems = []
	for (let name of names)
		elems.push(useAPIElem(name, parent))
	return elems
}
function setSearchElem(elem, data = "", value = "") {
	elem.dataset[`search${data}`] = value
	return elem
}
function getSearchElem(parent, data = "", value = "") {
	return $(`[data-search${data}="${value}"]`, parent)
}
function appendAPI(name = "", parent, child) {
	return setAPIElem(name, append(parent, child))
}

// URLs
function getURLMap(url = location) {
	return new URLSearchParams(url.search + "&" + url.hash.substr(1))
}

// Imports
function newImport(src = "") {
	const path = newImport.dynamic
	if (!path)
		return Promise.resolve()
	const I = newImport.imported, cached = I.get(src)
	if (cached)
		return cached
	const js = newElem("script")
	document.head.insertBefore(js, document.currentScript)
	const p = new Promise(ok => {
		js.onload = ok
		js.src = path + src
	})
	I.set(src, p)
	return p
}
newImport.imported = new Map()

;(() => {
	const src = document.currentScript.src, params = src.split("#")[1]
	const map = new URLSearchParams(params)
	newImport.dynamic = map.get("dynamic")
})()

function newImports(...srcs) {
	const ps = [] // handling imports
	for (const im of srcs) {
		ps.push(newImport(im))
	}
	return Promise.all(ps)
}

function importCSS(src = "") {
	const I = importCSS.imported, cached = I.has(src)
	if (cached)
		return cached
	I.add(src)

	//<link rel="stylesheet" href="src" />
	const elem = newElem("link")
	elem.rel = "stylesheet"
	elem.href = src
	append(document.head, elem)
}
importCSS.imported = new Set()

// Layout
// css-tricks.com/snippets/css/a-guide-to-flexbox/
/*
Flexbox
	container
		display: flex
		flexDirection: row | row-reverse | column | column-reverse
		flexFlow: (direction & wrap)
		alignItems: stretch | flex-start | flex-end | center | baseline
		alignContent: stretch | flex-start | flex-end | center | space-between | space-around
		flexWrap: nowrap | wrap | wrap-reverse
		justifyContent: flex-start | flex-end | center | space-between | space-around
	child
		flex: 1 (none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ])
		flexShrink: 1 | 0..<int>
		alignSelf: stretch | auto | flex-start | flex-end | center | baseline
		order: <integer>
*/

registerCustomElem("flexible", () => {
	const elem = newDIV()
	elem.style.flex = 1
	return elem
})
function newFlexible(txt = "") {
	return newCustomElem("flexible", txt)
}

registerCustomElem("fullscreen", () => {
	const elem = newDIV()
	setStyle(elem, {
		position: "absolute",
		height: "100%",
		width: "100%",
		top: 0, left: 0,
	})
	hideElem(elem)
	return elem
})

registerCustomElem("dialog", () => {
	const elem = newDIV()
	setStyle(elem, {
		position: "absolute",
		top: "50%", left: "50%",
		transform: "translate(-50%, -50%)",
	})
	hideElem(elem)
	return elem
})
