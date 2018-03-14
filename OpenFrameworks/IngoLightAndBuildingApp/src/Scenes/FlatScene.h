/*
 *  FlatScene.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 13/03/18.
 *
 */



#pragma once

#include "ofxScene.h"
#include "ImageVisual.h"

class FlatScene : public ofxScene {
    
public:
    
    //! Constructor
    FlatScene(std::string name);
    
    //! Destructor
    ~FlatScene();
    
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
    
    void resetImage();
    
    void updateFbo();
    
    void updateImages();
    
    void drawImages();
    
    void resetIndexList();
    
    const ofColor& getRandomColor();
    
    void startAnimation();
    
private:
    
    ofPtr<ImageVisual>  m_image;
    //ofPtr<ofTexture> m_texture;
    ofFbo       m_fbo;
    double      m_elapsedTime;
    vector<int> m_indexList;
};




