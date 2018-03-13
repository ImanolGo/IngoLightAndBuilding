"use strict"

let ppx = null
let activeScript = ""
let activeColor1 = [255, 0, 0, 255]
let activeColor2 = [0, 255, 0, 255]
let activeColor3 = [0, 0, 255, 255]
let activeChangeHue = false
let activeColorSpeed = 0.5
let activeSpeed = 0.5
let isBlackOutActive = false;
let isSectionActive = [true, true, true, true, true]

let isStageModeOn = false


onload = () => {
	// You can provide an external @ to websocket_api, else it will
	// try connecting to current host or localhost. See ws_url
	PL.websocket_api().then(ws => {
		ppx = ws
		ppx.mute = false // to see all msgs in the console
		getContents()
	})
}

function getContents() {

	// testing: to activate code testing you should add a test flag as a
	// url parameter. Example: .../example/?test=true or .../#test=1
	// With the test flag set you don't need to run Create

	// testing: we can provide an expected result
	// ppx.expect(["content 1", "c2", "c3", "c4"])

	// Returns a promise that resolves to an array with the contents
	// currently in the workspace. First argument must be "root".
	ppx.get("getContentsInWorkSpace", "root").then(cs => {

		ID("contents").textContent += cs.join(", ")
		// getParameters(cs[0])

		// Subscribe to parameter changes:

		// test: value to send repeatedly, how often to receive it (in seconds)
		//ppx.expect_subs({ address: "content 1:enabled", param: "enabled", value: "{b}" }, 3)
		// set the parameter updated callback
		//ppx.subscribe("Content:parameter_modified:" + cs[0], paramUpdated)


		// Build HTML Interface
		var interfaceHTML = "<h1>SCENES.</h1>";
		interfaceHTML += "<hr>"
		for (let i = 0; i < cs.length; i++) { 
			// Activation buttons
	    	interfaceHTML += "<button id='activateContent"+i+"' type='button' class='buttonInactive'>"+cs[i].replace(".py", "")+"</button>";
		}
		ID("contents").innerHTML = interfaceHTML

		// Set the Interface Elements callbacks

		// Activation buttons

		for (let i = 0; i < cs.length; i++) { 

			if(cs[i] != "Blackout.py" && cs[i] != "BlackoutSections.py") {

				// TODO: On Reload analyze Create Project current state. Wich things are active and which no.

				ID("activateContent"+i).onclick = () => { 
					activeScript = cs[i];
					disableAllContents(cs); 
					setParameter(cs[i],"enabled","true"); 
					getParameters(cs[i])
					var mbc = ID("activateContent"+i).classList;
					if (mbc.contains("buttonInactive")) {
	 					mbc.remove("buttonInactive");
					}
					mbc.add("buttonActive");
				}

			} else if(cs[i] == "Blackout.py") {

				var mbc = ID("activateContent"+i).classList;
				mbc.remove("buttonInactive");
				if(!isBlackOutActive) {
					mbc.add("buttonInactiveBlackout");
				} else {
					mbc.add("buttonActiveBlackout");
				}
				setParameterObject("Blackout.py", "params:On", isBlackOutActive)

				// Blackout Toggle
				// ["Blackout.py","params:On",true]}
				ID("activateContent"+i).onclick = () => { 

					setParameter(cs[i], "enabled","true")
					setParameterObject("Blackout.py", "params:On", !isBlackOutActive)
					isBlackOutActive = !isBlackOutActive
					
					var mbc = ID("activateContent"+i).classList;
					mbc.remove("buttonInactive");
					mbc.add("buttonInactiveBlackout");

					if (mbc.contains("buttonInactiveBlackout")) {
	 					mbc.remove("buttonInactiveBlackout");
					}
					if (mbc.contains("buttonActiveBlackout")) {
	 					mbc.remove("buttonActiveBlackout");
					}

					if(!isBlackOutActive) mbc.add("buttonInactiveBlackout");
					if(isBlackOutActive) mbc.add("buttonActiveBlackout");
					
				}

			} else if(cs[i] == "BlackoutSections.py") {

				generateSectionsActiveGUI()

			}
				
			// Blacklist:
			if(cs[i] == "COLORFIX" || cs[i] == "remote.py" || cs[i] == "PpxApoloLaoutBlack.png" || cs[i] == "remote_web" || cs[i] == "BlackoutSections.py") 
					ID("activateContent"+i).style.display = "none"
		}

		// Create Global Parameters GUI 

		generateGlobalGUI()

	})

	// set the button callback
	// ID("setparam").onclick = setParameter

}

