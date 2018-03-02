/*
 *  ImageScene.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */



#pragma once

#include "ofxScene.h"

class ImageScene : public ofxScene {
    
public:
    
    //! Constructor
    ImageScene(std::string name);
    
    //! Destructor
    ~ImageScene();
    
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
    
    void setupImage();
    
    void updateFbo();
    
    void drawImage();
    
private:
    
    ofPtr<ofTexture> m_texture;
    ofFbo      m_fbo;
    
};




