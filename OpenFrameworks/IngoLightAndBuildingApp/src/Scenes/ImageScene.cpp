/*
 *  ImageScene.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */



#include "ImageScene.h"
#include "AppManager.h"

ImageScene::ImageScene(std::string name): ofxScene(name)
{
    //Intentionally left empty
}

ImageScene::~ImageScene()
{
    //Intentionally left empty
}


void ImageScene::setup() {
    ofLogNotice(getName() + "::setup");
    this->setupImage();
    this->setupFbo();
}

void ImageScene::setupImage()
{
    m_texture = AppManager::getInstance().getResourceManager().getTexture(getName());
}

void ImageScene::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_fbo.allocate(width, height);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}

void ImageScene::update()
{
    this->updateFbo();
}

void ImageScene::updateFbo()
{
    m_fbo.begin();
        ofClear(0);
        this->drawImage();
    m_fbo.end();
}

void ImageScene::draw()
{
    ofClear(0);
	ofBackground(0);
    m_fbo.draw(0,0);
}

void ImageScene::drawImage()
{
    if(m_texture)
    {
        float width = AppManager::getInstance().getSettingsManager().getAppWidth();
        float height = AppManager::getInstance().getSettingsManager().getAppHeight();
        
        m_texture->draw(0,0,width,height);

    }
    
}

void ImageScene::willFadeIn() {
    ofLogNotice("ImageScene::willFadeIn");
    
}

void ImageScene::willDraw() {
    ofLogNotice("ImageScene::willDraw");
}

void ImageScene::willFadeOut() {
    ofLogNotice("ImageScene::willFadeOut");
}

void ImageScene::willExit() {
    ofLogNotice("ImageScene::willFadeOut");
}