function generateGlobalGUI() {

	const globalGUI = ID("globalGUI")
	globalGUI.style.maxWidth = "1200px"
	globalGUI.innerHTML = ""
	
	// Color 1 GUI

	const widgetColor1 = addParameterTitle("COLOR 1")
	
	const color1GUI = newElem("div")
	widgetColor1.appendChild(color1GUI)

	let colorObject1 = newColor()
	colorObject1.value = activeColor1
	append(color1GUI,colorObject1, {
			width: "200px", height: "200px"
	})
	colorObject1.onchange = v => {
		activeColor1 = Array.from(v)
		setParameterObject(activeScript, "params:color1", Array.from(v))
	}

	globalGUI.appendChild(widgetColor1)

	// Color 2 GUI

	const widgetColor2 = addParameterTitle("COLOR 2")
	
	const color2GUI = newElem("div")
	widgetColor2.appendChild(color2GUI)

	let colorObject2 = newColor()
	colorObject2.value = activeColor2
	append(color2GUI,colorObject2, {
			width: "200px", height: "200px"
	})
	colorObject2.onchange = v => {
		activeColor2 = Array.from(v)
		setParameterObject(activeScript, "params:color2", Array.from(v))
	}

	globalGUI.appendChild(widgetColor2)

	// Color 3 GUI

	const widgetColor3 = addParameterTitle("COLOR 3")
	
	const color3GUI = newElem("div")
	widgetColor3.appendChild(color3GUI)

	let colorObject3 = newColor()
	colorObject3.value = activeColor3
	append(color3GUI,colorObject3, {
			width: "200px", height: "200px"
	})
	colorObject3.onchange = v => {
		activeColor3 = Array.from(v)
		setParameterObject(activeScript, "params:color3", Array.from(v))
	}

	globalGUI.appendChild(widgetColor3)

	// Change HUE

	const widgetChangeHUE = addParameterTitle("CHANGE HUE")

	const hueGUI = newElem("div")
	widgetChangeHUE.appendChild(hueGUI)

	let activeHUEObject = newToggle()
	activeHUEObject.value = activeChangeHue
	append(hueGUI,activeHUEObject, {
		width: "40px", height: "20px"
	})
	activeHUEObject.onchange = v => {
		activeChangeHue = v
		setParameterObject(activeScript, "params:change_hue", v)
	}

	globalGUI.appendChild(widgetChangeHUE)


	// COLOR SPEED

	const widgetChangeColor = addParameterTitle("COLOR SPEED")

	const colorChangeGUI = newElem("div")
	
	let colorChangeObject = newSlider()
	colorChangeObject.value = activeColorSpeed
	colorChangeObject.pointer.style.background = "#3ed2e6"
	colorChangeObject.pointer.style.width = "20px"
	append(colorChangeGUI,colorChangeObject, {
		width: "200px", height: "40px", background: "#4c5478", marginTop:"20px"
	})
	colorChangeObject.onchange = v => {
		activeColorSpeed = v
		setParameterObject(activeScript, "params:color_speed", v)
	}

	widgetChangeColor.appendChild(colorChangeGUI)
	globalGUI.appendChild(widgetChangeColor)


	// EFFECT SPEED

	const widgetChangeSpeed = addParameterTitle("EFFECT SPEED")

	const speedChangeGUI = newElem("div")
	
	let speedChangeObject = newSlider()
	speedChangeObject.value = activeSpeed
	speedChangeObject.pointer.style.background = "#3ed2e6"
	speedChangeObject.pointer.style.width = "20px"
	append(speedChangeGUI,speedChangeObject, {
		width: "200px", height: "40px", background: "#4c5478", marginTop:"20px"
	})
	speedChangeObject.onchange = v => {
		activeSpeed = v
		setParameterObject(activeScript, "params:speed", v) 
	}

	widgetChangeSpeed.appendChild(speedChangeGUI)
	globalGUI.appendChild(widgetChangeSpeed)

}

