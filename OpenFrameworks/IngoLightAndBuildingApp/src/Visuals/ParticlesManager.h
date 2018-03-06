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


        void setDirecction(float & value) { m_direction = value;}

        void setDirecctionMag(float & value) { m_directionMag = value;}

        void setSpeed(float & value) { m_speed = value;}

        void setSize(float & value) { m_size = value;}

        void setNum(int & value) { m_num = value;}
    
        float getDirection() {return m_direction;}
    
        float getDirectionMag() {return m_directionMag;}
    
        float getSpeed() {return m_speed;}
    
        float getSize() {return m_size;}
    
        int  getNum() {return m_num;}
    
        

    private:
    
    
    
    private:

        float       m_direction;
        float       m_directionMag;
        float       m_speed;
        float       m_size;
        int         m_num;
};




