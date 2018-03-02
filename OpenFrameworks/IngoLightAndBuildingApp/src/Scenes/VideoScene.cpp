/*
 *  VideoScene.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */



#include "VideoScene.h"
#include "AppManager.h"

VideoScene::VideoScene(std::string name): ofxScene(name)
{
    //Intentionally left empty
}

VideoScene::~VideoScene()
{
    //Intentionally left empty
}


void VideoScene::setup() {
    ofLogNotice(getName() + "::setup");
    this->setupVideo();
    this->setupFbo();
}

void VideoScene::setupVideo()
{
    auto& videoPaths = AppManager::getInstance().getSettingsManager().getVideoResourcesPath();
    
    if(videoPaths.find(getName())!=videoPaths.end())
    {
        string path = videoPaths.at(getName());
        m_videoPlayer.load(path);
        m_videoPlayer.setLoopState(OF_LOOP_NORMAL);
        m_videoPlayer.play();
        
    }
    else{
        ofLogNotice() << getName() + "::setupVideo-> Cannot find " << getName();
    }
}

void VideoScene::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_fbo.allocate(width, height);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}


void VideoScene::update()
{
    this->updateVideo();
    this->updateFbo();
}

void VideoScene::updateVideo()
{
    if(m_videoPlayer.isInitialized() && m_videoPlayer.isLoaded())
    {
        m_videoPlayer.update();
    }
}

void VideoScene::updateFbo()
{
    m_fbo.begin();
    ofClear(0);
        this->drawVideo();
    m_fbo.end();
}


void VideoScene::draw()
{
    ofClear(0);
    m_fbo.draw(0,0);
}

void VideoScene::drawVideo()
{
    if(m_videoPlayer.isInitialized() && m_videoPlayer.isLoaded())
    {
        float width = AppManager::getInstance().getSettingsManager().getAppWidth();
        float height = AppManager::getInstance().getSettingsManager().getAppHeight();
        m_videoPlayer.draw(0,0,width,height);
    }
    
}

void VideoScene::willFadeIn() {
    ofLogNotice("VideoScene::willFadeIn");
    
    if(m_videoPlayer.isInitialized() && m_videoPlayer.isLoaded())
    {
        m_videoPlayer.play();
    }
}

void VideoScene::willDraw() {
    ofLogNotice("VideoScene::willDraw");
}

void VideoScene::willFadeOut() {
    ofLogNotice("VideoScene::willFadeOut");
}

void VideoScene::willExit() {
    if(m_videoPlayer.isInitialized() && m_videoPlayer.isLoaded())
    {
        m_videoPlayer.stop();
    }
    
    ofLogNotice("VideoScene::willExit");
}

