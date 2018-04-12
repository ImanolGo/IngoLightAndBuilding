/*
 *  LayoutManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#pragma once

#include "Manager.h"
#include "TextVisual.h"
#include "ImageVisual.h"
#include "RectangleVisual.h"
#include "ofxSyphon.h"

//========================== class LayoutManager ==============================
//============================================================================
/** \class LayoutManager LayoutManager.h
 *	\brief Class managing the layout of the application
 *	\details It creates an places al the text and elements regarding the layout
 */

class LayoutManager: public Manager
{
public:
    
    static const int MARGIN;
    static const int FRAME_MARGIN;
    static const string LAYOUT_FONT;
    static const string LAYOUT_FONT_LIGHT;

    //! Constructor
    LayoutManager();

    //! Destructor
    ~LayoutManager();

    //! Set-up the layout
    void setup();
    
    void update();
    
    void draw();
    
    void setupFbo();
    
    void  windowResized(int w, int h);
    
    const ofRectangle& getWindowRect() {return m_windowRect;}
    
    void setFullScreen();
    
    const ofFbo& getCurrentFbo(){return m_fbo;}
    
    void onFullScreenChange(bool value);
    

private:


    //! Create the text visuals
    void createTextVisuals();

    //! Create the image visuals
    void createImageVisuals();
    
    //void initializeGamma();

    //! Set-up the syphon server
    void setupSyphon();
    
    //! updates the syphon textture to be published
    void updateSyphon();
    
    void updateFbos();
    
    void updateOutputFbo();
    
    void drawOutput();
    
    void drawText();
    
    void resetWindowRects();
    
    void resetWindowFrames();
    
    void resetWindowTitles();
    
    void setupWindowFrames();


private:


    typedef  map<string, ofPtr<TextVisual> >      TextMap;            ///< defines a map of Text attached to an identifier
    typedef  map<string, ofPtr<ImageVisual>  >    ImageMap;           ///< defines a map of ImageVisual Map attached to an identifier
  
    TextMap             m_textVisuals;             ///< map storing the text visuals attached to a name
    ImageMap            m_imageVisuals;            ///< map storing the image visuals attached to a name
    
    ofRectangle         m_windowRect;
    RectangleVisual     m_windowFrame;
    ofColor             m_color;
    
    ofxSyphonServer     m_syphonServer;

    
    ofFbo               m_fbo;
    ofFbo               m_syphonFbo;
    //vector<int>         m_gammaE;
    
};

//==========================================================================


