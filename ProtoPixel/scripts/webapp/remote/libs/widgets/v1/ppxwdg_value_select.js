/*************************************************************************
 * Protopixel Widgets v1 . Select dropdown
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * Simple select box.
 *
 *************************************************************************/
"use strict"

function selectDecorator() {

	let SELECT = newElem("select")
	let OPTION = newElem("option")

	let vars = widgets.CSSvars // browser bug workaround

	setStyle(SELECT.style, {
		height: "2.0em",
		width: "65%",
		border: "solid 1px var(--inputBgDark)",
		borderRadius: "4px",
		paddingLeft: "0.5em",
		fontSize: "1em",
		color: "var(--textColor)",
		backgroundColor: "var(--inputBg)",
		//backgroundImage: "url('" + assets_path + "arrow_singledown.svg'), linear-gradient(to top, var(--inputBgDark), var(--inputBg))", // not available
		backgroundImage: "url('" + assets_path + "arrow_singledown.svg'), linear-gradient(to top, "+vars.inputBgDark+", "+vars.inputBg+")", // workaround

		appearance: "none",
		"-webkit-appearance": "none",
		overflow: "hidden",
		backgroundRepeat: "no-repeat",
		backgroundPosition: "center right",
		backgroundSize: "2em 2em",

		cursor: "pointer",
	})

	return obj => {
		let elem = SELECT.cloneNode(true)
		obj.elem = elem
		widgetDecorator(obj)

		obj.set("options", v => {
			elem.innerHTML = ""
			for (let txt of v) {
				let o = OPTION.cloneNode(true)
				o.innerText = txt
				o.value = txt
				elem.add(o)
			}
		})

		obj.onchange = noop
		obj.getset("value", () => {
			return elem.value
		}, v => {
			elem.value = v
		})

		elem.onchange = () => {
			obj.onchange(obj.value)
		}

		obj.fill = (options = [""], v0 = "", value = "") => {
			if (v0)
				options.unshift(v0)
			obj.options = options
			if (value)
				obj.value = value
		}
		return obj
	}
}
widgets.select = selectDecorator()
