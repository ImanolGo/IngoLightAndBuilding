/*
 *  ParticlesManager.h
 *  Ingo Light And Building
 *
 *  Created by Imanol Gomez on 05/03/18.
 *
 */


#pragma once

#include "Manager.h"


//========================== class ParticlesManager ==============================
//================================================================================
/** \class ParticlesManager ParticlesManager.h
 *	\brief Class managing the particles and its properties
 *	\details it holds all the different particle parameters and saves them according to each scene
 */

struct ParticleParameters
{
    float       direction;
    float       directionMag;
    float       speed;
    float       size;
    float       fadeTime;
    float       vectorSpeed;
    float       randomness;
    int         num;
    
    ParticleParameters():direction(0), directionMag(0),speed(1.0), size(6.0), num(100), fadeTime(2.0), vectorSpeed(0.2), randomness(0.5){}
};


class ParticlesManager: public Manager
{
    
    public:

        //! Constructor
        ParticlesManager();

        //! Destructor
        ~ParticlesManager();

        //! Setup the Noise Manager
        void setup();

        //! Update the Noise Manager
        void update();


        void setDirecction(float & value) { m_parameters.direction = value;}

        void setDirecctionMag(float & value) { m_parameters.directionMag = value;}

        void setSpeed(float & value) { m_parameters.speed = value;}

        void setSize(float & value) { m_parameters.size = value;}

        void setNum(int & value) { m_parameters.num = value;}
    
        void setFadeTime(float & value) { m_parameters.fadeTime = value;}
    
        void setVectorSpeed(float & value) { m_parameters.vectorSpeed = value;}
    
        void setRandonmess(float & value) { m_parameters.randomness = value;}
    
        const ParticleParameters& getParameters() const {return m_parameters;}

    private:
    
        ParticleParameters m_parameters;

};




