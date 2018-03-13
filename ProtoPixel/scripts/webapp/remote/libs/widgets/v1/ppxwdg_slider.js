/*************************************************************************
 * Protopixel Widgets v1 . Slider
 * 14/10/2016
 *************************************************************************
 *
 * @description
 * Input slider.
 *
 *************************************************************************/
"use strict"

function sliderDecorator (use_rounded_version = true) {

	let CONTAINER = document.createElement("div")
	CONTAINER.style.position = "relative"
	CONTAINER.style.width = "100%"
	CONTAINER.style.height = "12px"

	let BAR = document.createElement("div")
	BAR.style.position = "absolute"
	BAR.style.height = "3px"
	BAR.style.width = "94%"
	BAR.style.height = "6px"
	BAR.style.marginTop = "3px"
	BAR.style.marginLeft = "3px"
	BAR.style.border = "none"
	BAR.style.borderRadius = "2px"
	BAR.style.boxShadow = "inset 0 0 1px 0 #000000"

	let SLIDER = document.createElement("input")
	SLIDER.style.width = "95%"
	SLIDER.type = "range"
	if(use_rounded_version) {
		SLIDER.classList.add("custom-input-range-round")
	} else {
		SLIDER.classList.add("custom-input-range-square")
	}

	CONTAINER.appendChild(BAR)
	CONTAINER.appendChild(SLIDER)

	return function (obj) {
		
		obj.elem = CONTAINER.cloneNode(true)
		widgetDecorator(obj)
		let bar = obj.elem.children[0], slider = obj.elem.children[1]

		obj.onchange = noop

		obj.getset("min", () => {
			return parseFloat(slider.min)
		}, (v) => {
			slider.min = v
		})
		obj.min = 0
		obj.getset("max", () => {
			return parseFloat(slider.max)
		}, (v) => {
			slider.max = v
		})
		obj.max = 100
		obj.getset("step", () => {
			return parseFloat(slider.step)
		}, (v) => {
			slider.step = v
		})
		obj.step = 1


		obj.getset("value", () => {
			return parseFloat(slider.value)
		}, (v) => {
			slider.value = v
			obj.updateProgressBar(v)
		})
		obj.elem.oninput = () => {
			let v = obj.value
			obj.onchange(v)
			obj.updateProgressBar(v)
		}
		obj.updateProgressBar = (v) => {
			let colorValue = ((obj.value-obj.min)/obj.max)*100
			let sliderBckColor = "linear-gradient(90deg, "+gui.colors.highlight+" "+colorValue+"%, "+gui.colors.iconOff+" "+colorValue+"%)"
			bar.style.background = sliderBckColor
		}
		obj.value = 0

		return obj
	}

}
widgets.slider = sliderDecorator()