function generateSectionsActiveGUI() {

	// Add blackout sections GUI

	let activatorsContainer = addParameterTitle("Active Lamps")
	activatorsContainer.style.marginTop = "10px"
	activatorsContainer.style.marginLeft = "10px"
	activatorsContainer.innerHTML += "<hr>"

		for (let i = 0; i < 5; i++) { 

			let elemID = "_"+(i+1).toString()
			const arrayIndex = i

			let widgetChangeHUE = addParameterTitle(elemID)
			let hueGUI = newElem("div")
			widgetChangeHUE.appendChild(hueGUI)

			let activeHUEObject = newToggle()
			activeHUEObject.value = isSectionActive[arrayIndex]
			append(hueGUI,activeHUEObject, {
				width: "40px", height: "20px"
			})
			activeHUEObject.onchange = v => {
				isSectionActive[arrayIndex] = v
				setParameterObject("BlackoutSections.py", "params:"+elemID, !v) // Hack. Inversed logic in Create
				// Check if only the stage is active
				let isAllOff = true;
				for (var a = 0; a < isSectionActive.length-1; a++) { 
						if(isSectionActive[a]) 
							isAllOff = false;
				}
				if(isAllOff && isSectionActive[isSectionActive.length-1]) {
					isStageModeOn = true
				} else {
					isStageModeOn = false
				}
				setParameterObject(activeScript, "params:stage_mode", isStageModeOn)
			}

			activatorsContainer.appendChild(widgetChangeHUE)

		}

	ID("contents").appendChild(activatorsContainer)

}

function addParameterTitle(paramName = "default") {

	const ge = newElem("div")
	ge.style.float = "left"
	ge.style.marginRight = "2em"
	ge.style.marginBottom = "1em"

	const lb = newElem("div")
	lb.style.fontSize = "0.7em"
	lb.innerHTML = paramName.toUpperCase().replace("_", " ")
	append(ge,lb, {
		height: "2em", float: "left"
	})

	return ge

}

function getParameters(name = "") {
	
	const ps = ID("params")
	ps.innerHTML = ""
	const psGUI = ID("paramsGUI")
	psGUI.innerHTML = ""

	ppx.expect([ // expect lots of useless extra info
		{ name: "type", type: "string", value: "ProgramTestSquares" },
		{ name: "enabled", type: "bool", value: true },
		{ name: "blend mode", type: "choose", value: "alpha", values: ["overdraw", "aplha", "add", "subtract", "multiply", "screen"] },
		{ name: "color levels", type: "ofColor", value: [255, 255, 255, 255] },
		{ name: "projection type", type: "choose", value: "flatsimple", values: ["flatsimple"] },
		{
			name: "projection parameters", type: "group",
			subgroup: [
				{ name: "width", type: "float", min: 0, max: 0, value: 1 },
				{ name: "height", type: "float", min: 0, max: 0, value: 1 }
			]
		}
	])

	ppx.get("getConfContent", name).then((params = []) => {

		ps.appendChild(newElem("b", "[name: value (type)]")) // info

		function addParams(elem, arr = [], path = "") {

			// TODO: (!) Important Check if Skecth Blackout is active becasuse of reload.

			for (const p of arr) {
				
				elem.appendChild(newParam(p, path))

				// some parameters have subgroups so they should be parsed recursively
				if (p.subgroup) {
					const sg = newElem("div")
					sg.style.paddingLeft = "1em"
					addParams(sg, p.subgroup, p.name + ":")
					elem.appendChild(sg)
				}
				if (path !== "params:")
					continue

				// Separate GUI params

				// console.log(p.name)
				// console.log(p.type)

				const ge = newElem("div")
				psGUI.appendChild(ge)
				ge.style.float = "left"
				ge.style.marginRight = "2em"
				ge.style.marginBottom = "1em"

				// COLOR SELECTOR (Hidden in view)

				if (p.type == "ofColor") {

					const lb = newElem("div")
					lb.style.fontSize = "0.7em"
					lb.innerHTML = p.name.toUpperCase().replace("_", " ") 
					append(ge,lb, {
							height: "2em"
					})

					let cp = newColor()
					if(p.name == "color1") {
						cp.value = activeColor1
						setParameterObject(activeScript, "params:color1", activeColor1)
					}
					
					if(p.name == "color2") {
						cp.value = activeColor2
						setParameterObject(activeScript, "params:color2", activeColor2)
					} 
					
					if(p.name == "color3") {
						cp.value = activeColor3
						setParameterObject(activeScript, "params:color3", activeColor3)
					}
					
					append(ge,cp, {
						width: "200px", height: "200px"
					})
					cp.onchange = v => {
						setParameterObject(name, path+p.name, Array.from(v))
					}				

				}

				// BOOLEAN

				if (p.type == "bool") {

					const lb = newElem("div")
					lb.style.fontSize = "0.7em"
					lb.innerHTML = p.name.toUpperCase().replace("_", " ")
					append(ge,lb, {
							height: "2em"
					})

					let tg = newToggle()
					tg.value = true
					if(p.name == "change_hue") {
						tg.value = activeChangeHue
						setParameterObject(activeScript, "params:change_hue", activeChangeHue)
					}
					append(ge,tg, {
						width: "40px", height: "20px"
					})
					tg.onchange = v => {
						setParameterObject(name, path+p.name, v)
					}

					
	
				}

				// FLOAT

				if (p.type == "float") {

					const lb = newElem("div")
					lb.style.fontSize = "0.7em"
					lb.innerHTML = p.name.toUpperCase().replace("_", " ")
					append(ge,lb, {
							height: "2em"
					})


					let sl = newSlider()
					sl.value = p.value
					if(p.name == "color_speed") {
						sl.value = activeColorSpeed
						setParameterObject(activeScript, "params:color_speed", activeColorSpeed)

					}
					if(p.name == "speed") {
						sl.value = activeSpeed
						setParameterObject(activeScript, "params:speed", activeSpeed)
					}
					sl.pointer.style.background = "#3ed2e6"
					sl.pointer.style.width = "10px"
					append(ge,sl, {
						width: "120px", height: "20px", background: "#4c5478"
					})
					sl.onchange = v => {
						setParameterObject(name, path+p.name, v)
					}


				}

				// INT

				if (p.type == "int") {

					const lb = newElem("div")
					lb.style.fontSize = "0.7em"
					lb.innerHTML = p.name.toUpperCase().replace("_", " ")
					append(ge,lb, {
							height: "2em"
					})

					let sl = newSlider()
					sl.value = p.value
					sl.pointer.style.background = "#3ed2e6"
					sl.pointer.style.width = "10px"
					append(ge,sl, {
						width: "120px", height: "20px", background: "#4c5478"
					})
					sl.onchange = v => {
						if(p.name == "num_lines") {
							setParameterObject(name, path+p.name, Math.round(v*100))
						} else {
							setParameterObject(name, path+p.name, Math.round(v*10))
						}
					}


				}

				// Hide Global Parameters if not denugging

				if(p.name == "color1") ge.style.display = "none"
				if(p.name == "color2") ge.style.display = "none"
				if(p.name == "color3") ge.style.display = "none"
				if(p.name == "change_hue") ge.style.display = "none"
				if(p.name == "color_speed") ge.style.display = "none"
				if(p.name == "speed") ge.style.display = "none"
				if(p.name == "stage_mode") ge.style.display = "none"	
					

			}
		}

		addParams(ps, params)

	})
}

