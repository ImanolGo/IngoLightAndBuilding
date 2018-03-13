"use strict"

function newRadioGroup(_group = []) {
	const o = {
		value: null, onchange: noop,
		//group: [],

		add(obj = null) {
			//o.group.push(obj)
			obj.onchange = () => {
				let old = o.value
				if (old === obj)
					old = null

				o.value = obj
				o.onchange(obj, old)
			}
		},
	}

	for (const obj of _group)
		o.add(obj)

	return o
}
