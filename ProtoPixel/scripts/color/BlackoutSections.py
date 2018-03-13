from openframeworks import *
from protopixel import Content
from random import randint
import math

print "BlackoutSections"

#a global variable
size = 170
currentTransparency = []
targetTransparency = []
numSections = 5
onTransparency = 10


content = Content("BlackoutSections")
content.FBO_SIZE = (170,170) #optional: define size of FBO, default=(100,100)

content.add_parameter("_1", value=False)
content.add_parameter("_2", value=False)
content.add_parameter("_3", value=False)
content.add_parameter("_4", value=False)
content.add_parameter("_5", value=False)

@content.parameter_changed('_1')
def parameter_changed(value):

    global targetTransparency, onTransparency

    if value == True:
        targetTransparency[0] = 255
    else:
        targetTransparency[0] = onTransparency

@content.parameter_changed('_2')
def parameter_changed(value):

    global targetTransparency, onTransparency

    if value == True:
        targetTransparency[1] = 255
    else:
        targetTransparency[1] = onTransparency

@content.parameter_changed('_3')
def parameter_changed(value):

    global targetTransparency, onTransparency

    if value == True:
        targetTransparency[2] = 255
    else:
        targetTransparency[2] = onTransparency

@content.parameter_changed('_4')
def parameter_changed(value):

    global targetTransparency, onTransparency

    if value == True:
        targetTransparency[3] = 255
    else:
        targetTransparency[3] = onTransparency

@content.parameter_changed('_5')
def parameter_changed(value):

    global targetTransparency, onTransparency

    if value == True:
        targetTransparency[4] = 255
    else:
        targetTransparency[4] = onTransparency

def setup():
    """
    This will be called at the beggining, you set your stuff here
    """
    ofSetBackgroundAuto(False)
    for i in range(numSections):
        currentTransparency.append(0)
        targetTransparency.append(0)


def update():
    """
    For every frame, before drawing, we update stuff
    """

    global currentTransparency, targetTransparency

    for i in range(len(currentTransparency)):
        currentTransparency[i] = currentTransparency[i] + ( targetTransparency[i] - currentTransparency[i] ) * 0.1

    # if content["On"] == True:
    #     targetTransparency = 255
    # else:
    #     targetTransparency = 0



def draw():
    """
    For every frame draw stuff. Do not forget to clear the frmebuffer!
    """

    global currentTransparency

    ofSetColor(0,0,0,int(currentTransparency[0]))
    ofDrawRectangle(0,0,ofGetWidth(),35)

    ofSetColor(0,0,0,int(currentTransparency[1]))
    ofDrawRectangle(0,35,ofGetWidth(),35)

    ofSetColor(0,0,0,int(currentTransparency[2]))
    ofDrawRectangle(0,70,ofGetWidth(),40)

    ofSetColor(0,0,0,int(currentTransparency[3]))
    ofDrawRectangle(0,110,ofGetWidth(),40)

    ofSetColor(0,0,0,int(currentTransparency[4]))
    ofDrawRectangle(0,150,ofGetWidth(),20)
    

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
