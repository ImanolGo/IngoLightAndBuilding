/*
 *  VectorFieldParticle.cpp
 *  CoralSoulApp
 *
 *  Created by Imanol Gomez on 03/12/17.
 *
 */

#include "AppManager.h"

#include "VectorFieldParticle.h"

VectorFieldParticle::VectorFieldParticle(): m_maxSpeed(2), m_height(6)
{
    this->setup();
}


VectorFieldParticle::~VectorFieldParticle()
{
    //Intentionaly left empty
}


void VectorFieldParticle::setup(){
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_pos.x = ofRandom(0,width);
    m_pos.y = ofRandom(0,height);
    m_prevPos = m_pos;
    //m_color.setHsb(226, 255, 128);
    m_color = ofColor(0, 0, 255);
    
    this->setupBrush();
}

void VectorFieldParticle::reset()
{
	float width = AppManager::getInstance().getSettingsManager().getAppWidth();
	float height = AppManager::getInstance().getSettingsManager().getAppHeight();

	m_pos.x = ofRandom(0, width);
	m_pos.y = ofRandom(0, height);
	m_prevPos = m_pos;
	m_vel = ofVec2f(0);
	m_acc = ofVec2f(0);

}

void VectorFieldParticle::setupBrush()
{
    m_brush.setResource("Brush");
    m_brush.setWidth(m_height,true);
}


void VectorFieldParticle::setSize(float size)
{
     m_height = size;
     m_brush.setWidth(m_height,true);
}

void VectorFieldParticle::addForce(const ofVec2f& dir)
{
    m_acc += dir;
}



void VectorFieldParticle::update()
{
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_vel+=m_acc;
    m_vel.limit(m_maxSpeed);
    m_prevPos = m_pos;
    m_pos+= (m_vel + ofVec2f(ofRandom(-0.5,0.5),ofRandom(-0.5,0.5)));
    m_acc = ofVec2f(0);
    
    
    
    //float adj = ofMap(m_pos.y, 0, height, 1.0, 0);
    //float adj =  ofMap(abs(m_pos.x - m_prevPos.x), 0.0, 1.0,0.0,1.0,true);
     float adj =  ofMap(abs(m_pos.x - m_prevPos.x), 0.3, 2.0,0.0,1.0,true);
    
    //ofColor c1 = ofColor(0,164,243);
    //m_color = ofColor(120,255,214);
    
    ofColor r = ofColor(99,209,176);
    ofColor b = ofColor(0,60,220);
    m_color= b.getLerped(r, adj);
    

    //float hue = ofLerp(246,120,adj);
    //int saturation = (int)  ofMap(abs(m_pos.x - m_prevPos.x), 0.0, 1.0,0.0,255,true);
    //m_color = ofColor::blue;
    //m_color.setSaturation(saturation);
    //m_color = b;
    
    if(this->isOffScreen()){
        this->stayOnScreen();
        m_prevPos = m_pos;
    }
    
    m_brush.setPosition(m_pos);
    m_brush.setColor(m_color);
}

void VectorFieldParticle::draw(){
    
    ofPushMatrix();
    ofPushStyle();
        //ofSetColor(m_color);
        //ofScale(0.5, 0.5);
        //ofSetLineWidth(m_height);
        m_brush.draw();
        //ofDrawLine(m_prevPos,m_pos);
        //ofDrawRectRounded(-width*0.5,-height*0.5,m_fbo.getWidth(),height, 0.1);
    ofPopStyle();
    ofPopMatrix();
}

void VectorFieldParticle::stayOnScreen()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    if( m_pos.x < 0 ) m_pos.x = width - 10;
    if( m_pos.x > width) m_pos.x = 10;
    if( m_pos.y < 0 ) m_pos.y = height - 10;
    if( m_pos.y > height ) m_pos.y = 10;
}

bool VectorFieldParticle::isOffScreen(){
    
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    if( m_pos.x < 0 || m_pos.x >= width|| m_pos.y < 0 || m_pos.y >= height ){
        
        return true;
    }
    
    return false;
}

