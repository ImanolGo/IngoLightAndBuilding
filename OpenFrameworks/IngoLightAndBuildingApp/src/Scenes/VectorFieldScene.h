/*
 *  VectorFieldScene.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 06/03/18.
 *
 */


#pragma once


#include "ofxScene.h"
#include "VectorFieldVisual.h"

class VectorFieldScene : public ofxScene {

public:

    //! Constructor
    VectorFieldScene(string name);
    
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
    
    void setAdditiveBlend(bool value);
    
private:
    
    void setupVectorField();
    
    void setupFbo();
    
    void updateFbo();
    
    void updateVectorField();
    
    void drawVectorField();
    
    void setColors();
    
private:
    
    VectorFieldVisual       m_vectorField;
    ofFbo                   m_fbo;
    
    
    
};

