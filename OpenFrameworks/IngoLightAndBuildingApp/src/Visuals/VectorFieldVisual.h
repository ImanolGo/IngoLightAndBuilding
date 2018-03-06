/*
 *  VectorFieldVisual.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#pragma once

#include "ofxVectorField.h"
#include "VectorFieldParticle.h"
#include "ofxBlur.h"
#include "ofxPostProcessing.h"

#define radian2degree(a) (a * 57.295779513082)
#define degree2radian(a) (a * 0.017453292519)


//========================= class VectorFieldVisual ==========================
//============================================================================
/** \class VectorFieldVisual VectorFieldVisual.h
 *	\brief Class managing the vector field visuals
 *	\details It creates and manages all the parameters and vector field like visualizations
 */


class VectorFieldVisual
{
    static const int NUM_PARTICLES;

    
public:
    
    //! Constructor
    VectorFieldVisual();
    
    //! Destructor
    ~VectorFieldVisual();
    
    //! Setup the Vector Field Visual
    void setup();
    
    //! Update the Vector Field Visual
    void update();
    
    //! Draw the Vector Field Visual
    void draw();
    
    void addForce(const ofVec2f& force);
    
    void setSpeed(float value);
    
    void setSize(float value);
    
    void setNumber(int value);

	void resetParticles();
    
   
private:
    
    void setupVectorField();
    
    void setupFbo();
    
    void setupBlur();
    
    void setupParticles();
    
    void updateFbo();
    
    void updateVectorField();
    
    void updateParticles();
    
    void drawVectorField();
    
    void drawParticles();
    
     void drawFbo();
    
    
private:
    
    ofxVectorField                 m_vectorField;
    vector <VectorFieldParticle>   m_particles;
    
    float       m_spacing;
    float       m_speed;
    float       m_fadeTime;
    int         m_skipFrames;
    
    ofFbo       m_fbo;
    ofxBlur     m_blur;
    int         m_numParticles;
   // ofxPostProcessing m_post;
    
    
};