function newParam(p = {}, path = "") {
	const e = newElem("div")

	e.appendChild(newElem("span", p.name + ": "))

	const v = newElem("span", p.value || "")
	v.dataset.path = path + p.name
	e.appendChild(v)

	e.appendChild(newElem("span", ` (${p.type})`))
	return e
}

function newGUIParam(p = {}, path = "") {
	const e = newElem("div")

	e.appendChild(newElem("span", p.name + ": "))

	const v = newElem("span", p.value || "")
	v.dataset.path = path + p.name
	e.appendChild(v)

	e.appendChild(newElem("span", ` (${p.type})`))
	return e
}


function setParameter(name = "", key = "", value = "") {
	ppx.command("setConfContent", name, key, JSON.parse(value))
}
function setParameterObject(name = "", key = "", value = null) {
	ppx.command("setConfContent", name, key, value)
}

// for parameters live update
function paramUpdated(args) {
	//console.log(args.address + " updated to", args.value)
	const p = document.body.querySelector(`[data-path="${args.param}"]`)
	p.textContent = args.value
}


// Utils

// const ID = document.getElementById.bind(document)

/*
function newElem(type = "", txt = "") {
	const e = document.createElement(type)
	if (txt)
		e.textContent = txt
	return e
}
*/

// Content Related functions

function disableAllContents(contentList) {
	for (let i = 0; i < contentList.length; i++) { 
		if(contentList[i] != "COLORFIX" && contentList[i] != "Blackout.py" && contentList[i] != "BlackoutSections.py") {
			ID("activateContent"+i).classList.add("buttonInactive");
			setParameter(contentList[i], "enabled","false")
		}
	}
}

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}