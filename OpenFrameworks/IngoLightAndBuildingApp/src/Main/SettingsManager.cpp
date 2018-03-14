/*
 *  SettingsManager.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */



#include "ofMain.h"

#include "SettingsManager.h"


const string SettingsManager::APPLICATION_SETTINGS_FILE_NAME = "xmls/ApplicationSettings.xml";


SettingsManager::SettingsManager(): Manager(), m_appHeight(0.0), m_appWidth(0.0), m_sceneTimer(0.0)
{
    //Intentionally left empty
}


SettingsManager::~SettingsManager()
{
    ofLogNotice() <<"SettingsManager::Destructor" ;
}


void SettingsManager::setup()
{
    if(m_initialized)
        return;
    
    ofLogNotice() <<"SettingsManager::initialized" ;
    
    Manager::setup();
    
    if(this->loadSettingsFile()){
        this->loadAllSettings();
    }
}

void SettingsManager::loadAllSettings()
{
    this->setWindowProperties();
    this->setDebugProperties();
    this->setNetworkProperties();
    this->loadSerialSettings();
    this->loadAppSettings();
    this->loadTextureSettings();
    //this->loadSvgSettings();
    this->loadVideoSettings();
    this->loadColors();
}

bool SettingsManager::loadSettingsFile()
{
    
    if(!m_xml.load(APPLICATION_SETTINGS_FILE_NAME)){
        ofLogNotice() <<"SettingsManager::loadSettingsFile-> unable to load file: " << APPLICATION_SETTINGS_FILE_NAME ;
        return false;
    }
    
    ofLogNotice() <<"SettingsManager::loadSettingsFile->  successfully loaded " << APPLICATION_SETTINGS_FILE_NAME ;
    return true;
}

void SettingsManager::setDebugProperties()
{
    
    //m_xml.setTo("//");
    
    string path = "//of_settings/debug";
    auto xml = m_xml.findFirst(path);
    if(xml) {
        typedef   std::map<string, string>   AttributesMap;
        //  AttributesMap attributes = m_xml.getAttributes();
        
        bool showCursor = xml.getAttribute("showCursor").getBoolValue();
        
        if(showCursor){
            ofShowCursor();
        }
        else{
            ofHideCursor();
        }
        
        
        
        bool setVerbose = xml.getAttribute("setVerbose").getBoolValue();
        if(setVerbose){
            ofSetLogLevel(OF_LOG_VERBOSE);
        }
        else{
            ofSetLogLevel(OF_LOG_NOTICE);
        }
        
//        bool logToFile = xml.getAttribute("logToFile").getBoolValue();
//        if(logToFile){
//            string logFileName = "logs/consoleLog_" + ofGetTimestampString() + ".txt";
//            ofLogToFile(logFileName, false);
//        }
        
        
        ofLogNotice() <<"SettingsManager::setDebugProperties->  successfully loaded the OF general settings" ;
        return;
    }
    
    ofLogNotice() <<"SettingsManager::setOFProperties->  path not found: " << path ;
}


void SettingsManager::loadSerialSettings()
{
    string path = "//of_settings/serial";
    auto xml = m_xml.findFirst(path);
    if(m_xml) {
        
        bool autoSerial = xml.getAttribute("auto").getBoolValue();
        
        if(autoSerial){
            ofLogNotice() <<"SettingsManager::loadSerialSettings->  serial will be automatically selected" ;
            m_serialPort = -1;
        }
        else{
            m_serialPort = xml.getAttribute("serialPort").getIntValue();
            ofLogNotice() <<"SettingsManager::loadSerialSettings->  serial port = " << m_serialPort;
        }
        
        ofLogNotice() <<"SettingsManager::loadSerialSettings->  successfully loaded the serial settings" ;
        return;
    }
    
    ofLogNotice() <<"SettingsManager::loadSerialSettings->  path not found: " << path ;
}

void SettingsManager::loadAppSettings()
{
    string path = "//of_settings/app";
    auto xml = m_xml.findFirst(path);
    if(m_xml) {
        
        m_requestTimeMs = xml.getAttribute("request_time_ms").getIntValue();
        
        m_sceneTimer = xml.getAttribute("sceneTimer").getFloatValue();
        
        ofLogNotice() <<"SettingsManager::loadAppSettings->  request time = " << m_requestTimeMs << "ms" << ", scene time = " << m_sceneTimer << "s";
        ofLogNotice() <<"SettingsManager::loadAppSettings->  successfully loaded the app settings" ;
        return;
    }
    
    ofLogNotice() <<"SettingsManager::loadAppSettings->  path not found: " << path ;
}


