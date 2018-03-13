from openframeworks import *
from protopixel import Content
from random import randint
import math

print "Hello ProtoPixel"

content = Content("Simple Script")
content.FBO_SIZE = (170,170) #optional: define size of FBO, default=(100,100)

#a global variable
counter = 0
amplitudes = []


# None of the following functions are mandatory, they can be omitted


def setup():
    global x_spacing, wave_width, theta, period, dx, max_amplitude, amplitudes

    ofBackground(255, 255, 255)
    ofSetFrameRate(25)
    ofEnableAlphaBlending()
    ofEnableSmoothing()
    # distance between each horizontal point (in pixels)
    x_spacing = 5
    # width of the wave
    wave_width = 170
    # current angle
    theta = 0.0
    # wave period (pixels)
    period = 170 / 2.0
    # x increment
    dx = (2.0 * math.pi * x_spacing) / period 
    # maximum amplitude of the wave
    max_amplitude = (170 / 2.0) * 0.75
    # current amplitude values
    amplitudes = [0.0 for _ in range(wave_width / x_spacing)]


def update():
    global x_spacing, wave_width, theta, period, dx, max_amplitude, amplitudes

    theta += 0.02
    x = theta
    c = (wave_width / 2)
    for i in range(len(amplitudes)):
        amplitudes[i] = c + (math.sin(x) * max_amplitude)
        x += dx


def draw():
    """
    For every frame draw stuff. Do not forget to clear the frmebuffer!
    """
    global x_spacing, wave_width, theta, period, dx, max_amplitude, amplitudes
    ofBackground(0, 0, 0)
    ofFill()
    ofSetColor(255, 255, 255, 100)
    for i in range(len(amplitudes)):
        ofDrawCircle(i*x_spacing, amplitudes[i], x_spacing*2)   


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
