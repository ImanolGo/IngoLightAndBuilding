/*
 *  AppManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */




#pragma once

#include "ofMain.h"

#include "managers.h"

//========================== class AppManager ==============================
//============================================================================
/** \class AppManager AppManager.h
 *	\brief Class managing the whole application
 *	\details it set-ups, updates and renders all the different managers used for the application
 */

class AppManager: public Manager
{
public:

    //! Destructor
    ~AppManager();

    //! Returns the singleton instance.
    static AppManager& getInstance();

    //! Compares two transition objects
    void setup();

    //! updates the logic
    void update();

    //! calls the view manager to draw
    void draw();

    //==========================================================================

    //! Returns the settings manager
    SettingsManager& getSettingsManager() { return m_settingsManager; }
    
    //! Returns the layout manager
    LayoutManager& getLayoutManager() { return m_layoutManager; }
    
    //! Returns the resource manager
    ResourceManager& getResourceManager() { return m_resourceManager; }
    
    //! Returns the view manager
    ViewManager&  getViewManager() { return m_viewManager; }
    
    //! Returns the visual effects manager
    VisualEffectsManager&  getVisualEffectsManager() { return m_visualEffectsManager; }
    
    //! Returns the GUI manager
    GuiManager&   getGuiManager() { return m_guiManager; }
    
    //! Returns the scenes manager
    SceneManager&  getSceneManager() { return m_sceneManager; }
    
    //! Returns the instagram manager
    InstagramManager&  getInstagramManager() { return m_instagramManager; }
    
    //! Returns the noise manager
    NoiseManager&  getNoiseManager() { return m_noiseManager; }
    
    //! Returns the mask manager
    SerialManager&  getSerialManager() { return m_serialManager; }
    
    //! Returns the osc manager
    OscManager&  getOscManager() { return m_oscManager; }
    
    //! Returns the particles manager
    ParticlesManager&  getParticlesManager() { return m_particlesManager; }
    

    //==========================================================================
    
    void toggleDebugMode();
    
    void setDebugMode(bool showDebug);
    

private:

     //! Constructor
     AppManager();

	//! Stop the compiler generating methods of copy the object
	 AppManager(AppManager const& copy);              // Don't Implement

    //! Prevent operator= being generated.
     AppManager& operator=(AppManager const& copy);     // Don't implement

    //==========================================================================

    //! Set-up all the managers
    void setupManagers();

    //! Set-up openFrameworks
    void setupOF();

    //! update all the managers
    void updateManagers();

private:


    SettingsManager          m_settingsManager;         ///< Manages the application's settings
    ResourceManager          m_resourceManager;         ///< Manages the application's resources
    ViewManager              m_viewManager;             ///< Manages visuals
    VisualEffectsManager     m_visualEffectsManager;    ///< Manages visual effects
    LayoutManager            m_layoutManager;           ///< Manages the layout
    KeyboardManager          m_keyboardManager;         ///< Manages the keyboard
    GuiManager               m_guiManager;              ///< Manages the graphical user interface
    SceneManager             m_sceneManager;            ///< Manages all the scenes
    SerialManager            m_serialManager;           ///< Manages all the serial communciation
    NoiseManager             m_noiseManager;            ///< Manages the noise generator
    InstagramManager         m_instagramManager;        ///< Manages the instagram feed
    OscManager               m_oscManager;              ///< Manages all the osc communications
    ParticlesManager         m_particlesManager;        ///< Manages all the particles parameters
    
    bool                     m_debugMode;
    bool                     m_initialized;
};

//==========================================================================


