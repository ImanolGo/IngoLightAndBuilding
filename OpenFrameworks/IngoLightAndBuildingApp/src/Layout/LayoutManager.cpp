/*
 *  LayoutManager.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#include "ofMain.h"

#include "AppManager.h"
#include "SettingsManager.h"
#include "ViewManager.h"


#include "LayoutManager.h"


const int LayoutManager::MARGIN = 20;
const int LayoutManager::FRAME_MARGIN = 2;

const string LayoutManager::LAYOUT_FONT =  "fonts/open-sans/OpenSans-Semibold.ttf";
const string LayoutManager::LAYOUT_FONT_LIGHT =  "fonts/open-sans/OpenSans-Light.ttf";

LayoutManager::LayoutManager(): Manager()
{
	//Intentionally left empty
}


LayoutManager::~LayoutManager()
{
    ofLogNotice() <<"LayoutManager::Destructor";
}


void LayoutManager::setup()
{
	if(m_initialized)
		return;

    ofLogNotice() <<"LayoutManager::initialized";

	Manager::setup();

    this->createTextVisuals();
    this->createImageVisuals();
    
    this->setupFbo();
    this->setupSyphon();
    this->setupWindowFrames();
    //this->initializeGamma();

}

void LayoutManager::setupFbo()
{
    int margin = MARGIN;
    
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    m_fbo.allocate(width, height, GL_RGBA);
    m_fbo.begin(); ofClear(0); m_fbo.end();

}

void LayoutManager::setupSyphon()
{
    string name = AppManager::getInstance().getSettingsManager().getSyphonName();
    m_syphonServer.setName(name);
    
    ofLogNotice() <<"LayoutManager::setupSyphon << Setting up Syphon server: " << name;
}

void LayoutManager::resetWindowRects()
{
    
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height  = AppManager::getInstance().getSettingsManager().getAppHeight();
    float ratio = width/ height;
    float frame_width = ofGetWidth() - AppManager::getInstance().getGuiManager().getWidth() - 4*MARGIN;
    
    m_windowRect.width = frame_width;
    m_windowRect.height =  m_windowRect.width / ratio;
    
    m_windowRect.x = AppManager::getInstance().getGuiManager().getWidth()  + 3*MARGIN;
    m_windowRect.y = ofGetHeight()*0.5 - m_windowRect.height/2;
    
}


void LayoutManager::setupWindowFrames()
{
    this->resetWindowRects();
    this->resetWindowFrames();
    
    float width = ofGetScreenWidth();
    float height = ofGetScreenHeight()/80;
    
    
    ofColor color = AppManager::getInstance().getSettingsManager().getColor("FrameRectangle");
    m_windowFrame.setColor(color);
}

void LayoutManager::resetWindowFrames()
{
    m_windowFrame.setPosition(ofPoint( m_windowRect.x - FRAME_MARGIN, m_windowRect.y - FRAME_MARGIN, 0));
    m_windowFrame.setWidth(m_windowRect.width + 2*FRAME_MARGIN); m_windowFrame.setHeight(m_windowRect.height + 2*FRAME_MARGIN);
}

void LayoutManager::update()
{
    this->updateFbos();
    this->updateSyphon();
}

void LayoutManager::updateFbos()
{
    this->updateOutputFbo();
}

void LayoutManager::updateSyphon()
{
    m_syphonServer.publishTexture(&m_fbo.getTexture());
}

void LayoutManager::updateOutputFbo()
{
    ofEnableAlphaBlending();
    m_fbo.begin();
    ofClear(0, 0, 0);
        AppManager::getInstance().getSceneManager().draw();
    
    m_fbo.end();
    ofDisableAlphaBlending();
}

void LayoutManager::createTextVisuals()
{
    float size = 20;
    float w = size*50;
    float h = size;
    float x =  m_windowRect.x + m_windowRect.getWidth()*0.5;
    float y =  m_windowRect.y - h - 2*MARGIN;
    ofPoint pos = ofPoint(x, y);
    string text = "Output";
    string fontName = LAYOUT_FONT_LIGHT;
    
    auto textVisual = ofPtr<TextVisual>(new TextVisual(pos,w,h,true));
    textVisual->setText(text, fontName, size, ofColor::white);
    m_textVisuals[text] = textVisual;
}

void LayoutManager::resetWindowTitles()
{
    float x =  m_windowRect.x + m_windowRect.getWidth()*0.5;
    float y =  m_windowRect.y -  m_textVisuals["Output"]->getHeight()*0.5 + MARGIN;
    ofPoint pos = ofPoint(x, y);
    m_textVisuals["Output"]->setPosition(pos);
}

void LayoutManager::createImageVisuals()
{
    //this->createBackground();
}

void LayoutManager::onFullScreenChange(bool value)
{
    if(value){
        ofSetWindowShape(ofGetScreenWidth(),ofGetScreenHeight());
    }
    else{
        
        float width = 4*MARGIN + 2*AppManager::getInstance().getGuiManager().getWidth();
        float height = AppManager::getInstance().getGuiManager().getHeight() + 2*MARGIN;
        ofSetWindowShape(width,height);
    }
}

void LayoutManager::draw()
{
    if(!m_initialized)
        return;
    
    this->drawOutput();
}

void LayoutManager::drawOutput()
{
    m_windowFrame.draw();
    m_fbo.draw(m_windowRect.x,m_windowRect.y,m_windowRect.width,m_windowRect.height);
}

void LayoutManager::windowResized(int w, int h)
{
    if(!m_initialized){
        return;
    }
    
    this->resetWindowRects();
    this->resetWindowFrames();
    this->resetWindowTitles();
}

void LayoutManager::setFullScreen()
{
    ofSetWindowPosition(0,0);
    ofSetWindowShape(ofGetScreenWidth(),ofGetScreenHeight());
}



