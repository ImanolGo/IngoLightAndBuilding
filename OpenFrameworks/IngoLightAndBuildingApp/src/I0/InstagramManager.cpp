/*
 *  InstagramManager.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#include "InstagramManager.h"
#include "AppManager.h"


InstagramManager::InstagramManager(): Manager(), m_isSearchingTags(true)
{
    //Intentionally left empty
}

InstagramManager::~InstagramManager()
{
   ofLogNotice() << "InstagramManager::destructor";
   ofUnregisterURLNotification(this);
}


//--------------------------------------------------------------

void InstagramManager::setup()
{
    if(m_initialized)
        return;
    
    Manager::setup();
    
    this->setupTags();
    this->setupTimers();
    
    ofRegisterURLNotification(this);
    
    ofLogNotice() <<"InstagramManager::initialized" ;
}

void InstagramManager::setupTags()
{
    m_tags = AppManager::getInstance().getSettingsManager().getTags();
    
    for(auto tag: m_tags){
        m_currentCodes[tag] = "";
    }
    
    m_isSearchingTags = true;
}

void InstagramManager::setupTimers()
{
    auto requestTime = AppManager::getInstance().getSettingsManager().getRequestTime();
    m_urlTimer.setup( requestTime );
    
    m_urlTimer.start( false ) ;
    ofAddListener( m_urlTimer.TIMER_COMPLETE , this, &InstagramManager::urlTimerCompleteHandler ) ;
}

void InstagramManager::update()
{
    this->updateTimers();
}


void InstagramManager::updateTimers()
{
    m_urlTimer.update();
}

bool InstagramManager::checkUpdate(const string& result, const string& tag)
{
   
    if ( std::find(m_tags.begin(), m_tags.end(), tag) == m_tags.end() )
    {
        return false;
    }
    
    
    string codeString = this->parseJsonCode(result);
    
    //ofLogNotice() <<"InstagramManager::parseJson -> " << tag << ", code: "<< codeString;
    
    if ( m_currentCodes.find(tag) == m_currentCodes.end() )
    {
        return false;
    }
    
   
    
    if(m_currentCodes[tag]!=codeString){
        m_currentCodes[tag]=codeString;
        
        string hashtagString = this->parseJsonTag(result);
        
         ofLogNotice() <<"InstagramManager::parseJson -> " << tag << ", code: "<< codeString;
         ofLogNotice() <<"InstagramManager::parseJson -> " << tag << ": text"<< hashtagString;
        
        return true;
//        if(this->checkAllTags(hashtagString)){
//            m_currentString = hashtagString;
//            return true;
//        }
        
    }
    
     return false;
    
    // cout << json["tag"]["media"]["nodes"][0]["caption"].asString() <<endl;
}

string InstagramManager::parseJsonTag(const string& result)
{
    m_json.clear();
    m_json.parse(result);
    return m_json["graphql"]["hashtag"]["edge_hashtag_to_media"]["edges"][0]["node"]["edge_media_to_caption"]["edges"][0]["node"]["text"].asString();
}

string InstagramManager::parseJsonCode(const string& result)
{
    m_json.clear();
    m_json.parse(result);
    return m_json["graphql"]["hashtag"]["edge_hashtag_to_media"]["edges"][0]["node"]["shortcode"].asString();
}


void InstagramManager::urlResponse(ofHttpResponse & response)
{
    //ofLogNotice() <<"InstagramManager::urlResponse -> " << response.request.name << ", " << response.status;
    
    if(m_tags.empty()){
        return;
    }

    if(response.status==200)
    {
        bool isNewTag = this->checkUpdate(response.data, response.request.name);
        if(isNewTag&&m_isSearchingTags){
            AppManager::getInstance().getGuiManager().onSceneChange(response.request.name);
            ofLogNotice() <<"InstagramManager::urlResponse -> New Tag: " << response.request.name;
        }
        
        ofLogNotice() <<"InstagramManager::urlResponse -> " << response.request.name << ", " << response.status;
        //ofLogNotice() <<"InstagramManager::urlResponse -> " << response.data;
        //m_newTag = this->checkUpdate(response.data, m_tags.front());
    }
}


void InstagramManager::urlTimerCompleteHandler( int &args )
{
    if(m_isSearchingTags){
        this->startFeed();
    }
}

void InstagramManager::startFeed()
{
    m_urlTimer.start(false);
    //  cout<<"TIMER COMPLETED"<<endl;
    
    string start = "https://www.instagram.com/explore/tags/" ;
    string end = "/?__a=1" ;
    
    for(auto tag: m_tags){
        string url = start + tag + end;
        ofLoadURLAsync(url, tag);
        //ofLogNotice() <<"InstagramManager::urlTimerCompleteHandler -> tag " << tag << ", url: "<< url;
    }
    
    //    string url = start + m_tags.front() + end;
    //    ofLoadURLAsync(url, m_tags.front());
    
    m_isSearchingTags = true;
}

void InstagramManager::stopFeed()
{
    m_urlTimer.stop();
    m_isSearchingTags = false;
}

bool InstagramManager::checkAllTags(const string& result)
{
    bool allTagsAreInResult = true;
    
    for (auto& tag : m_tags)
    {
        string hastag = '#' + tag ;
        if(!ofIsStringInString(result, hastag))
        {
            ofLogNotice() <<"InstagramManager::checkAllTags -> hashtag not found: " << hastag;
            allTagsAreInResult = false;
            return false;
        }
		else {
			ofLogNotice() << "InstagramManager::checkAllTags -> hashtag found!!!: " << hastag;
		}
    }
    
    return allTagsAreInResult;
}


