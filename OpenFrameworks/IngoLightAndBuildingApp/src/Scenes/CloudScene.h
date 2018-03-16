/*
 *  CloudScene.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 13/03/18.
 *
 */


#pragma once

#include "ofxScene.h"

class CloudScene : public ofxScene {
    
public:
    
    //! Constructor
    CloudScene(std::string name);
    
    //! Destructor
    ~CloudScene();
    
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
    
    void setupCloudShader();
    
    void drawClouds();
    
private:
    
    ofColor         m_color;
    ofFbo           m_fbo;
    ofShader        m_cloudsShader;

};




