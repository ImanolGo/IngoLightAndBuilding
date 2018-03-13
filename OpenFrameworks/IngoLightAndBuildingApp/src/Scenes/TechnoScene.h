/*
 *  TechnoScene.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 12/03/18.
 *
 */



#pragma once

#include "ofxScene.h"
#include "ImageVisual.h"

class TechnoScene : public ofxScene {
    
public:
    
    //! Constructor
    TechnoScene(std::string name);
    
    //! Destructor
    ~TechnoScene();
    
    //! Set up the scene
    void setup();
    
    //! Update the scene
    void update();
    
    //! Draw the scene
    void draw();
    
    //! Called when fading in
    void willFadeIn();
    
    //! Called when to start drawing
    void willDraw();
    
    //! Called fading out
    void willFadeOut();
    
    //! Called when exit
    void willExit();
    
private:
    
    void setupFbo();
    
    void setupImages();
    
    void updateFbo();
    
    void updateImages();
    
    void drawImages();
    
    void setColors();
    
private:
    
    vector< ofPtr<ImageVisual>> m_images;
    //ofPtr<ofTexture> m_texture;
    ofFbo      m_fbo;
    float      m_elapsedTime;
    int         m_skipFrames;
    
};




