// Channel connects two endpoints by using a websocket or a webrtc datachannel
function newChannel() {
	const ch = {
		bridge: null,
		BridgeURL: "BridgeURL:21769",
		onopen: noop, onclose: noop,
		send: noop, onsend: noop,
		onmessage(msg) {
			console.log("<-", msg)
		},

		dial(id = "") {
			const ws = new WebSocket("ws://" + ch.BridgeURL + "/go/bridge/" + id)
			ch.bridge = ws

			ws.onclose = () => {
				ch.onclose()
			}

			ws.onmessage = e => {
				const msg = e.data
				if (msg !== id)
					console.error(msg)

				ws.onclose = e => {
					ch.onclose(e)
				}
				ws.onerror = e => {
					ch.onerror(e)
				}
				ws.onmessage = e => {
					ch.onmessage(e.data)
				}
				ch.send = msg => {
					ws.send(msg)
				}
				ch.onopen()
			}
		},

		get(msg = "") {
			return new Promise(ok => {
				ch.send(msg)
				ch.onmessage = (msg = "") => {
					ok(msg)
				}
			})
		}
	}
	return ch
}
