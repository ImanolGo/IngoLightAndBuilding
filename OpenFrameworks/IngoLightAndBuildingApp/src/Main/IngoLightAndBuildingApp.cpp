/*
 *  IngoLightAndBuildingApp.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 01/03/18.
 *
 */



#include "AppManager.h"

#include "IngoLightAndBuildingApp.h"

//--------------------------------------------------------------
void IngoLightAndBuildingApp::setup(){
    AppManager::getInstance().setup();
}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::update(){
    AppManager::getInstance().update();
}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::draw(){
    AppManager::getInstance().draw();
}

void IngoLightAndBuildingApp::exit()
{
    ofLogNotice() <<"IngoLightAndBuildingApp::exit";

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::keyPressed(int key){

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::keyReleased(int key){

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::mouseMoved(int x, int y ){

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::mouseDragged(int x, int y, int button){

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::mousePressed(int x, int y, int button){

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::mouseReleased(int x, int y, int button){

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::windowResized(int w, int h){
    AppManager::getInstance().getLayoutManager().windowResized(w,h);


}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::gotMessage(ofMessage msg){

}

//--------------------------------------------------------------
void IngoLightAndBuildingApp::dragEvent(ofDragInfo dragInfo){

}
