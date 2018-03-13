/*
 *  GuiManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#pragma once

#include "Manager.h"
#include "ofxDatGui.h"

//========================== class GuiManager ==============================
//============================================================================
/** \class GuiManager GuiManager.h
 *	\brief Class managing the application´s grapical user interface (GUI)
 *	\details It creates the gui and the callback functions that will be affected
 *    by the gui
 */

class GuiManager: public Manager
{
    static const string GUI_SETTINGS_FILE_NAME;
    static const string GUI_SETTINGS_NAME;
    static const string PRESETS_PREFIX;
    static const int GUI_WIDTH;
    
public:

    //! Constructor
    GuiManager();

    //! Destructor
    ~GuiManager();

    //! Set-up the gui
    void setup();
    
    //! Update the gui
    void update();
    
    //! Draw the gui
    void draw();
    
    void saveGuiValues();
    
    void loadGuiValues();
    
    void toggleGui();
    
    void showGui(bool show){m_showGui=show;}
    
    int getWidth() {return GUI_WIDTH;}
    
    int getHeight() {return m_gui.getHeight();}
    
    ofPoint  getPosition() {return m_gui.getPosition();}
    
    void setSceneTransitionTime(float value) {m_sceneTransitionTime = value;}
    
    void onSceneChange(const string& sceneName);
    
    void onSceneChange(int sceneIndex);
    
    void onDropdownEvent(ofxDatGuiDropdownEvent e);

    void onColorPickerEvent(ofxDatGuiColorPickerEvent e);
    
    void onButtonEvent(ofxDatGuiButtonEvent e);
    
    void onToggleEvent(ofxDatGuiToggleEvent e);
    
    void onMatrixEvent(ofxDatGuiMatrixEvent e);
    
    void savePresetsValues(const string& sceneName);
    
    void loadPresetsValues(const string& sceneName);
    
    const ofColor& getColor(int index);
    
private:
    
    void setupGuiParameters();
    
    void setupGuiColors();
    
    void setupScenesGui();
    
    void setupLayoutGui();
    
    void setupParticlesGui();
    
    void setupPaletteGui();
    
    void setupGuiEvents();
    
    void drawRectangle();

    void setColor(string name, ofColor& color);
    
    void onResetColors();


private:
    

    ofxDatGui               m_gui;
    
    ofParameterGroup        m_parameters;
    ofParameterGroup        m_presets;
    
    ofParameter<float>      m_sceneTransitionTime;
    
    ofParameter<float>      m_particlesDirection;
    ofParameter<float>      m_particlesDirectionMag;
    ofParameter<float>      m_particlesSpeed;
    ofParameter<float>      m_particlesSize;
    ofParameter<float>      m_particlesFade;
    ofParameter<int>        m_particlesNum;
    ofParameter<float>      m_particlesVectSpeed;
    ofParameter<float>      m_particlesRandomness;
    ofParameter<float>      m_particlesBlur;
    
    vector<ofParameter<int> > m_colorHexVector;
    vector<ofColor >         m_colors;
    //vector<ofColor>          m_colors;
    
    bool        m_showGui;  //It defines the whether the gui should be shown or not
    
};

//==========================================================================


