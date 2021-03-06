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
    m_triggerTags.push_back("ingomaurer");
    //m_triggerTags.push_back("emotions");
    m_emotionTags = {"ecstatic", "techno­stressed", "melancholy", "calm", "sad", "lonely", "impatient", "loved", "cheerful", "curious"};
    
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
   
    if ( std::find(m_triggerTags.begin(), m_triggerTags.end(), tag) == m_triggerTags.end() )
    {
        return false;
    }
    
    
    string codeString = this->parseJsonCode(result);
    
    //ofLogNotice() <<"InstagramManager::parseJson -> " << tag << ", code: "<< codeString;
    
    if(m_currentCode!=codeString){
        m_currentCode=codeString;
        
        string hashtagString = this->parseJsonTag(result);
        ofLogNotice() <<"InstagramManager::parseJson -> " << tag << ": "<< m_currentCode;
        ofLogNotice() <<"InstagramManager::result -> " << hashtagString;
        if(this->checkEmotionTags(hashtagString)){
            m_currentString = hashtagString;
            return true;
        }
        
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
    
    if(m_triggerTags.empty()){
        return;
    }

    if(response.status==200)
    {
        bool isNewTag = this->checkUpdate(response.data, response.request.name);
        if(isNewTag&&m_isSearchingTags){
            
            AppManager::getInstance().getGuiManager().onSceneChange(ofToUpper(m_currentEmotion));
            //ofLogNotice() <<"InstagramManager::urlResponse -> New Tag: " << response.request.name;
            ofLogNotice() << ofGetTimestampString() <<": InstagramManager::tag found!!!!!-> " << response.request.name;
            this->logToFile();
            
        }
        
        //ofLogNotice() <<"InstagramManager::urlResponse -> " << response.request.name << ", " << response.status;
        //ofLogNotice() <<"InstagramManager::urlResponse -> " << response.data;
        //m_newTag = this->checkUpdate(response.data, m_tags.front());
    }
}

void InstagramManager::logToFile()
{
    string logFileName = "logs/consoleLog_" + ofGetTimestampString("%Y-%m-%d") + ".txt";
    ofLogToFile(logFileName, true);
    ofLogNotice() << ofGetTimestampString() <<": Tag found. Emotion -> " << m_currentEmotion;
    ofLogNotice() << ofGetTimestampString() <<": Text -> " << m_currentString;
    ofLogToConsole();
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
    
    if(m_triggerTags.empty()){
        return;
    }
    
    string url = start + m_triggerTags.front() + end;
    ofLoadURLAsync(url, m_triggerTags.front());
    
    m_isSearchingTags = true;
}

void InstagramManager::stopFeed()
{
    m_urlTimer.stop();
    m_isSearchingTags = false;
}

bool InstagramManager::checkEmotionTags(const string& result)
{
    for(auto& tag: m_emotionTags){
        string hastag = '#' + tag + " ";
        if(ofIsStringInString(result, hastag))
        {
            m_currentEmotion = tag;
            ofLogNotice() << "InstagramManager::checkEmotionTags -> emotion hashtag found:  " << hastag;;
            return true;
        }
        
    }
    
    return false;
}


