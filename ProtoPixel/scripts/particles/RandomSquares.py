from openframeworks import *
from protopixel import Content
from random import randint

print "Random Squares"

class Square:
    size = 570
    height = 4
    width = 4
    thickness = 2
    alpha = 0
    color = ofColor(255)
    xPos = 0.0
    yPos = 0.0
    width = 0.0
    height = 0.0
    elapsedTime = 0.0
    rows = []
    cols = []

    def __init__(self, rows, cols):
        self.rows = rows
        self.cols = cols
        self.color.a = 0
        #self.setup()
        
    def setup(self):

        index = randint(0,len(self.rows) - 1)
        if content['stage_mode'] == True:
            index = len(self.rows) - 1

        row = self.rows[index]
        col = self.cols[index]

        r1 = randint(0,len(row) - 2)
        c1 = randint(0,len(col) - 2)

        self.yPos = row[r1]*self.size - self.thickness*0.5
        self.xPos = col[c1]*self.size - self.thickness*0.5
        self.height = abs(row[r1+1] - row[r1])*self.size + self.thickness
        self.width = abs(col[c1+1] - col[c1])*self.size + self.thickness
        self.color = ofColor(self.color.r, self.color.g, self.color.b, 255)
        self.elapsedTime = 0

    def update(self):
        self.elapsedTime = self.elapsedTime + ofGetLastFrameTime()
        alpha = self.function(float(self.elapsedTime), 255.0, 120.0, float(self.animationTime))
        self.color = ofColor(self.color.r, self.color.g, self.color.b, alpha)

    def setColor(self, color):
        self.color = color

    def draw(self):
        ofSetColor(self.color)
        ofFill()
        #ofDrawRectangle(self.xPos, self.yPos, self.width, self.height)
        ofDrawRectangle(self.xPos, self.yPos, self.width, self.thickness)
        ofDrawRectangle(self.xPos, self.yPos + self.thickness, self.thickness, self.height - self.thickness)
        xpos = self.xPos + self.width -  self.thickness
        ofDrawRectangle( xpos, self.yPos + self.thickness, self.thickness, self.height - self.thickness)
        ypos = self.yPos + self.height -  self.thickness
        ofDrawRectangle(self.xPos + self.thickness, ypos, self.width - 2*self.thickness, self.thickness)

    def function(self, t, from_, to, duration):
        c = to - from_
        return c*(t/duration) + from_

    def setAnimationTime(self, animationTime):
        self.animationTime = animationTime


#a global variable
size = 570
width = size
height =  size
color = ofColor(255)
elapsedTime = 0.0
elapsedTimeSquares = 0.0
startColorIndex = 1
endColorIndex = 2
scaleFactor = 10
squareScaleFactor = 2.0
rows = []
cols = []


row1 = [ 0.0069, 0.055, 0.102, 0.151]
row2 = [ 0.234926, 0.284, 0.331, 0.38]
row3 = [ 0.479, 0.528, 0.575, 0.625]
row4 = [ 0.707, 0.756, 0.803]
row5 = [ 0.899, 0.948, 0.994]

rows.append(row1)
rows.append(row2)
rows.append(row3)
rows.append(row4)
rows.append(row5)

col1 = [ 0.026, 0.107, 0.186, 0.268089, 0.35, 0.428, 0.508, 0.591, 0.67, 0.751, 0.831, 0.912, 0.99]
col2 = [ 0.026, 0.107, 0.186, 0.268089, 0.35, 0.428, 0.508, 0.591, 0.67, 0.751, 0.831, 0.912, 0.99]
col3 = [ 0.026, 0.107, 0.186, 0.268089, 0.35, 0.428, 0.508, 0.591, 0.67, 0.751, 0.831, 0.912, 0.99]
col4 = [ 0.268089, 0.35, 0.428, 0.508, 0.591, 0.67, 0.751]
col5 = [ 0.268089, 0.35, 0.428, 0.508, 0.591, 0.67, 0.751]

cols.append(col1)
cols.append(col2)
cols.append(col3)
cols.append(col4)
cols.append(col5)


