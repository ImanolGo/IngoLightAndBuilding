from openframeworks import *
from protopixel import Content
from random import randint

print "Random Squares"

content = Content("Random Squares")
content.FBO_squares_size = (170,170) #optional: define squares_size of FBO, default=(100,100)

#a global variable
elapsedTime = 0.0
elapsedTimeColor = 0.0
color = ofColor(255)
scaleFactor = 1.3
scaleFactorColor = 10


# None of the following functions are mandatory, they can be omitted
# 
content.add_parameter("color1", type="color", value=ofColor(255, 255, 255))
content.add_parameter("color2", type="color", value=ofColor(255, 255, 255))
content.add_parameter("color3", type="color", value=ofColor(255, 255, 255))
content.add_parameter("change_hue", value=True)
content.add_parameter("color_speed", min=0.00, max=1.0, value=0.1)
content.add_parameter("speed", min=0.0, max=1.0, value=0.1)
content.add_parameter("squares_amount", min=0, max=200, value=50)
content.add_parameter("squares_size", min=0.0, max=1.0, value=0.1)
content.add_parameter("stage_mode", value=False)


@content.parameter_changed('change_hue')
def parameter_changed(value):
    """
    This function is called every time a a_integer is changed.
    We get the new value as an argument
    """
    global color

    if value == False:
        color.r = content['color1'].r
        color.g = content['color1'].g
        color.b = content['color1'].b
        elapsedTime = 0
        startColorIndex = 1
        endColorIndex = 2

@content.parameter_changed('color1')
def parameter_changed(value):
    """
    This function is called every time a a_integer is changed.
    We get the new value as an argument
    """
    global color

    print value
    if content['change_hue'] == False:
        color.r = content['color1'].r
        color.g = content['color1'].g
        color.b = content['color1'].b
       


def setup():
    """
    This will be called at the beggining, you set your stuff here
    """

    ofSetBackgroundAuto(False)

    global color
    color = ofColor(content['color1'].r,content['color1'].g,content['color1'].b)


def update():
    """
    For every frame, before drawing, we update stuff
    """
    global elapsedTime, color, elapsedTimeColor
    

    elapsedTimeColor+=ofGetLastFrameTime()

    time = ofMap(content['color_speed'], 0,1, scaleFactorColor, scaleFactorColor/20.0)

    if elapsedTimeColor>time:
        elapsedTimeColor = 0.0
        if content['change_hue'] == True:
            colorStr = 'color' + str(randint(1, 3)) 
            color = content[colorStr]

    elapsedTime+=ofGetLastFrameTime()

    time = ofMap(content['speed'], 0.0, 1.0, scaleFactor, scaleFactor/6.0)

    if elapsedTime>time:
        elapsedTime = 0.0


def draw():

    global scaleFactor

    """
    For every frame draw stuff. Do not forget to clear the frmebuffer!
    """
    #ofClear(0,0,0,200)
    ofSetColor(0,0,0,5)
    ofDrawRectangle(0,0,ofGetWidth(),ofGetHeight())
    ofFill()

    if elapsedTime==0.0:
    	for i in range(0,content['squares_amount']):
            ofSetColor(color.r, color.g, color.b, randint(10, 255))
            if content['stage_mode'] == True:
                ofDrawCircle(randint(20, 110), randint(115, 150), randint(2, int(content['squares_size']*50)))
            else:
                ofDrawCircle(randint(0, 150), randint(0, 150), randint(2, int(content['squares_size']*50)))



def exit():
    """
    Before removing the script, in case you have pending business.
    """
    pass


def on_enable():
    """
    This function is called when this content just got enabled.
    """
    pass


def on_disable():
    """
    This function is called when this content just got disabled.
    `update` and `draw` functions are not called while this content is disabled.
    """
    pass
