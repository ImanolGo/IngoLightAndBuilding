/*
 *  SettingsManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */


#pragma once

#include "Manager.h"


//========================== class SettingsManager ==============================
//============================================================================
/** \class SettingsManager SettingsManager.h
 *    \brief Class managing the whole settings of the application
 *    \details it reads from an xml settings file and provides access to the information
 */

typedef             map<string,string>               ResourcesPathMap;       ///< defines a map of path attached to the resources name
typedef             vector< string >                 ResourcesVector;             ///< Defines a vector of resource names

class SettingsManager: public Manager
{
    
public:
    
    static const string APPLICATION_SETTINGS_FILE_NAME;
    
    //! Destructor
    ~SettingsManager();
    
    //! Constructor
    SettingsManager();
    
    //! Compares two transition objects
    void setup();
    
    const ResourcesPathMap& getTextureResourcesPath() const {return m_texturesPath;}
    
    const ResourcesPathMap& getSvgResourcesPath() const {return m_svgResourcesPath;}
    
    const ResourcesPathMap& getVideoResourcesPath() const {return m_videoResourcesPath;}
    
    ofColor getColor(const string& colorName);
    
    float getAppWidth() const {return m_appWidth;}
    
    float getAppHeight() const {return m_appHeight;}
    
    string getIpAddress() const {return m_ipAddress;}
    
    int getOscPortSend() const {return m_portOscSend;}
    
    int getOscPortReceive() const {return m_portOscReceive;}
    
    string getSyphonName() const {return m_syphonName;}
    
    int getSerialPort() const {return m_serialPort;}
    
    int getRequestTime() const {return m_requestTimeMs;}
    
    float getSceneTimer() const{return m_sceneTimer;}

    
private:
    
    //! Loads the settings file
    bool loadSettingsFile();
    
    //! Loads all the settings
    void loadAllSettings();
    
    //! Sets all the debug properties
    void setDebugProperties();
    
    //! Sets all the network properties
    void setNetworkProperties();
    
    //! Sets all the window properties
    void setWindowProperties();
    
    //! Loads all the app settings
    void loadAppSettings();
    
    //! Loads all the app colors
    void loadColors();
    
    //! Loads all the textures settings
    void loadTextureSettings();
    
    //! Loads all the svg images settings
    void loadSvgSettings();
    
    //! Loads all the video  settings
    void loadVideoSettings();
    
    //! Loads all the serial  settings
    void loadSerialSettings();
    
    
private:
    
    typedef             map< string, ofPtr<ofColor> >    ColorMap;               ///< Defines a map of colors attached to a name
    
    ofXml                    m_xml;          ///< instance of the xml parser
    ResourcesPathMap        m_texturesPath;         ///< stores the texture paths
    ResourcesPathMap        m_svgResourcesPath;     ///< stores the svg paths
    ResourcesPathMap        m_videoResourcesPath;   ///< stores the video paths
    ColorMap                m_colors;               ///< stores all the application's colors
    float                   m_appWidth;             ///< stores the applications width
    float                   m_appHeight;            ///< stores the applications height
    int                     m_portOscSend;          ///< stores the OSC port used for the OSC Sending communications
    int                     m_portOscReceive;       ///< stores the OSC port used for the OSC Receiving communications
    string                  m_ipAddress;            ///< stores the Ip Address used for the Network communications
    string                  m_syphonName;           ///<stores the name of the syphon pipe
    
    bool                    m_autoSerial;           ///< stores whether the serial port has to be search automatically or not
    int                     m_serialPort;           ///< stores the settings serial port
    int                     m_requestTimeMs;        ///< stores the request time between checking new instagram feeds
    float                   m_sceneTimer;           ///< time between scenes
    
};
