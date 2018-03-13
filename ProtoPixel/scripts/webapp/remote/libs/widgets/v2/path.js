"use strict"

registerCustomElem("path", () => {
	const elem = newDIV()
	setStyle(elem, {
		display: "flex",
		flexDirection: "column",
	})
	const header = append(elem, newDIV())
	setStyle(header, {
		display: "flex",
		alignItems: "center",
	})
	const name = append(header, newDIV("Name"))

	append(header, newCustomElem("flexible"))

	const icon = append(header, newIMG(assets_path + "folder.svg"), {
		height: "2em",
		marginRight: "0.3em",
		fontSize: "0.9em",
		cursor: "pointer",
	})

	const clear = append(header, newIcon("clear", "✕"), {
		cursor: "pointer"
	})

	const path = append(elem, newDIV(), {
		flex: 1,
		padding: "0.25em",
		fontSize: "1em",
		letterSpacing: "0.1em",
		direction: "rtl",
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
	})

	return { elem, name, icon, clear, path }
})

function newPath(_name = "", _elem = null) {
	const elem = _elem || newCustomElem("path")
	const { name, icon, path, clear } = useAPIs(elem)

	name.textContent = _name

	const o = {
		elem, icon, path, name, clear,
		onchange: noop,
		extensions: "",
		_value: "",
		get value() {
			return o._value
		},
		set value(v) {
			if (v) {
				o._value = v
				path.title = v
				path.textContent = v.split("/").pop()
				return
			}
			if (!o._canClear)
				return
			o._value = ""
			path.title = ""
			path.textContent = ""
		},

		_canClear: true,
		get canClear() {
			return o._canClear
		},
		set canClear(v) {
			if (v === o._canClear)
				return
			o._canClear = v
			const sh = v ? showElem : hideElem
			sh(o.clear)
		},
	}

	icon.onclick = e => {
		return inputFileDialog(o.extensions).then(filepath => {
			if (!filepath && !o._canClear)
				return
			o.value = filepath
			o.onchange(filepath)
		})
	}

	clear.onclick = e => {
		o.value = ""
		o.onchange("")
	}

	return o
}
