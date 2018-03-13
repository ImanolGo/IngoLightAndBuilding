/*************************************************************************
 * Protopixel Widgets v1 . Icon
 * 9/3/2017
 *************************************************************************
 *
 * @description
 * Emoji.
 *
 *************************************************************************/
"use strict"

// css-tricks.com/almanac/properties/f/filter/
newCSS(".emojiIcon { filter: grayscale() invert() contrast(50%); }")

function newEmojiIcon(code = "🔒") {
	let icon = newElem("div")
	icon.innerText = code
	icon.classList.add("emojiIcon")
	return icon
}

function toggleEmojiDecorator() {
	return (code0 = "🔒", code1 = "🔓", initial = false) => {

		let obj = { elem: newEmojiIcon(code0) }
		obj.elem.style.cursor = "pointer"
		obj.value = !initial

		obj.onchange = noop
		obj.elem.onclick = () => {
			obj.value = !obj.value

			if (obj.value)
				obj.elem.innerText = code1
			else
				obj.elem.innerText = code0

			obj.onchange(obj.value)
		}
		obj.elem.onclick()

		return obj
	}

}
widgets.toggleEmoji = toggleEmojiDecorator()