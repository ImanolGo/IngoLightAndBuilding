/*
 *  NoiseScene.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 13/03/18.
 *
 */


#pragma once

#include "ofxScene.h"

class NoiseScene : public ofxScene {
    
public:
    
    //! Constructor
    NoiseScene(std::string name);
    
    //! Destructor
    ~NoiseScene();
    
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
    
    void setupNoiseShader();
    
    void drawNoise();
    
private:
    
    ofColor         m_color;
    ofShader        m_noiseShader;

};




