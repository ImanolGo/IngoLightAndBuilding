/*
 *  NoiseManager.h
 *  CoralSoulApp
 *
 *  Created by Imanol Gomez on 14/11/17.
 *
 */


#pragma once

#include "Manager.h"


//========================== class NoiseManager ==============================
//============================================================================
/** \class NoiseManager NoiseManager.h
 *	\brief Class managing the noise visuals
 *	\details it creates and updates noise visuals, as well it provides methods to change it in real time
 */


class NoiseManager: public Manager
{
    
    public:

        //! Constructor
        NoiseManager();

        //! Destructor
        ~NoiseManager();

        //! Setup the Noise Manager
        void setup();

        //! Update the Noise Manager
        void update();
    
        //! Draw the Noise Manager
        void draw();
    
        //! Draw the Noise Manager
        void draw(int width, int height);
    
        float getWidth()  {return m_noiseImage.getWidth();}
    
        float getHeight()  {return m_noiseImage.getHeight();}
    
        void onNoiseResolutionChange( int& value);
    
        void onNoiseFrequencyChange(float& value) {m_noiseFrequency = value;}
    
        void onNoiseSpeedChange(float& value) {m_noiseSpeed = value;}
    
        void onHueChange(float& value) {m_color.setHue(value);}
    
        void onBrightnessChange(float& value) {m_color.setBrightness(value);}
    
        void onSaturationChange(float& value) {m_color.setSaturation(value);}
    
        void resetPosition();

        const ofFbo& getFbo() {return m_fbo;}

    
    private:
    
        void setupFbo();
    
        void setupNoise();
    
        void updateNoise();
    
        void updateFbo();
    
    
    private:
  
        ofFbo       m_fbo;
    
        float       m_noiseFrequency;
        float       m_noiseSpeed;
        int         m_noiseResolution;
    
        ofColor     m_color;
        ofImage     m_noiseImage;
    
};




