/*
 *  ParticlesManager.cpp
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 05/03/18.
 *
 */


#include "ofMain.h"

#include "ParticlesManager.h"
#include "AppManager.h"


float       m_direction;
float       m_directionMag;
float       m_speed;
float       m_size;
int         m_num;

ParticlesManager::ParticlesManager(): Manager(), m_direction(0), m_directionMag(0),m_speed(1.0), m_size(6.0), m_num(100)
{
	//Intentionally left empty
}


ParticlesManager::~ParticlesManager()
{
    ofLogNotice() <<"ParticlesManager::Destructor" ;
}


void ParticlesManager::setup()
{
	if(m_initialized)
		return;


	Manager::setup();
    
    
    ofLogNotice() <<"ParticlesManager::initialized" ;
    
}


void ParticlesManager::update()
{
 
}




