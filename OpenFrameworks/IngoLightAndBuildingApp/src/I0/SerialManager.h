/*
 *  SerialManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#pragma once

#include "ofMain.h"
#include "Manager.h"


//========================== class SerialManager =======================================
//==============================================================================
/** \class SerialManager SerialManager.h
 *	\brief class for managing Serial communication
 *	\details It connects the Teensy board to communicate color changes on the neon leds.
 */


class SerialManager: public Manager
{

    static const int BAUD_RATE;
    
public:
    //! Constructor
    SerialManager();

    //! Destructor
    virtual ~SerialManager();

    //! setups DMX
    void setup();

    void update();
    
    
private:
    
    void readSerialSettings();
    
    void setupSerial();
    
    void autoConnect();
    
    void connect(int portNum);
    
    bool checkConnection(int portNum);
    
    void sendPin();
    
    bool receivedOk();
    
    void readCommands();
    
private:
    
    ofSerial   m_serial;
    bool       m_connected;

};