#rows = [ 0.0069, 0.055, 0.102, 0.151, 0.234926, 0.284, 0.331, 0.38, 0.479, 0.528, 0.575, 0.625, 0.707, 0.756, 0.803, 0.899, 0.948, 0.994]
#cols = [ 0.026, 0.107, 0.186, 0.268089, 0.35, 0.428, 0.508, 0.591, 0.67, 0.751, 0.831, 0.912, 0.99]

squares = []

content = Content("RandomSquares")
content.FBO_SIZE = (size,size) #optional: define size of FBO, default=(100,100)

content.add_parameter("color1", type="color", value=ofColor(255, 255, 255))
content.add_parameter("color2", type="color", value=ofColor(255, 255, 255))
content.add_parameter("color3", type="color", value=ofColor(255, 255, 255))
content.add_parameter("change_hue", value=True)
content.add_parameter("color_speed", min=0.00, max=1.0, value=0.1)
content.add_parameter("speed", min=0.0, max=1.0, value=0.1)
content.add_parameter("num_squares", min=0, max=20, value=1)
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

@content.parameter_changed('speed')
def parameter_changed(value):
    """
    This function is called every time a a_integer is changed.
    We get the new value as an argument
    """

    global squares, squareScaleFactor, elapsedTimeSquares

    time = ofMap(content['speed'], 0.0, 1.0, squareScaleFactor, squareScaleFactor/10.0)

    for square in squares:
       square.setAnimationTime(time)

    elapsedTimeSquares = 0
       

def startSquares():

    for i in range(0, content['num_squares']):
        squares[i].setup()


def setup():
    """
    This will be called at the beggining, you set your stuff here
    """
    ofSetBackgroundAuto(True)

    global color, rows, cols, squareScaleFactor
    color = ofColor(content['color1'].r,content['color1'].g,content['color1'].b)   

    time = ofMap(content['speed'], 0.0, 1.0, squareScaleFactor, squareScaleFactor/10.0)

    for i in range(0, 100):
        square = Square(rows, cols)
        square.setAnimationTime(time)
        squares.append(square)

    startSquares()
    
       
def update():
    """
    For every frame, before drawing, we update stuff
    """

    global elapsedTime, color, startColorIndex, endColorIndex,scaleFactor, squareScaleFactor, elapsedTimeSquares

    for square in squares:
        square.setColor(color)
        square.update()

    elapsedTimeSquares+=ofGetLastFrameTime()

    time = ofMap(content['speed'], 0.0, 1.0, squareScaleFactor, squareScaleFactor/10.0)

    if elapsedTimeSquares>time:
        elapsedTimeSquares = 0
        startSquares()

    if content['change_hue'] == False:
        return

    
    elapsedTime+=ofGetLastFrameTime()

    time = ofMap(content['color_speed'], 0,1, scaleFactor, scaleFactor/20.0)

    if elapsedTime>time:
        elapsedTime = 0
        startColorIndex = endColorIndex
        endColorIndex = (endColorIndex+1)%3 + 1

    amt = elapsedTime/(time)
    startColorStr = 'color' + str(startColorIndex)
    endColorStr = 'color' + str(endColorIndex)
    color.r = int(ofLerp(content[startColorStr].r, content[endColorStr].r, amt))
    color.g = int(ofLerp(content[startColorStr].g, content[endColorStr].g, amt))
    color.b = int(ofLerp(content[startColorStr].b, content[endColorStr].b, amt))
    

  

def drawSquares():

    global rows, cols

    for x in range(0, content['num_squares']):
        square = Square(rows, cols)
        square.draw()

def draw():
    """
    For every frame draw stuff. Do not forget to clear the frmebuffer!
    """
    ofClear(0)

    for i in range(0, content['num_squares']):
        squares[i].draw()
       

    # for row in rows:
    #     ofDrawRectangle(0, row*size - 2, width, 4)

    # for col in cols:
    #     ofDrawRectangle(col*size - 2, 0, 4, height)
   

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
