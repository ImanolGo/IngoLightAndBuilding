/*
 *  SceneManager.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */


#include "ofMain.h"


#include "SceneManager.h"
#include "scenes.h"
#include "AppManager.h"

SceneManager::SceneManager(): Manager(), m_alpha(-1), m_transitionTime(1.0), m_activeScenes(true)
{
	//Intentionally left empty
}


SceneManager::~SceneManager()
{
    ofLogNotice() <<"SceneManager::Destructor";
}


void SceneManager::setup()
{
	if(m_initialized)
		return;

	Manager::setup();

    this->createScenes();
    this->setupFbo();
    this->setupTimer();
    this->initializeSceneList();

    ofLogNotice() <<"SceneManager::initialized";

}


void SceneManager::createScenes()
{
    m_mySceneManager.setTransitionFade();
	//m_mySceneManager.setTransitionDissolve();
    
    ofPtr<ofxScene> scene;
    
    //Create Video Scene
    scene = ofPtr<ofxScene> (new VideoScene("TEST_VIDEO"));
    m_mySceneManager.addScene(scene);
    
    //Create Image Scene
    scene = ofPtr<ofxScene> (new ImageScene("RAINBOW"));
    m_mySceneManager.addScene(scene);
    
    //Create Impatient Scene
    scene = ofPtr<ofxScene> (new VectorFieldScene("IMPATIENT"));
    m_mySceneManager.addScene(scene);
    
    //Create Sad Scene
    scene = ofPtr<ofxScene> (new VectorFieldScene("SAD"));
    m_mySceneManager.addScene(scene);
    
    
    //Create Blank Scene
    scene = ofPtr<ofxScene> (new BlankScene());
    m_mySceneManager.addScene(scene);
    
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();

    m_mySceneManager.run(width, height);
    this->onTransitionTimeChange(m_transitionTime);
}


void SceneManager::setupFbo()
{
    float width = AppManager::getInstance().getSettingsManager().getAppWidth();
    float height = AppManager::getInstance().getSettingsManager().getAppHeight();
    
    //float width = ofGetWidth();
    //float height = ofGetHeight();

    m_fbo.allocate(width, height, GL_RGBA);
    m_fbo.begin(); ofClear(0); m_fbo.end();
}

void SceneManager::setupTimer()
{
    auto time = AppManager::getInstance().getSettingsManager().getSceneTimer();
    m_sceneTimer.setup(time*1000 );
    m_sceneTimer.start( false ) ;
    ofAddListener( m_sceneTimer.TIMER_COMPLETE , this, &SceneManager::sceneTimerCompleteHandler ) ;
    
    ofLogNotice() <<"SceneManager::setupTimer << Time = : " << time << "s";
}

void SceneManager::onChangeSceneDuration(float& value)
{
    m_sceneTimer.setup( value*1000*60 );
    m_sceneTimer.start( false ) ;
    ofLogNotice() <<"SceneManager::setupTimer << Time = : " << time << "s";
}

void SceneManager::initializeSceneList()
{
    m_sceneList.clear();
    m_sceneList = { "TEST_VIDEO", "RAINBOW"};
}


void SceneManager::update()
{
    this->updateScenes();
    this->updateFbo();
    this->updateTimer();
    //this->updateAlpha();
}

void SceneManager::updateFbo()
{
    m_fbo.begin();
        ofClear(0);
        ofPushStyle();
        ofSetColor(255);
        ofEnableAlphaBlending();
            m_mySceneManager.draw();
        ofDisableAlphaBlending();
        ofPopStyle();
    m_fbo.end();
}

void SceneManager::updateAlpha()
{    
    if(m_alpha!=m_mySceneManager.getCurrentAlpha())
    {
        m_alpha=m_mySceneManager.getCurrentAlpha();
        //ofLogNotice() <<"SceneManager::updateAlpha << Alpha = " << m_alpha;
        
        string address = "/CoralSoul/Ableton/Fade";
        float value = m_alpha/255.0;
        
        ofxOscMessage m;
        m.setAddress(address);
        m.addFloatArg(value);
        
        AppManager::getInstance().getOscManager().sendMessage(m);
    }
}

void SceneManager::updateScenes()
{
    m_mySceneManager.update();
}

void SceneManager::updateTimer()
{
    m_sceneTimer.update();
}


void SceneManager::draw()
{
	ofEnableAlphaBlending();
    m_fbo.draw(0,0);
	ofDisableAlphaBlending();
}

void SceneManager::draw(const ofRectangle& rect)
{
    m_fbo.draw(rect.x,rect.y,rect.width,rect.height);
}


void SceneManager::changeScene(string sceneName)
{
    m_mySceneManager.changeScene(sceneName);
    m_sceneTimer.start(false,true);
    m_currentSceneName = sceneName;
}

void SceneManager::changeScene(int sceneIndex)
{
     m_mySceneManager.changeScene(sceneIndex);
     m_sceneTimer.start(false,true);
     m_currentSceneName = this->getSceneName(sceneIndex);
}


void SceneManager::onTransitionTimeChange(float& value)
{
   m_mySceneManager.setSceneDuration(value,value);
   m_sceneTimer.start(false,true);
}

string SceneManager::getSceneName(int sceneIndex)
{
    string name = "";
    if(sceneIndex < 0 || sceneIndex >= m_mySceneManager.scenes.size()){
        return name;
    }
    
    return m_mySceneManager.scenes[sceneIndex]->getName();
   
}

int SceneManager::getIndex(const string& sceneName)
{
    
    for(int i = 0; i< m_mySceneManager.scenes.size(); i++){
        if(m_mySceneManager.scenes[i]->getName() == sceneName){
            return i;
        }
    }
    
    return -1;
}

void SceneManager::sceneTimerCompleteHandler( int &args )
{
    this->nextScene();
}


void SceneManager::nextScene()
{
    m_sceneTimer.start(false);
    
    if(m_sceneList.empty()){
        this->initializeSceneList();
    }
    
    string sceneName = m_sceneList.back();  m_sceneList.pop_back();
    AppManager::getInstance().getGuiManager().onSceneChange(sceneName);
    
    ofLogNotice() <<"SceneManager::nextScene << Change Scene: " << sceneName;
}

void SceneManager::stopScenes()
{
    m_sceneTimer.stop();
    ofLogNotice() <<"SceneManager::nextScene << Stop Scenes!";
}

void SceneManager::toggleActiveScenes()
{
    this->setActiveScenes(!m_activeScenes);
}

void SceneManager::setActiveScenes(bool value)
{
    m_activeScenes = value;
    
    ofLogNotice() <<"SceneManager::setActiveScenes: " << value;
    if(m_activeScenes){
        this->nextScene();
        AppManager::getInstance().getGuiManager().onSceneChange(0);
        AppManager::getInstance().getInstagramManager().startFeed();
    }
    else{
        AppManager::getInstance().getGuiManager().onSceneChange("BLANK");
        AppManager::getInstance().getInstagramManager().stopFeed();
        this->stopScenes();
        
    }
}





