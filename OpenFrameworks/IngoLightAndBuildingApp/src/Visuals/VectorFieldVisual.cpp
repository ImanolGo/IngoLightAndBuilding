/*
 *  VectorFieldVisual.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */


#include "AppManager.h"
#include "VectorFieldVisual.h"

const int VectorFieldVisual::NUM_PARTICLES = 800;


VectorFieldVisual::VectorFieldVisual():m_speed(0.02), m_spacing(20), m_skipFrames(0), m_fadeTime(8), m_size(20)
{
    //Intentionaly left empty
}


VectorFieldVisual::~VectorFieldVisual()
{
    //Intentionaly left empty
}


void VectorFieldVisual::setup()
{
    this->setupFbo();
    this->setupShader();
    this->setupVectorField();
    this->setupParticles();
    this->setupBlur();
}


void VectorFieldVisual::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    m_fbo.allocate(width,height);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}

void VectorFieldVisual::setupShader()
{
    m_thickLineShader.unload();
    m_thickLineShader.setGeometryInputType(GL_LINES);
    m_thickLineShader.setGeometryOutputType(GL_TRIANGLE_STRIP);
    m_thickLineShader.setGeometryOutputCount(4);
    
    if(ofIsGLProgrammableRenderer()){
        m_thickLineShader.load("shaders/shadersGL3/ThickLineShaderVert.glsl", "shaders/shadersGL3/ThickLineShaderFrag.glsl", "shaders/shadersGL3/ThickLineShaderGeom.glsl");
    }
    else{
         m_thickLineShader.load("shaders/shadersGL2/ThickLineShaderVert.glsl", "shaders/shadersGL2/ThickLineShaderFrag.glsl", "shaders/shadersGL2/ThickLineShaderGeom.glsl");
    }
   
}

void VectorFieldVisual::setupVectorField()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_vectorField.setup(width,height, m_spacing);
    
    // create the vector field using perlin noise
    m_vectorField.randomize();
    
    // adjust the vector field by normalizing, scaling, biasing & blurring (to make it look nice)
    m_vectorField.normalize();
    m_vectorField.scale(40);
    m_vectorField.bias(1, 1);
    //m_vectorField.blur();
}

void VectorFieldVisual::setupParticles()
{
    for( int i=0; i<NUM_PARTICLES; i++)
    {
        m_particles.push_back(VectorFieldParticle());
    }
}

void VectorFieldVisual::resetParticles()
{
	for (int i = 0; i<m_particles.size(); i++)
	{
		m_particles[i].reset();
	}
    
    this->setupShader();
}
void VectorFieldVisual::setupBlur()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    m_blur.setup(width, height);
    m_blur.setScale(0.05);
}

void VectorFieldVisual::update()
{
    this->updateVectorField();
    this->updateParticles();
    this->updateFbo();
}

void VectorFieldVisual::updateVectorField()
{
    m_vectorField.animate(m_speed);
}

void VectorFieldVisual::updateParticles()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    for( int i=0; i<m_particles.size(); i++)
    {
        auto force = m_vectorField.getVectorInterpolated(m_particles[i].getPos().x, m_particles[i].getPos().y, width, height*1.2);
        m_particles[i].addForce(force);
        m_particles[i].update();
    }
}

void VectorFieldVisual::updateFbo()
{
    float fClearOpacity =  1.0;
    float framesToDie = 255/fClearOpacity;
    float dt = ofGetLastFrameTime();
    //float fadeTime = 2.0;
    int numSkipFrames = m_fadeTime/(framesToDie*dt);
    m_skipFrames++;
    
   
    m_fbo.begin();
    
    
    if(m_skipFrames>=numSkipFrames){
        glEnable(GL_BLEND);
        glBlendFunc(GL_ONE, GL_ONE);
        glBlendEquation(GL_FUNC_REVERSE_SUBTRACT);
        
        ofSetColor(0, (int)fClearOpacity);
        ofFill();
        ofDrawRectangle(0,0, m_fbo.getWidth(), m_fbo.getHeight());
        
        m_skipFrames = 0;
    }
 
    
    glDisable(GL_BLEND);
    glBlendEquation(GL_FUNC_ADD);
    glBlendFunc(GL_SRC_COLOR, GL_DST_COLOR);
    
    
    ofSetColor(255);
    
        this->drawParticles();
    
    m_fbo.end();
    //ofDisableAlphaBlending();
    //ofDisableBlendMode();
}

void VectorFieldVisual::draw()
{
	m_fbo.draw(0, 0);
}


void VectorFieldVisual::drawVectorField()
{
    m_vectorField.draw();
}

void VectorFieldVisual::drawParticles()
{
	//ofEnableSmoothing();
    //ofEnableAlphaBlending();
	//ofEnableBlendMode(OF_BLENDMODE_ADD);
    //m_blur.begin();
    m_thickLineShader.begin();
    m_thickLineShader.setUniform1f("thickness", m_size);
    for( int i=0; i<m_numParticles; i++){
        m_particles[i].draw();
    }
    
    m_thickLineShader.end();
     //m_blur.end();
    // m_blur.draw();
	//ofDisableBlendMode();
}


void VectorFieldVisual::addParameters(ParticleParameters& parameters)
{
    for( int i=0; i<m_particles.size(); i++){
        m_particles[i].setMaxSpeed(parameters.speed);
        m_particles[i].setSize(parameters.size);
        m_particles[i].setRandomness(parameters.randomness);
    }
    
    m_size = parameters.size;
    
    m_numParticles = (int) ofClamp(parameters.num, 0, m_particles.size());
    m_fadeTime = parameters.fadeTime;
    m_speed = parameters.vectorSpeed;
}

void VectorFieldVisual::setColor(int index, ofColor& color)
{
    if(index<0 || index>= m_particles.size()){
        return;
    }
    
    m_particles[index].setColor(color);
    
}

void VectorFieldVisual::addForce(const ofVec2f& force)
{
    for( int i=0; i<m_particles.size(); i++){
        m_particles[i].addForce(force);
    }
}

void VectorFieldVisual::setSpeed(float value)
{
    for( int i=0; i<m_particles.size(); i++){
        m_particles[i].setMaxSpeed(value);
    }
}

void VectorFieldVisual::setSize(float value)
{
    for( int i=0; i<m_particles.size(); i++){
        m_particles[i].setSize(value);
    }
}

void VectorFieldVisual::setRandomness(float value)
{
    for( int i=0; i<m_particles.size(); i++){
        m_particles[i].setRandomness(value);
    }
}

void VectorFieldVisual::setNumber(int value)
{
    m_numParticles = min(value,(int)m_particles.size());
    m_numParticles = max(m_numParticles,0);
}

