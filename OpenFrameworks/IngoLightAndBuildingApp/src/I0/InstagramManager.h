/*
 *  InstagramManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#pragma once

#include "ofMain.h"
#include "Manager.h"
#include "ofxSimpleTimer.h"
#include "ofxJSON.h"

//========================== class InstagramManager =======================================
//==============================================================================
/** \class InstagramManager InstagramManager.h
 *	\brief class for managing the Instagram feeds
 *	\details It frequently checks for certain instagram hashtags
 */


class InstagramManager: public Manager
{
public:
    //! Constructor
    InstagramManager();

    //! Destructor
    virtual ~InstagramManager();

    //! setups DMX
    void setup();

    void update();
    
    void urlResponse(ofHttpResponse & response);
    
    void urlTimerCompleteHandler( int &args ) ;
    

private:
    
    void setupTimers();
    
    void setupTags();
    
    void updateTimers();
    
    bool checkUpdate(const string& result, const string& tag);
    
    string parseJsonTag(const string& result);
    
    string parseJsonCode(const string& result);
    
    bool checkAllTags(const string& result);
    
private:
    
    
    typedef            map<string,string> TagMap; ///< Defines a map of current feeds related to a tag
    typedef            vector<string> TagVector; ///< Defines a map of current feeds related to a tag
    
    TagVector          m_tags;
    ofxSimpleTimer     m_urlTimer;
    ofxJSONElement     m_json;
    TagMap             m_currentCodes;


};

