#version 410

uniform mat4 modelViewProjectionMatrix;
in vec4 position;
in vec2 texcoord;

out vec2 texCoordinates;
out vec3 positionNormalized;

void main() {
    
    texCoordinates = texcoord;
    positionNormalized = normalize(position.xyz);
    gl_Position = modelViewProjectionMatrix * position;
    
}