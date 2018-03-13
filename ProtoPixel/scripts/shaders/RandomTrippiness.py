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
// https://www.shadertoy.com/view/lslGRj
// and it's property of its creator.
// This is distributed for illustration purposes only.

int schedule = 0;

vec4 hue(float rad)
{
    rad /= 2.0;
    return vec4(abs(cos(rad)), abs(cos(rad+1.05)),
        abs(cos(rad+2.09)), 1.0);
}

vec4 gradient(float f)
{
    f = mod(f, 1.0) * 3.14;
    if (schedule == 0) {
        return vec4(sin(f) * sin(f));
    } else if (schedule == 1) {
        float r = pow(.5 + .5 * sin(2.0 * (f + 0.00)), 20.0);
        float g = pow(.5 + .5 * sin(2.0 * (f + 1.05)), 20.0);
        float b = pow(.5 + .5 * sin(2.0 * (f + 2.09)), 20.0);
        return vec4(r, g, b, 1.0);
    } else if (schedule == 2) {
        return vec4(0.0, .5+.5*sin(f), 0.0, 1.0);
    }
    return vec4(0.0);
}

float offset(float th)
{
    float mt = mod(iGlobalTime, 4.0);
    float x = sin(iGlobalTime + th) + sin(iGlobalTime + 2.0 * th)
        + .3 * cos(iGlobalTime + 8.0 * th);
    if (schedule == 0) {
        return x + .2 * sin(10.0 * iGlobalTime + 20.0 * th);
    } else if (schedule == 1) {
        return x + floor(iGlobalTime * 3.0) * .333;
    } else if (schedule == 2) {
        return x + .1 * sin(60.0 * th);
    }
    return 0.0;
}

vec4 tunnel(float th, float radius)
{
    return gradient(offset(th) + log(6.0 * radius));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 uv = fragCoord.xy / iResolution.x +
        vec2(-.5, -.5 * iResolution.y / iResolution.x);
    schedule = int(mod(iGlobalTime + 2.0, 6.0) / 2.0);
    fragColor = tunnel(atan(uv.y, uv.x), 2.0 * length(uv));
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