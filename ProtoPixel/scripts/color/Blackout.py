from openframeworks import *
from protopixel import Content
from random import randint
import math

print "Blackout"

#a global variable
size = 170
currentTransparency = 0
targetTransparency = 0


content = Content("Blackout")
content.FBO_SIZE = (170,170) #optional: define size of FBO, default=(100,100)

content.add_parameter("On", value=False)

@content.parameter_changed('On')
def parameter_changed(value):
    """
    This function is called every time a a_integer is changed.
    We get the new value as an argument
    """
    global targetTransparency

    if value == True:
        targetTransparency = 255
        print "Global Blackout ON "
    else:
        targetTransparency = 0
        print "Global Blackout OFF"

def setup():
    """
    This will be called at the beggining, you set your stuff here
    """
    ofSetBackgroundAuto(False)

def update():
    """
    For every frame, before drawing, we update stuff
    """

    global currentTransparency, targetTransparency
    currentTransparency = currentTransparency + ( targetTransparency - currentTransparency ) * 0.1

    # if content["On"] == True:
    #     targetTransparency = 255
    # else:
    #     targetTransparency = 0



def draw():
    """
    For every frame draw stuff. Do not forget to clear the frmebuffer!
    """

    global currentTransparency

    ofSetColor(0,0,0,int(currentTransparency))
    ofDrawRectangle(0,0,ofGetWidth(),ofGetHeight())
    

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
