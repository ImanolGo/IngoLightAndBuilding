/*
 *  GuiManager.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */

#include "ofMain.h"

#include "AppManager.h"
#include "GuiManager.h"
#include "GuiTheme.h"


const string GuiManager::GUI_SETTINGS_FILE_NAME = "xmls/GuiSettings.xml";
const string GuiManager::GUI_SETTINGS_NAME = "GUI";
const int GuiManager::GUI_WIDTH = 350;


GuiManager::GuiManager(): Manager(), m_showGui(true)
{
    //! Intentionally left empty
}

GuiManager::~GuiManager()
{
    this->saveGuiValues();
    ofLogNotice() <<"GuiManager::Destructor";
}


void GuiManager::setup()
{
	if(m_initialized)
		return;
    
    Manager::setup();

    this->setupGuiParameters();
    this->setupScenesGui();
    this->setupLayoutGui();
    this->setupParticlesGui();
    this->setupGuiEvents();
    this->loadGuiValues();
    
    ofLogNotice() <<"GuiManager::initialized";
    
}

void GuiManager::setupGuiParameters()
{
    m_gui.setPosition(ofxDatGuiAnchor::TOP_LEFT);
   // m_gui.setAssetPath(ofToDataPath("fonts/"));
    //m_gui.setAssetPath("../Resources/data/fonts/");
    m_gui.setTheme(new GuiTheme());
    

    int margin =  LayoutManager::MARGIN;
    m_gui.setAutoDraw(false);
    auto pos = m_gui.getPosition();
    m_gui.setPosition(pos.x + margin, pos.y + margin);
    m_gui.addHeader(GUI_SETTINGS_NAME, true);
    
    // add some components //
    //m_gui.addLabel("PrimaveraSound GUI");
    
    m_gui.addFRM();
    m_gui.addToggle("Fullscreen");
    auto toggle = m_gui.getToggle("Fullscreen");
    toggle->setChecked(true);
    m_gui.addButton("* Save GUI");
    
    m_gui.addBreak();
    
}



void GuiManager::setupScenesGui()
{
    auto sceneManager = &AppManager::getInstance().getSceneManager();
    vector<string> opts;
    
    for(int i = 0; i < sceneManager->getNumberScenes(); i++)
    {
        opts.push_back(sceneManager->getSceneName(i));
    }
    
    string label = "SCENES";
    
    m_gui.addDropdown(label, opts);
    auto menu = m_gui.getDropdown(label);
    //menu->expand(); //let's have it open by default
    menu->setStripeColor(ofColor::pink);
    for (int i=0; i<menu->size(); i++) menu->getChildAt(i)->setStripeColor(ofColor::pink);
    m_gui.addBreak();

}

void GuiManager::setupLayoutGui()
{
    auto layoutManager = &AppManager::getInstance().getLayoutManager();
    auto sceneManager = &AppManager::getInstance().getSceneManager();
    
    m_sceneTransitionTime.set("TransitionTime", 2.0, 0.0, 10.0);
    m_sceneTransitionTime.addListener(sceneManager, &SceneManager::onTransitionTimeChange);
    m_parameters.add(m_sceneTransitionTime);
    
    ofxDatGuiFolder* folder = m_gui.addFolder("GENERAL", ofColor::purple);
    folder->addSlider(m_sceneTransitionTime);
    folder->expand();
    m_gui.addBreak();
}

void GuiManager::setupParticlesGui()
{
    auto particlesManager = &AppManager::getInstance().getParticlesManager();
    
    m_particlesDirection.set("Direction", 0.0, 0.0, 360.0);
    m_particlesDirection.addListener(particlesManager, &ParticlesManager::setDirecction);
    m_parameters.add(m_particlesDirection);
    
    m_particlesDirectionMag.set("Dir. Mag.", 0.0, 0.0, 2.0);
    m_particlesDirectionMag.addListener(particlesManager, &ParticlesManager::setDirecctionMag);
    m_parameters.add(m_particlesDirectionMag);
    
    m_particlesSpeed.set("Speed", 0.0, 0.0, 5.0);
    m_particlesSpeed.addListener(particlesManager, &ParticlesManager::setSpeed);
    m_parameters.add(m_particlesSpeed);
    
    m_particlesSize.set("Size", 6.0, 0.0, 200.0);
    m_particlesSize.addListener(particlesManager, &ParticlesManager::setSize);
    m_parameters.add(m_particlesSize);
    
    m_particlesNum.set("Num", 800, 0, 800);
    m_particlesNum.addListener(particlesManager, &ParticlesManager::setNum);
    m_parameters.add(m_particlesNum);
    
    m_particlesFade.set("Fade", 0.0, 0.0, 60.0);
    m_particlesFade.addListener(particlesManager, &ParticlesManager::setFadeTime);
    m_parameters.add(m_particlesFade);
    
    m_particlesVectSpeed.set("Vect. Speed", 0.2, 0.0, 2.0);
    m_particlesVectSpeed.addListener(particlesManager, &ParticlesManager::setVectorSpeed);
    m_parameters.add(m_particlesVectSpeed);
    
    m_particlesRandomness.set("Randomness", 0.5, 0.0, 5.0);
    m_particlesRandomness.addListener(particlesManager, &ParticlesManager::setRandonmess);
    m_parameters.add(m_particlesRandomness);
    
    
    
    ofxDatGuiFolder* folder = m_gui.addFolder("PARTICLES", ofColor::yellow);
    folder->addSlider(m_particlesDirection);
    folder->addSlider(m_particlesDirectionMag);
    folder->addSlider(m_particlesSpeed);
    folder->addSlider(m_particlesSize);
    folder->addSlider(m_particlesNum);
    folder->addSlider(m_particlesFade);
    folder->addSlider(m_particlesVectSpeed);
    folder->addSlider(m_particlesRandomness);
    folder->expand();
    m_gui.addBreak();
}

