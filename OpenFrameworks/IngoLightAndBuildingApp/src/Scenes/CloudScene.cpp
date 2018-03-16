/*
 *  CloudScene.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 13/03/18.
 *
 */


#include "CloudScene.h"
#include "AppManager.h"


CloudScene::CloudScene(std::string name): ofxScene(name)
{
    //Intentionally left empty
}

CloudScene::~CloudScene()
{
    //Intentionally left empty
}


void CloudScene::setup() {
    ofLogNotice(getName() + "::setup");
    this->setupFbo();
    this->setupCloudShader();
}

void CloudScene::setupCloudShader()
{
    if(ofIsGLProgrammableRenderer()){
        m_cloudsShader.load("shaders/shadersGL3/Clouds");
    }
    else{
        m_cloudsShader.load("shaders/shadersGL2/Clouds");
    }
}


void CloudScene::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth()*0.3;
    float height = AppManager::getInstance().getSettingsManager().getAppHeight()*0.3;
    
    m_fbo.allocate(width, height);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}

void CloudScene::update()
{
    //Empty
}

void CloudScene::draw()
{
    ofEnableAlphaBlending();
    ofClear(0);
    this->drawClouds();
    ofDisableAlphaBlending();
   
}


void CloudScene::drawClouds()
{
    float width = m_fbo.getWidth();
    float height =  m_fbo.getHeight();
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    
    float cloudcover =  ofMap(parameters.num,0.0,800,0.0,1.0,true);
    float speed  = ofMap(parameters.speed,0.0,5.0,0.005,0.15,true);
    
    auto color = AppManager::getInstance().getGuiManager().getColor(0);

    m_fbo.begin();
    ofClear(0);
    m_cloudsShader.begin();
    m_cloudsShader.setUniform3f("iColor",color.r/255.0,color.g/255.0,color.b/255.0);
    m_cloudsShader.setUniform3f("iResolution", width, height, 0.0);
    m_cloudsShader.setUniform1f("iTime", ofGetElapsedTimef());
    m_cloudsShader.setUniform1f("cloudcover", cloudcover);
    m_cloudsShader.setUniform1f("speed", speed);
        ofDrawRectangle(0, 0, width, height);
    m_cloudsShader.end();
    m_fbo.end();
    
    
    width = AppManager::getInstance().getSettingsManager().getAppWidth();
    height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_fbo.draw(0,0, width, height);
}


void CloudScene::willFadeIn() {
    AppManager::getInstance().getGuiManager().loadPresetsValues(getName());
    ofLogNotice("CloudScene::willFadeIn");    
}

void CloudScene::willDraw() {
    ofLogNotice("CloudScene::willDraw");
}

void CloudScene::willFadeOut() {
   // AppManager::getInstance().getGuiManager().savePresetsValues(getName());
    ofLogNotice("CloudScene::willFadeOut");
}

void CloudScene::willExit() {
     ofLogNotice("CloudScene::willExit");
}

