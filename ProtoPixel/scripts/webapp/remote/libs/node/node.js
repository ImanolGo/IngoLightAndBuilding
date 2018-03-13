// Node provides functions to connect to and from a ppx node
const node = {
	dial(ch = null, ID = "", service = "") {
		return new Promise(ok => {
			ch.onopen = () => {
				ch.get("AUTH TEST").then(ar => {
					if (ar !== "AUTH OK")
						return console.error(ar)
					ch.get(service).then(sr => {
						if (sr !== "SERVICE OK")
							return console.error(sr)
						ok(ch)
					})
				})
			}
			ch.dial(ID)
		})
	}
}
