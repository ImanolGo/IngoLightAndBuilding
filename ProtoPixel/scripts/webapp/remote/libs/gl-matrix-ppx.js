"use strict"

newImport("gl-matrix-min.js").then(() => {

	vec4._transformMat4 = vec4.transformMat4
	vec4.transformMat4 = (out, a, m) => {
		if (a[3] !== 1)
			console.error("transformMat4: a[3] !== 1")
		vec4._transformMat4(out, a, m)
	}

	vec3.copyOffset = (out, o1, a, o2) => {
		out[o1] = a[o2]
		out[o1 + 1] = a[o2 + 1]
		out[o1 + 2] = a[o2 + 2]
	}

	vec3.add_ = (out, a, s) => {
		out[0] = a[0] + s
		out[1] = a[1] + s
		out[2] = a[2] + s
	}
	vec3.addxyz_ = (out, a, s) => {
		out[0] = a[0] + s
		out[1] = a[1] - s
		out[2] = a[2] + s
	}
	vec2.addxy = (out, a, b) => {
		out[0] = a[0] + b[0]
		out[1] = a[1] - b[1]
	}
	vec3.addxyz = (out, a, b) => {
		out[0] = a[0] + b[0]
		out[1] = a[1] - b[1]
		out[2] = a[2] + b[2]
	}
	vec2.subxy = (out, a, b) => {
		out[0] = a[0] - b[0]
		out[1] = a[1] + b[1]
	}
	vec3.subxyz = (out, a, b) => {
		out[0] = a[0] - b[0]
		out[1] = a[1] + b[1]
		out[2] = a[2] - b[2]
	}
	vec3.abs = (out, a) => {
		out[0] = Math.abs(a[0])
		out[1] = Math.abs(a[1])
		out[2] = Math.abs(a[2])
		return out
	}

	mat4.setScale = (out, x, y, z) => {
		out[0] = x
		out[5] = y
		out[10] = z
		return out
	}

	mat4.getV1 = (out, m) => {
		out[0] = m[0]
		out[1] = m[1]
		out[2] = m[2]
		return out
	}
	mat4.getV2 = (out, m) => {
		out[0] = m[4]
		out[1] = m[5]
		out[2] = m[6]
		return out
	}
	mat4.getV3 = (out, m) => {
		out[0] = m[8]
		out[1] = m[9]
		out[2] = m[10]
		return out
	}
	mat4.getScale = (out, m) => {
		mat4.getV1(v0, m)
		out[0] = vec3.len(v0)
		mat4.getV2(v0, m)
		out[1] = vec3.len(v0)
		mat4.getV3(v0, m)
		out[2] = vec3.len(v0)
		return out
	}

	//mat4.getPosition = mat4.getTranslation
	mat4.getPosition = (out, a) => {
		out[0] = a[12]
		out[1] = a[13]
		out[2] = a[14]
		out[3] = 1
		return out
	}
	mat4.getX = (a) => { return a[12] }
	mat4.getY = (a) => { return a[13] }
	mat4.getZ = (a) => { return a[14] }

	mat4.setPosition = (out, x, y, z) => {
		out[12] = x
		out[13] = y
		out[14] = z
		return out
	}
	mat4.addPosition = (out, x, y, z) => {
		out[12] += x
		out[13] += y
		out[14] += z
		return out
	}
	mat4.move = (out, s, x, y, z) => {
		mat4.addPosition(out, x * s, y * s, z * s)
		return out
	}
	mat4._perspective = (out, h, aspect, near, far) => {
		const f = 1.0 / h,
			nf = 1 / (near - far)
		out[0] = f / aspect
		out[5] = f
		out[10] = (far + near) * nf
		out[11] = -1
		out[14] = (2 * far * near) * nf
		out[15] = 0
		return out
	}
	mat4.inv_perspective = (out, p) => {
		out[0] = 1 / p[0]
		out[5] = 1 / p[5]
		out[11] = 1 / p[14]
		out[14] = 1 / p[11]
		out[15] = -p[10] / (p[14] * p[11])
		return out
	}
})
