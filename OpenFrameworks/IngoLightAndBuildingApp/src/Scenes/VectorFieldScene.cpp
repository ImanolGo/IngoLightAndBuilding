/*
 *  VectorFieldScene.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 06/03/18.
 *
 */



#include "AppManager.h"
#include "VectorFieldScene.h"

VectorFieldScene::VectorFieldScene(): ofxScene("VECTOR_FIELD"){}

void VectorFieldScene::setup() {
    ofLogNotice(getName() + "::setup");
    this->setupVectorField();
    this->setupFbo();
}


void VectorFieldScene::setupVectorField()
{
    m_vectorField.setup();
}

void VectorFieldScene::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_fbo.allocate(width, height);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}


void VectorFieldScene::update() {
    
    this->updateVectorField();
    this->updateFbo();
    
}

void VectorFieldScene::updateVectorField()
{
    float direction = AppManager::getInstance().getParticlesManager().getDirection();
    float angleRadiands = degree2radian(direction);
    float mag = AppManager::getInstance().getParticlesManager().getDirectionMag();
    float speed = AppManager::getInstance().getParticlesManager().getSpeed();
    
    ofVec2f force;
    force.x = -mag*sin(angleRadiands);
    force.y = mag*cos(angleRadiands);
    
    m_vectorField.addForce(force);
    m_vectorField.setSpeed(speed);
    
    auto size =  AppManager::getInstance().getParticlesManager().getSize();
    auto num =  AppManager::getInstance().getParticlesManager().getNum();
    auto fade = AppManager::getInstance().getParticlesManager().getFadeTime();
    auto vectSpeed = AppManager::getInstance().getParticlesManager().getVectorSpeed();
    auto randomness = AppManager::getInstance().getParticlesManager().getRandomness();
    
    m_vectorField.setSize(size);
    m_vectorField.setNumber(num);
    m_vectorField.setFadeTime(fade);
    m_vectorField.setVectSpeed(vectSpeed);
    m_vectorField.setRandomness(randomness);
    
    m_vectorField.update();
}


void VectorFieldScene::updateFbo()
{
    ofEnableAlphaBlending();
    m_fbo.begin();
    
    this->drawVectorField();
    m_fbo.end();
}

void VectorFieldScene::draw()
{
    ofEnableAlphaBlending();

    m_fbo.draw(0,0);
}

void VectorFieldScene::drawVectorField()
{
    m_vectorField.draw();
}


void VectorFieldScene::willFadeIn() {
    ofLogNotice("VectorFieldScene::willFadeIn");

    m_vectorField.resetParticles();
    ofLogNotice("VectorFieldScene::willFadeIn");
}

void VectorFieldScene::willDraw() {
    ofLogNotice("VectorFieldScene::willDraw");
}

void VectorFieldScene::willFadeOut() {
    ofLogNotice("VectorFieldScene::willFadeOut");
}

void VectorFieldScene::willExit() {
    ofLogNotice("VectorFieldScene::willExit");
}
