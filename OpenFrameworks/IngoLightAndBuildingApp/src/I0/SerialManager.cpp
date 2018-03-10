/*
 *  SerialManager.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#include "SerialManager.h"
#include "AppManager.h"

const int SerialManager::BAUD_RATE = 115200;


SerialManager::SerialManager(): Manager(), m_connected(false)
{
    //Intentionally left empty
}

SerialManager::~SerialManager()
{
   ofLogNotice() << "SerialManager::destructor";
}


//--------------------------------------------------------------

void SerialManager::setup()
{
    if(m_initialized)
        return;
    
    Manager::setup();
    
    this->setupSerial();
    ofLogNotice() <<"SerialManager::initialized" ;
}



void SerialManager::setupSerial()
{
    int serialPort = AppManager::getInstance().getSettingsManager().getSerialPort();
    if(serialPort<0){
        ofLogNotice() <<"SerialManager::setupSerial << Autoconnecting serial port";
        this->autoConnect();
    }
    else{
        ofLogNotice() <<"SerialManager::setupSerial << Connecting serial to port " << serialPort;
        this->connect(serialPort);
    }
}
      
void SerialManager::connect(int portNum)
{
    if(m_serial.setup(portNum, BAUD_RATE)) //open a device number
    {
       ofLogNotice() <<"SerialManager::connect << Arduino connected to " << portNum;
       m_connected = true;

    }
}

void SerialManager::autoConnect()
{
    m_serial.listDevices();
    vector <ofSerialDeviceInfo> deviceList = m_serial.getDeviceList();
    
    // this should be set to whatever com port your serial device is connected to.
    // (ie, COM4 on a pc, /dev/tty.... on linux, /dev/tty... on a mac)
    // arduino users check in arduino app....

     m_connected = false;
    
    for(auto device: deviceList)
    {
        if(this->checkConnection(device.getDeviceID())) //open a device number
        {
            ofLogNotice() <<"SerialManager::setupSerial << Arduino connected to port " << device.getDeviceName();
            m_connected = true;
            return;
        }
    }
    
    
    
//    if(!m_serial.setup(0, BAUD_RATE)) //open a device number)
//    {
//        ofLogNotice() <<"SerialManager::initialized << Could not cpnnect to serial " << deviceList[0].getDeviceName();
//    }
//    
}

bool SerialManager::checkConnection(int portNum)
{
    if(m_serial.setup(portNum, BAUD_RATE)) //open a device number
    {
        this->sendPin();
        ofSleepMillis(100);
        if(this->receivedOk()){
            ofLogNotice() <<"SerialManager::checkConnection << Arduino connected to " << portNum;
            return true;
        }
		else {
			m_serial.close();
		}
    }
    
    ofLogNotice() <<"SerialManager::checkConnection << Arduino is not connected ";
    //m_serial.setup(0, BAUD_RATE);
    return false;
    
}

void SerialManager::sendPin()
{
    unsigned char byte = '?';
    ofLogNotice() <<"SerialManager::sendPin << Sent '?'";
    m_serial.writeByte(byte);
}

bool SerialManager::receivedOk()
{
    ofLogNotice() <<"SerialManager::checkConnection << Serial Available: " << m_serial.available();

    
    if ( m_serial.available() == 0 )
    {
        return false;
    }
    
    /// // we want to read 2 bytes
    int bytesRequired = 4;
    unsigned char bytes[4];
    int bytesRemaining = bytesRequired;
    // loop until we've read everything
    while ( bytesRemaining > 0 ){
        // check for data
        if ( m_serial.available() > 0 ){
            // try to read - note offset into the bytes[] array, this is so
            // that we don't overwrite the bytes we already have
            int bytesArrayOffset = bytesRequired - bytesRemaining;
            int result = m_serial.readBytes( &bytes[bytesArrayOffset], bytesRemaining );
            
                // check for error code
                if ( result == OF_SERIAL_ERROR ){
                    // something bad happened
                    ofLog( OF_LOG_ERROR, "unrecoverable error reading from serial" );
                    break;
                }
                else if ( result == OF_SERIAL_NO_DATA ){
                    // nothing was read, try again
                }
                else {
                    // we read some data!
                    bytesRemaining -= result;
                }
            }
    }
    
    if(bytes[0] == 'O' && bytes[1] == 'K'){
        ofLogNotice() <<"SerialManager::receivedOk << Arduino sent OK ";
        return true;
    }
    
    return false;
}

void SerialManager::update()
{
    this->readCommands();
}

void SerialManager::readCommands()
{
    if ( m_serial.available() == 0 )
    {
        return;
    }
    
    /// // we want to read 3 bytes
    int bytesRequired = 3;
    unsigned char bytes[3];
    int bytesRemaining = bytesRequired;
    // loop until we've read everything
    while ( bytesRemaining > 0 ){
        // check for data
        if ( m_serial.available() > 0 ){
            // try to read - note offset into the bytes[] array, this is so
            // that we don't overwrite the bytes we already have
            int bytesArrayOffset = bytesRequired - bytesRemaining;
            int result = m_serial.readBytes( &bytes[bytesArrayOffset], bytesRemaining );
            
            // check for error code
            if ( result == OF_SERIAL_ERROR ){
                // something bad happened
                ofLog( OF_LOG_ERROR, "unrecoverable error reading from serial" );
                break;
            }
            else if ( result == OF_SERIAL_NO_DATA ){
                // nothing was read, try again
            }
            else {
                // we read some data!
                bytesRemaining -= result;
            }
        }
    }
    
    ofLogNotice() <<"SerialManager::readCommands << Arduino sent  " << bytes[0];
    
    AppManager::getInstance().getGuiManager().onSceneChange((int)bytes[0]-48);
    
}



