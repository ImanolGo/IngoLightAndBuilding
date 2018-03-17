/*
 *  FlatScene.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 13/03/18.
 *
 */



#include "FlatScene.h"
#include "AppManager.h"

FlatScene::FlatScene(std::string name): ofxScene(name), m_elapsedTime(0.0)
{
    //Intentionally left empty
}

FlatScene::~FlatScene()
{
    //Intentionally left empty
}


void FlatScene::setup() {
    ofLogNotice(getName() + "::setup");
    this->setupImage();
    this->setupFbo();
    this->resetIndexList();
}

void FlatScene::setupImage()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_image = ofPtr<ImageVisual> (new ImageVisual());
    m_image->setCentred(true);
    m_image->setPosition(ofPoint(width*0.5, height*0.5));
    this->resetImage();
}
void FlatScene::resetImage()
{
    if(ofRandomuf()>0.5){
        m_image->setResource("Square");
    }
    else{
         m_image->setResource("Dot");
    }
   
  
    auto& color = this->getRandomColor();
     m_image->setColor(color);
    
    //m_texture = AppManager::getInstance().getResourceManager().getTexture(Dot);
}


const ofColor& FlatScene::getRandomColor()
{
    if(m_indexList.empty()){
        this->resetIndexList();
    }
    
    int randomNum = (int) ofRandom(0,m_indexList.size());
    int index =  m_indexList[randomNum];
    m_indexList.erase(m_indexList.begin() + randomNum);
    
    return AppManager::getInstance().getGuiManager().getColor(index);
}

void FlatScene::startAnimation()
{
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    
    EffectSettings settings;
    settings.function = LINEAR; settings.type = EASE_OUT;
    settings.startAnimation = 0; settings.animationTime = parameters.speed*5;
    
    AppManager::getInstance().getVisualEffectsManager().removeAllVisualEffects(m_image);
    AppManager::getInstance().getVisualEffectsManager().createScaleEffect(m_image, ofVec2f(0,0),ofVec2f(5,5), settings );
}

void FlatScene::resetIndexList()
{
    m_indexList.clear();
    for(int i=0; i<5; i++){
        m_indexList.push_back(i);
    }
}

void FlatScene::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_fbo.allocate(width, height);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}

void FlatScene::update()
{
    this->updateFbo();
    this->updateImages();
}

void FlatScene::updateFbo()
{
    m_fbo.begin();
    ofEnableAlphaBlending();
        this->drawImages();
    m_fbo.end();
}

void FlatScene::updateImages()
{
    auto parameters = AppManager::getInstance().getParticlesManager().getParameters();
    
    m_elapsedTime+=ofGetLastFrameTime();
    if(m_elapsedTime>=parameters.speed*5){
        this->resetImage();
        this->startAnimation();
        m_elapsedTime = 0.0;
    }
    
}


void FlatScene::draw()
{
    ofClear(0);
    m_fbo.draw(0,0);
}

void FlatScene::drawImages()
{
    m_image->draw();
}

void FlatScene::willFadeIn() {
    AppManager::getInstance().getGuiManager().loadPresetsValues(getName());
    this->resetImage();
    this->startAnimation();
    ofLogNotice("FlatScene::willFadeIn");
    
}

void FlatScene::willDraw() {
    ofLogNotice("FlatScene::willDraw");
}

void FlatScene::willFadeOut() {
    ofLogNotice("FlatScene::willFadeOut");
    //AppManager::getInstance().getGuiManager().savePresetsValues(getName());
}

void FlatScene::willExit() {
    ofLogNotice("FlatScene::willFadeOut");
}

