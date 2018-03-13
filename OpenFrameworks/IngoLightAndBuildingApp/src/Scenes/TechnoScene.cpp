/*
 *  TechnoScene.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 12/03/18.
 *
 */



#include "TechnoScene.h"
#include "AppManager.h"

TechnoScene::TechnoScene(std::string name): ofxScene(name), m_elapsedTime(0.0),m_skipFrames(0)
{
    //Intentionally left empty
}

TechnoScene::~TechnoScene()
{
    //Intentionally left empty
}


void TechnoScene::setup() {
    ofLogNotice(getName() + "::setup");
    this->setupImages();
    this->setupFbo();
}

void TechnoScene::setupImages()
{
    for(int i=0; i<800; i++){
        auto image =  ofPtr<ImageVisual>(new ImageVisual(ofVec3f(0),"Dot",true));
        m_images.push_back(image);
    }
    
    
    //m_texture = AppManager::getInstance().getResourceManager().getTexture(Dot);
}

void TechnoScene::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_fbo.allocate(width, height);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}

void TechnoScene::update()
{
    this->updateFbo();
    this->updateImages();
}

void TechnoScene::updateFbo()
{
    float fClearOpacity =  10.0;
    float framesToDie = 255/fClearOpacity;
    float dt = ofGetLastFrameTime();
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    //float fadeTime = 2.0;
    int numSkipFrames = parameters.fadeTime/(framesToDie*dt);
    m_skipFrames++;

    
    m_fbo.begin();
    
        if(m_skipFrames>=numSkipFrames){
            glEnable(GL_BLEND);
            glBlendFunc(GL_ONE, GL_ONE);
            glBlendEquation(GL_FUNC_REVERSE_SUBTRACT);
            
            //auto color = AppManager::getInstance().getGuiManager().getColor(0);
            
            // ofSetColor(color.r, color.g, color.b, (int)fClearOpacity);
            ofSetColor(0, (int)fClearOpacity);
            ofFill();
            ofDrawRectangle(0,0, m_fbo.getWidth(), m_fbo.getHeight());
            
            m_skipFrames = 0;
        }
    
    
        glDisable(GL_BLEND);
        glBlendEquation(GL_FUNC_ADD);
        glBlendFunc(GL_SRC_COLOR, GL_DST_COLOR);
    
        ofSetColor(255);
        this->drawImages();
    m_fbo.end();
}

void TechnoScene::updateImages()
{
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    
    m_elapsedTime+=ofGetLastFrameTime();
    bool setRandomPos = false;
    if(m_elapsedTime>parameters.speed){
        m_elapsedTime =0;
        setRandomPos = true;
    }
    
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    
    for(auto image: m_images){
        image->setWidth(parameters.size,true);
        if(setRandomPos){
            image->setPosition(ofPoint(ofRandom(width), ofRandom(height)));
        }
    }
    
}


void TechnoScene::draw()
{
    auto color = AppManager::getInstance().getGuiManager().getColor(0);
    ofEnableAlphaBlending();
    ofClear(color);
    
    m_fbo.draw(0,0);
}

void TechnoScene::drawImages()
{
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    int num = MIN(parameters.num,m_images.size());
 
    ofEnableAlphaBlending();
    for(int i=0; i< num; i++){
        m_images[i]->draw();
    }
    
}


void TechnoScene::setColors()
{

    for(auto image: m_images){
        int index = floor(ofRandom(1,5));
        //int index = 1;
        auto color = AppManager::getInstance().getGuiManager().getColor(index);
        image->setColor(color);
    }
}


void TechnoScene::willFadeIn() {
    AppManager::getInstance().getGuiManager().loadPresetsValues(getName());
    this->setColors();
    ofLogNotice("TechnoScene::willFadeIn");
    
}

void TechnoScene::willDraw() {
    ofLogNotice("TechnoScene::willDraw");
}

void TechnoScene::willFadeOut() {
    ofLogNotice("TechnoScene::willFadeOut");
    AppManager::getInstance().getGuiManager().savePresetsValues(getName());
}

void TechnoScene::willExit() {
    ofLogNotice("TechnoScene::willFadeOut");
}