void GuiManager::setupGuiEvents()
{
    m_gui.onDropdownEvent(this, &GuiManager::onDropdownEvent);
    m_gui.onColorPickerEvent(this, &GuiManager::onColorPickerEvent);
    m_gui.onButtonEvent(this, &GuiManager::onButtonEvent);
    m_gui.onToggleEvent(this, &GuiManager::onToggleEvent);
    m_gui.onMatrixEvent(this, &GuiManager::onMatrixEvent);
}

void GuiManager::update()
{
    m_gui.update();
}

void GuiManager::draw()
{
    if(!m_showGui)
        return;
    
    this->drawRectangle();
    
    ofEnableSmoothing();
    ofEnableAlphaBlending();
        m_gui.draw();
    ofDisableAlphaBlending();
    ofDisableSmoothing();
    
}


void GuiManager::saveGuiValues()
{
    ofXml xml;
    
    ofSerialize(xml, m_parameters);
   // xml.serialize(m_parameters);
    xml.save(GUI_SETTINGS_FILE_NAME);
}

void GuiManager::loadGuiValues()
{
    ofXml xml;
    xml.load(GUI_SETTINGS_FILE_NAME);
    ofDeserialize(xml, m_parameters);
   // xml.deserialize(m_parameters);
}


void GuiManager::toggleGui()
{
    m_showGui = !m_showGui;
}

void GuiManager::drawRectangle()
{
    int margin =  LayoutManager::MARGIN;
    ofPushStyle();
    ofSetColor(15);
    ofDrawRectangle( m_gui.getPosition().x - margin, 0, m_gui.getWidth() + 2*margin, ofGetHeight());
    ofPopStyle();
}

void GuiManager::onDropdownEvent(ofxDatGuiDropdownEvent e)
{
    cout << "onDropdownEvent: " << e.target->getName() << " Selected" << endl;
    
    if(e.target->getName() == "SCENES")
    {
        AppManager::getInstance().getSceneManager().changeScene(e.child);
        //m_gui.getDropdown(e.target->getName())->expand();
        m_gui.getDropdown(e.target->getName())->setLabel("SCENES:" + e.target->getLabel());
    }
    
}

void GuiManager::onColorPickerEvent(ofxDatGuiColorPickerEvent e)
{
    cout << "onColorPickerEvent: " << e.target->getName() << " Selected" << endl;
    
    if (e.target->getName() == "COLOR MODE"){
        
    }
    
}

void GuiManager::onButtonEvent(ofxDatGuiButtonEvent e)
{
    cout << "onButtonEvent: " << e.target->getName() << " Selected" << endl;
    
    if(e.target->getName() == "* Save GUI")
    {
        this->saveGuiValues();
    }
}


void GuiManager::onToggleEvent(ofxDatGuiToggleEvent e)
{
    cout << "onToggleEvent: " << e.target->getName() << " Selected" << endl;

    if(e.target->getName() == "Fullscreen")
    {
        AppManager::getInstance().getLayoutManager().onFullScreenChange(e.target->getChecked());
    }
}

void GuiManager::onMatrixEvent(ofxDatGuiMatrixEvent e)
{
    //cout << "onMatrixEvent " << e.child << " : " << e.enabled << endl;
    //cout << "onMatrixEvent " << e.target->getLabel() << " : " << e.target->getSelected().size() << endl;
    if(e.target->getLabel() == "Types")
    {
//        AppManager::getInstance().getAnimationsManager().onSetSelectedAnimations( e.target->getSelected());
    }
}



void GuiManager::onSceneChange(const string &sceneName)
{
    int index = AppManager::getInstance().getSceneManager().getIndex(sceneName);
    this->onSceneChange(index);
}

void GuiManager::onSceneChange(int sceneIndex)
{
    string dropBoxName = "SCENES";
    auto menu = m_gui.getDropdown(dropBoxName);
    menu->select(sceneIndex);
    string label =  menu->getChildAt(sceneIndex)->getLabel();
    menu->setLabel(dropBoxName + ":" + label);
    AppManager::getInstance().getSceneManager().changeScene(sceneIndex);
}



