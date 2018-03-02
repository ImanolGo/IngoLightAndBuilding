/*
 *  NoiseManager.cpp
 *  CoralSoulApp
 *
 *  Created by Imanol Gomez on 14/11/17.
 *
 */


#include "ofMain.h"

#include "NoiseManager.h"
#include "AppManager.h"


NoiseManager::NoiseManager(): Manager(), m_noiseResolution(255)
{
	//Intentionally left empty
}


NoiseManager::~NoiseManager()
{
    ofLogNotice() <<"NoiseManager::Destructor" ;
}


void NoiseManager::setup()
{
	if(m_initialized)
		return;


	Manager::setup();
    
    this->setupFbo();
    this->setupNoise();
    
    ofLogNotice() <<"NoiseManager::initialized" ;
    
}

void NoiseManager::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    float ratio = width/height;
    
    //width/=4.0;
    height = width/ratio;
    
    m_fbo.allocate(width, height, GL_RGB);
    m_fbo.begin(); ofClear(0); m_fbo.end();
    
    //m_fboReader.setAsync(true);
}

void NoiseManager::setupNoise()
{
   m_noiseImage.allocate( m_noiseResolution, m_noiseResolution, OF_IMAGE_COLOR );
}


void NoiseManager::resetPosition()
{
    this->setupFbo();
}


void NoiseManager::update()
{
    this->updateNoise();
    this->updateFbo();
    this->updateNoise();
}


void NoiseManager::updateNoise()
{
    float time = ofGetElapsedTimef() * m_noiseSpeed;
    ofPixelsRef pixels = m_noiseImage.getPixels();
    
    int tmpIndex = 0;
    for( int y = 0; y < m_noiseImage.getHeight(); y++ )
    {
        for( int x = 0; x < m_noiseImage.getWidth(); x++ )
        {
            // We're grabbing a single reading from the noise function here, but we can also add together more
            // readings at different frequencies to make more complex patterns
            
            float tmpNoise = ofNoise( x / m_noiseFrequency,  y / m_noiseFrequency, time );
            
            
            ofColor c;
            // the range of each of the arguments here is 0..255 so we map i and j to that range.
    
            c.setHsb( m_color.getHue(), m_color.getSaturation(), m_color.getBrightness()*tmpNoise);
            
            //m_noiseColor.setSaturation(tmpNoise * 255.0f);
            pixels.setColor(x,y, c);
            //pixels.setColor(x,y,ofColor(0,0,tmpNoise * 255.0f));
            
            //pixels[tmpIndex] = tmpNoise * 255.0f;
            //tmpIndex++;
        }
    }

    m_noiseImage.update(); // uploads the new pixels to the gfx card
}

void NoiseManager::updateFbo()
{
     m_fbo.begin();
        ofClear(0);
        m_noiseImage.draw(0,0, m_fbo.getWidth(), m_fbo.getHeight());
    m_fbo.end();
}

//--------------------------------------------------------------
void NoiseManager::onNoiseResolutionChange( int& value )
{
    m_noiseImage.allocate( value, value, OF_IMAGE_COLOR );
}


void NoiseManager::draw()
{
     m_noiseImage.draw(0,0);
}

void NoiseManager::draw(int width, int height)
{
    m_noiseImage.draw(0,0, width, height);
}



