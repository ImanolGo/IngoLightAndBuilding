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
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    
    float cloudcover =  ofMap(parameters.num,0.0,800,0.0,1.0,true);
    float speed  = ofMap(parameters.speed,0.0,5.0,0.005,0.15,true);
    
    auto color = AppManager::getInstance().getGuiManager().getColor(0);

    m_cloudsShader.begin();
    m_cloudsShader.setUniform3f("iColor",color.r/255.0,color.g/255.0,color.b/255.0);
    m_cloudsShader.setUniform3f("iResolution", width, height, 0.0);
    m_cloudsShader.setUniform1f("iTime", ofGetElapsedTimef());
    m_cloudsShader.setUniform1f("cloudcover", cloudcover);
    m_cloudsShader.setUniform1f("speed", speed);
        ofDrawRectangle(0, 0, width, height);
    m_cloudsShader.end();
}


void CloudScene::willFadeIn() {
    AppManager::getInstance().getGuiManager().loadPresetsValues(getName());
    ofLogNotice("CloudScene::willFadeIn");    
}

void CloudScene::willDraw() {
    ofLogNotice("CloudScene::willDraw");
}

void CloudScene::willFadeOut() {
    AppManager::getInstance().getGuiManager().savePresetsValues(getName());
    ofLogNotice("CloudScene::willFadeOut");
}

void CloudScene::willExit() {
     ofLogNotice("CloudScene::willExit");
}

