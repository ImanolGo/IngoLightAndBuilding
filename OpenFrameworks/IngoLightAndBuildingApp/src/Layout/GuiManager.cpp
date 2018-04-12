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
const string GuiManager::PRESETS_PREFIX = "xmls/Presets_";
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
    this->setupScenesToggleGui();
    this->setupLayoutGui();
    this->setupParticlesGui();
    this->setupPaletteGui();
    this->setupGuiEvents();
    this->loadGuiValues();
    
    ofLogNotice() <<"GuiManager::initialized";
    
}

void GuiManager::setupGuiParameters()
{
    ofxDatGuiLog::quiet();
    
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
    m_gui.addToggle("Timer");
    auto toggle = m_gui.getToggle("Timer");
    toggle->setChecked(true);
    m_gui.addButton("Save Preset");
    
    m_gui.addBreak();
    
}

void GuiManager::loadSceneToggles()
{
    auto folder = m_gui.getFolder("ACTIVATE SCENES");
    
    auto sceneManager = &AppManager::getInstance().getSceneManager();
    
    for(int i = 0; i < sceneManager->getNumberScenes(); i++)
    {
        string sceneName = sceneManager->getSceneName(i);
        ofxDatGuiComponent*  guiComponent = folder->getComponent(ofxDatGuiType::TOGGLE, sceneName);
        
        if(guiComponent!=NULL && m_parameters.contains(sceneName)){
            ofxDatGuiToggle *toggle = static_cast<ofxDatGuiToggle *>(guiComponent);
            auto& param = m_parameters.getBool(sceneName);
            toggle->setChecked(param.get());
        }
        
    }
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

void GuiManager::setupScenesToggleGui()
{
    auto sceneManager = &AppManager::getInstance().getSceneManager();
    
    ofxDatGuiFolder* folder = m_gui.addFolder("ACTIVATE SCENES", ofColor::deepPink);
    
    for(int i = 0; i < sceneManager->getNumberScenes(); i++)
    {
        ofParameter<bool> toggle;
        toggle.set(sceneManager->getSceneName(i), true);
        m_parameters.add(toggle);
        
        folder->addToggle(sceneManager->getSceneName(i), true);
    }
}


void GuiManager::setupLayoutGui()
{
    auto layoutManager = &AppManager::getInstance().getLayoutManager();
    auto sceneManager = &AppManager::getInstance().getSceneManager();
    
    m_sceneTransitionTime.set("TransitionTime", 0.5, 0.0, 8.0);
    m_sceneTransitionTime.addListener(sceneManager, &SceneManager::onTransitionTimeChange);
    m_parameters.add(m_sceneTransitionTime);
    
    m_sceneTimer.set("ScenesTimer", 30, 1, 120.0);
    m_sceneTimer.addListener(sceneManager, &SceneManager::onChangeSceneDuration);
    m_presets.add(m_sceneTimer);
    
    
    ofxDatGuiFolder* folder = m_gui.addFolder("GENERAL", ofColor::purple);
    folder->addSlider(m_sceneTransitionTime);
    folder->addSlider(m_sceneTimer);
    folder->expand();
    m_gui.addBreak();
}

void GuiManager::setupPaletteGui()
{
    // add some color pickers to color our lines //
    ofxDatGuiFolder* f1 = m_gui.addFolder("PALETTE", ofColor::fromHex(0x2FA1D6));
    
    int numColors = 5;
    for(int i = 0; i < numColors; i++)
    {
        string colorName = "COLOR " + ofToString(i);
        f1->addColorPicker(colorName);
        
        ofParameter<int>   colorHex;
        colorHex.set(colorName, 0, 0, 16777215);
        m_colorHexVector.push_back(colorHex);
        m_presets.add(m_colorHexVector.back());
        m_colors.push_back(ofColor(0));
        
    }
    f1->expand();
    m_gui.addBreak();
    
}


const ofColor& GuiManager::getColor(int index)
{
//    string colorName = "COLOR " + ofToString(index);
//    return m_gui.getColorPicker(colorName)->getColor();
    
    if(index<0 || index >= m_colors.size() ){
        return m_colors[0];
    }
    
    return m_colors[index];
}

void GuiManager::setupParticlesGui()
{
    auto particlesManager = &AppManager::getInstance().getParticlesManager();
    
    m_particlesDirection.set("Direction", 0.0, 0.0, 360.0);
    m_particlesDirection.addListener(particlesManager, &ParticlesManager::setDirecction);
    m_presets.add(m_particlesDirection);
    
    m_particlesDirectionMag.set("Dir. Mag.", 0.0, 0.0, 2.0);
    m_particlesDirectionMag.addListener(particlesManager, &ParticlesManager::setDirecctionMag);
    m_presets.add(m_particlesDirectionMag);
    
    m_particlesSpeed.set("Speed", 0.0, 0.0, 10.0);
    m_particlesSpeed.addListener(particlesManager, &ParticlesManager::setSpeed);
    m_presets.add(m_particlesSpeed);
    
    m_particlesSize.set("Size", 6.0, 0.0, 200.0);
    m_particlesSize.addListener(particlesManager, &ParticlesManager::setSize);
    m_presets.add(m_particlesSize);
    
    m_particlesNum.set("Num", 800, 0, 1500);
    m_particlesNum.addListener(particlesManager, &ParticlesManager::setNum);
    m_presets.add(m_particlesNum);
    
    m_particlesFade.set("Fade", 0.0, 0.0, 60.0);
    m_particlesFade.addListener(particlesManager, &ParticlesManager::setFadeTime);
    m_presets.add(m_particlesFade);
    
    m_particlesVectSpeed.set("Vect. Speed", 0.2, 0.0, 2.0);
    m_particlesVectSpeed.addListener(particlesManager, &ParticlesManager::setVectorSpeed);
    m_presets.add(m_particlesVectSpeed);
    
    m_particlesRandomness.set("Randomness", 0.5, 0.0, 5.0);
    m_particlesRandomness.addListener(particlesManager, &ParticlesManager::setRandonmess);
    m_presets.add(m_particlesRandomness);
    
    m_particlesBlur.set("Blur", 0.05, 0.0, 0.15);
    m_particlesBlur.addListener(particlesManager, &ParticlesManager::setBlur);
    m_presets.add(m_particlesBlur);
    
    
    ofxDatGuiFolder* folder = m_gui.addFolder("PARTICLES", ofColor::yellow);
    folder->addSlider(m_particlesDirection);
    folder->addSlider(m_particlesDirectionMag);
    folder->addSlider(m_particlesSpeed);
    folder->addSlider(m_particlesSize);
    folder->addSlider(m_particlesNum);
    folder->addSlider(m_particlesFade);
   // folder->addSlider(m_particlesVectSpeed);
    folder->addSlider(m_particlesRandomness);
    folder->addSlider(m_particlesBlur);
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
    
    this->loadSceneToggles();
}


void GuiManager::savePresetsValues(const string& sceneName)
{
    ofXml xml;
    
    ofSerialize(xml, m_presets);
    // xml.serialize(m_parameters);
    string xmlName = PRESETS_PREFIX + sceneName +".xml";
    xml.save(xmlName);
    
    ofLogNotice() <<"GuiManager::savePresetsValues -> " << xmlName;
}

void GuiManager::loadPresetsValues(const string& sceneName)
{
    ofXml xml;
    string xmlName = PRESETS_PREFIX + sceneName +".xml";
    xml.load(xmlName);
    ofDeserialize(xml, m_presets);
    // xml.deserialize(m_parameters);
    
    this->onResetColors();
    ofLogNotice() <<"GuiManager::loadPresetsValues -> " << xmlName;
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


void GuiManager::onResetColors()
{
   for (int i = 0; i< m_colorHexVector.size(); i++)
   {
        //string colorName = "COLOR " + ofToString(i);
        string colorName = m_colorHexVector[i].getName();
        if( m_presets.contains(colorName)){
            auto hexColor = m_presets.getInt(colorName);
            int hexValue = hexColor.get();
            ofColor c  = ofColor::fromHex(hexValue); // c is yellow.
            //c = ofColor(ofRandom(255),ofRandom(255),ofRandom(255));
            ofLogNotice() <<"GuiManager::onResetColors << set color r: " << ofToString((int)c.r) << ", g: " <<  ofToString((int)c.g) << ", b:" <<ofToString((int)c.b);
            m_gui.getColorPicker(hexColor.getName())->setVisible(true);
            m_gui.getColorPicker(hexColor.getName())->setColor(c);
            m_colors[i] = c;
            ofLogNotice() <<"GuiManager::onResetColors << set color : " << colorName << " to " << hexValue;
        }
        
    }
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
    
    this->setColor(e.target->getName(), e.color);
    
//    if (e.target->getName() == "COLOR MODE"){
//
//    }
    
}

void GuiManager::onButtonEvent(ofxDatGuiButtonEvent e)
{
    cout << "onButtonEvent: " << e.target->getName() << " Selected" << endl;
    
    if(e.target->getName() == "Save Preset")
    {
        //this->saveGuiValues();
        auto currentSceneName = AppManager::getInstance().getSceneManager().getCurrentSceneName();
        this->savePresetsValues(currentSceneName);
    }
}


void GuiManager::setColor(string name, ofColor& color)
{
    if( m_presets.contains(name)){
         auto hexColor = m_presets.getInt(name);
         hexColor.set(color.getHex());
         ofLogNotice() <<"GuiManager::setColor << set preset color : " << name << "to " << hexColor.get();
    }
}

void GuiManager::onToggleEvent(ofxDatGuiToggleEvent e)
{
    cout << "onToggleEvent: " << e.target->getName() << " Selected" << endl;

    if(e.target->getName() == "Fullscreen")
    {
        AppManager::getInstance().getLayoutManager().onFullScreenChange(e.target->getChecked());
    }
    
    else if(e.target->getName() == "Timer")
    {
        AppManager::getInstance().getSceneManager().setTimerOn(e.target->getChecked());
    }
    
    this->setSceneToggle(e.target->getName(), e.target->getChecked());
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

void GuiManager::setSceneToggle(string name, bool value)
{
    if(m_parameters.contains(name)){
        auto& toggle = m_parameters.getBool(name);
        toggle = value;
        ofLogNotice() << "GuiManager::setSceneToggle -> set toogle " << toggle.getName() << " to " << toggle.get();
    }
}


bool GuiManager::isSceneActive(string name)
{
    if(m_parameters.contains(name)){
        auto& toggle = m_parameters.getBool(name);
        return toggle.get();
    }
    
    return false;
}



void GuiManager::onSceneChange(const string &sceneName)
{
    ofLogNotice() <<"GuiManager::onSceneChange << looking for scene: " << sceneName;
    
    int index = AppManager::getInstance().getSceneManager().getIndex(sceneName);
    if(index>=0){
        this->onSceneChange(index);
         ofLogNotice() <<"GuiManager::onSceneChange << Changing to scene: " << sceneName;
    }
}

void GuiManager::onSceneChange(int sceneIndex)
{
    string dropBoxName = "SCENES";
    auto menu = m_gui.getDropdown(dropBoxName);
    
    if(sceneIndex>=0 && sceneIndex< menu->size())
    {
        ofLogNotice() <<"GuiManager::onSceneChange <<Changing to sccene index " << sceneIndex;
        menu->select(sceneIndex);
        string label =  menu->getChildAt(sceneIndex)->getLabel();
        menu->setLabel(dropBoxName + ":" + label);
        AppManager::getInstance().getSceneManager().changeScene(sceneIndex);
    }
   
}



