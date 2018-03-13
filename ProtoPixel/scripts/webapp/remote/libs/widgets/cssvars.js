"use strict"

const PPxCSSvars = {
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

addEventListener("load", () => { setCSSvars(document.body, PPxCSSvars) })