void SettingsManager::setWindowProperties()
{
    // m_xml.setTo("//");
    
    string path = "//of_settings/window";
    auto xml = m_xml.findFirst(path);
    if(xml)
    {
        //m_xml.setTo(windowPath);
        // typedef   std::map<string, string>   AttributesMap;
        // AttributesMap attributes = m_xml.getAttributes();
        string title = xml.getAttribute("title").getValue();
        m_appWidth = xml.getAttribute("width").getIntValue();
        m_appHeight = xml.getAttribute("height").getIntValue();
        
        
        int x = xml.getAttribute("x").getIntValue();
        int y = xml.getAttribute("y").getIntValue();
        bool fullscreen = xml.getAttribute("fullscreen").getBoolValue();
        
        ofSetFullscreen(fullscreen);
        ofSetWindowShape(ofGetScreenWidth(),ofGetScreenHeight());
        if(!fullscreen){
            ofSetWindowPosition(x,y);
        }
        ofSetWindowTitle(title);
        
        ofLogNotice() <<"SettingsManager::setWindowProperties->  successfully loaded the window settings" ;
        ofLogNotice() <<"SettingsManager::setWindowProperties->  title = "<< title<<", width = " << m_appWidth <<", height = "
        <<m_appHeight <<", x = "<<x<<", y = "<<y;
        return;
    }
    
    ofLogNotice() <<"SettingsManager::setWindowProperties->  path not found: " << path ;
}

void SettingsManager::setNetworkProperties()
{
    string path = "//of_settings/network";
    auto xml = m_xml.findFirst(path);
    if(xml) {
        
        m_portOscReceive  =  xml.getAttribute("portOscReceive").getIntValue();
        m_portOscSend  = xml.getAttribute("portOscSend").getIntValue();
        m_ipAddress  =  xml.getAttribute("ipAddress").getValue();
        m_syphonName = xml.getAttribute("syphon").getValue();
        
        ofLogNotice() <<"SettingsManager::setNetworkProperties->  successfully loaded the network settings" ;
        return;
    }
    
    ofLogNotice() <<"SettingsManager::setNetworkProperties->  path not found: " << path ;
}
void SettingsManager::loadColors()
{
    string path = "//colors/color";
    auto colorsXml = m_xml.find(path);
    if(!colorsXml.empty()) {
        
        for(auto & colorXml: colorsXml)
        {
            int r = colorXml.getAttribute("r").getIntValue();
            int g = colorXml.getAttribute("g").getIntValue();
            int b = colorXml.getAttribute("b").getIntValue();
            int a = colorXml.getAttribute("a").getIntValue();
            string name =  colorXml.getAttribute("name").getValue();;
            
            auto color = ofPtr<ofColor> (new ofColor(r,g,b,a));
            m_colors[name] = color;
            
            ofLogNotice() <<"SettingsManager::loadColors->  color = " << name <<", r = " << r
            <<", g = "<< g << ", b = " << b << ", a = " << a ;
        }
        
        
        ofLogNotice() <<"SettingsManager::loadColors->  successfully loaded the applications colors" ;
        return;
    }
    
    ofLogNotice() <<"SettingsManager::loadColors->  path not found: " << path ;
}



void SettingsManager::loadTextureSettings()
{
    string path = "//textures/texture";
    auto texturesXml = m_xml.find(path);
    if(!texturesXml.empty()) {
        
        for(auto & textureXml: texturesXml)
        {
            string path =  textureXml.getAttribute("path").getValue();
            string name =  textureXml.getAttribute("name").getValue();
            
            m_texturesPath[name] = path;
            
            
            ofLogNotice() <<"SettingsManager::loadTextureSettings->  texture = " << name
            <<", path = "<< path;
        }
        
        
        ofLogNotice() <<"SettingsManager::loadTextureSettings->  successfully loaded the resource settings" ;
        return;
    }
    
    
    ofLogNotice() <<"SettingsManager::loadTextureSettings->  path not found: " << path ;
}


ofColor SettingsManager::getColor(const string& colorName)
{
    ofColor color;
    if(m_colors.find(colorName)!= m_colors.end()){
        color.setHex(m_colors[colorName]->getHex());
    }
    
    return color;
}


void SettingsManager::loadVideoSettings()
{
    string path = "//videos/video";
    auto videosXml = m_xml.find(path);
    if(!videosXml.empty()) {
        
        for(auto & videoXml: videosXml)
        {
            string path =  videoXml.getAttribute("path").getValue();
            string name =  videoXml.getAttribute("name").getValue();
            
            m_videoResourcesPath[name] = path;
            
            
            ofLogNotice() <<"SettingsManager::loadVideoSettings->  video = " << name
            <<", path = "<< path;
        }
        
        
        ofLogNotice() <<"SettingsManager::loadVideoSettings->  successfully loaded the video settings" ;
        return;
    }
    
    ofLogNotice() <<"SettingsManager::loadVideoSettings->  path not found: " << path ;
}






