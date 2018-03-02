/*
 *  OscManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#pragma once

#include "ofMain.h"
#include "Manager.h"
#include "ofxOsc.h"
#include "TextVisual.h"
#include "RectangleVisual.h"


//========================== class OscManager =======================================
//==============================================================================
/** \class OscManager OscManager.h
 *	\brief class for managing the OSC events
 *	\details It reads all the OSC events and create the proper application events
 */


class OscManager: public Manager
{
    
    static const string OSC_PARENT_ADDRESS; //Specifies the osc parent address

public:
    //! Constructor
    OscManager();

    //! Destructor
    virtual ~OscManager();

    //! setups the manager
    void setup();

    //! updates the manager
    void update();
    
    //! draw the manager
    void draw();
    
    // Send osc message float
    void sendFloatMessage(float value, string& name);
    
    // Send osc message string
    void sendStringMessage(string value, string& name);
    
     // Send aritrary osc message
    void sendMessage(ofxOscMessage& message);
    
    
private:
    
    void readSenderInformation();
    
    //! sets upt the osc receiver
    void setupOscReceiver();
    
    //! sets upt the osc sender
    void setupOscSender();
    
    //! gets string formatted OSC message
    string getMessageAsString(const ofxOscMessage& m) const;
    
 private:
    
     ofxOscReceiver m_oscReceiver;          ///< OSC receiver class
     ofxOscSender   m_oscSender;            ///< OSC sender class
    
      map<string, ofxOscSender>  m_oscSenders;
    
     ofPtr<TextVisual>          m_sendingInformation;
     ofPtr<TextVisual>          m_receivingInformation;
     ofPtr<RectangleVisual>     m_boundingBox;
    
};

