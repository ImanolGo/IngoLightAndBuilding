from protopixel import Content
from openframeworks import *

import os.path
from tempfile import mkdtemp

content = Content("Ripple")

side = 256
content.FBO_SIZE = (side,side)
shaderfile = content.add_asset('shader')
shader = ofShader()

temp_dir = mkdtemp()
frag_file = os.path.join(temp_dir,'s.frag')
vert_file = os.path.join(temp_dir,'s.vert')
shader_file_of = os.path.join(temp_dir,'s')

content.add_parameter("speed", min=0.01, max=1.0, value=0.033)

def setup():
    if content['shader path']:
        shader_path_changed(content['shader path'])

    with open(frag_file,'w') as f:
        f.write(frag_contents_prefix)
        f.write(frag_contents)
        f.write(frag_contents_suffix)
    with open(vert_file,'w') as f:
        f.write(vert_contents)
    shader.load(shader_file_of)

def draw():

    if shader.isLoaded():
        shader.begin()
        shader.setUniform3f('iResolution', float(content.FBO_SIZE[0]), float(content.FBO_SIZE[1]),0.0)
        shader.setUniform1f('iGlobalTime', ofGetElapsedTimef()*content['speed']*10)
        ofDrawRectangle(-side/2.,-side/2.,side,side)
        shader.end()

@content.parameter_changed('shader path')
def shader_path_changed(p):
    print p
    frag_contents = open(p).read()
    with open(frag_file,'w') as f:
        f.write(frag_contents_prefix)
        f.write(frag_contents)
        f.write(frag_contents_suffix)
    with open(vert_file,'w') as f:
        f.write(vert_contents)
    shader.load(shader_file_of)


vert_contents = """
#version 150

in vec4 position;
out vec4 position_frag;

void main() {
    gl_Position = position;
    position_frag = position;
}
"""

frag_contents_prefix = """
#version 150
out vec4 outputColor;
uniform vec3 iResolution;
uniform float iGlobalTime;

in vec4 position_frag;
"""

frag_contents = """
// This code can be found in 
// https://www.shadertoy.com/view/ldX3zr
// and it's property of its creator.
// This is distributed for illustration purposes only.

vec2 center = vec2(0.5,0.5);
float speed = 0.035;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    float invAr = iResolution.y / iResolution.x;

    vec2 uv = fragCoord.xy / iResolution.xy;

    vec3 col = vec4(uv,0.5+0.5,1.0).xyz;

    vec3 texcol;

    float x = (center.x-uv.x);
    float y = (center.y-uv.y) *invAr;

    //float r = -sqrt(x*x + y*y); //uncoment this line to symmetric ripples
    float r = -(x*x + y*y);
    float z = 1.0 + 0.5*sin((r+iGlobalTime*speed)/0.013);

    texcol.x = z;
    texcol.y = z;
    texcol.z = z;

    fragColor = vec4(col*texcol,1.0);
}


"""

frag_contents_suffix = """
void main()
{
    vec2 pos = position_frag.xy;
    pos.x /= 2.0;
    pos.y /= 2.0;
    pos.x += 0.5;
    pos.y += 0.5;
    pos.x *= iResolution.x;
    pos.y *= iResolution.y;
    mainImage( outputColor, pos);
}
"""