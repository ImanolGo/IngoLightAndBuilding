/*
 *  NoiseScene.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 13/03/18.
 *
 */


#include "NoiseScene.h"
#include "AppManager.h"


NoiseScene::NoiseScene(std::string name): ofxScene(name)
{
    //Intentionally left empty
}

NoiseScene::~NoiseScene()
{
    //Intentionally left empty
}


void NoiseScene::setup() {
    ofLogNotice(getName() + "::setup");
    this->setupNoiseShader();
}

void NoiseScene::setupNoiseShader()
{
    if(ofIsGLProgrammableRenderer()){
        m_noiseShader.load("shaders/shadersGL3/Noise");
    }
    else{
        m_noiseShader.load("shaders/shadersGL2/Noise");
    }
}



void NoiseScene::update()
{
    //Empty
}

void NoiseScene::draw()
{
    ofEnableAlphaBlending();
    ofClear(0);
    this->drawNoise();
    ofDisableAlphaBlending();
   
}


void NoiseScene::drawNoise()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    
    float grain =  ofMap(parameters.num,0.0,800,0.0,10.0,true);
    float speed  = ofMap(parameters.speed,0.0,5.0,0.0,1.0,true);
    auto color = AppManager::getInstance().getGuiManager().getColor(0);
    
    m_noiseShader.begin();
    m_noiseShader.setUniform3f("iColor",color.r/255.0,color.g/255.0,color.b/255.0);
    m_noiseShader.setUniform3f("iResolution", width, height, 0.0);
    m_noiseShader.setUniform1f("iTime", ofGetElapsedTimef()*speed);
    m_noiseShader.setUniform1f("inoise_grain", grain);
        ofDrawRectangle(0, 0, width, height);
    m_noiseShader.end();
}


void NoiseScene::willFadeIn() {
    AppManager::getInstance().getGuiManager().loadPresetsValues(getName());
    ofLogNotice("NoiseScene::willFadeIn");    
}

void NoiseScene::willDraw() {
    ofLogNotice("NoiseScene::willDraw");
}

void NoiseScene::willFadeOut() {
    AppManager::getInstance().getGuiManager().savePresetsValues(getName());
    ofLogNotice("NoiseScene::willFadeOut");
}

void NoiseScene::willExit() {
     ofLogNotice("NoiseScene::willExit");
}

