/*************************************************************************
 * Protopixel Widgets v1 . Number Value
 * 11/10/2016
 *************************************************************************
 *
 * @description
 * Numeric values on inspection panels.
 *
 *************************************************************************/
"use strict"

function numberDecorator() {

	newCSS(`
		.no_builtin_number::-webkit-inner-spin-button,
		.no_builtin_number::-webkit-outer-spin-button {
			-webkit-appearance: none;
		}`)

	newCSS(`
		.ppx_input_number::-webkit-inner-spin-button, 
		.ppx_input_number::-webkit-outer-spin-button {
			opacity: 1; /* shows Spin Buttons per default (Chrome >= 39) */

			width: 2em;
			height: 2em;
			background-repeat: no-repeat;
			background-position: center 50%;
			box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.5);

			cursor: pointer;
		}`)

	//stackoverflow.com/questions/16589519/use-css-gradient-over-background-image
	let spinInfoBackground = "background-image: url('" + assets_path +
		"arrow_bidirectional.svg'), -webkit-gradient(linear, center top, center bottom, color-stop(0%, " +
		widgets.CSSvars.inputBg + "), color-stop(100%, " + widgets.CSSvars.inputBgDark + "))"
	newCSSRule(".ppx_input_number::-webkit-inner-spin-button", spinInfoBackground)
	newCSSRule(".ppx_input_number::-webkit-outer-spin-button", spinInfoBackground)

	let spinBorder = "border-left: 1px solid " + widgets.CSSvars.inputBgDark
	newCSSRule(".ppx_input_number::-webkit-inner-spin-button", spinBorder)
	newCSSRule(".ppx_input_number::-webkit-outer-spin-button", spinBorder)

	return function (obj) {
		widgets.input(obj)
		let elem = obj.elem
		elem.type = "number"
		elem.classList.add("no_builtin_number", "ppx_input_number")

		obj.bind("min")
		obj.bind("max")
		obj.bind("step")
		obj.getset("value", () => {
			return parseFloat(obj.elem.value)
		}, v => {
			if (v !== undefined)
				obj.elem.value = v
		})

		return obj
	}
}
widgets.number = numberDecorator()
