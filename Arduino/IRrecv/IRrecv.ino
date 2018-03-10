
 /*
  
 IR Receiver
     
 Description:
 * Receiving IR codes from remote control and sending commands over serial.

 Software:
 * IRremote.h Library by Ken Shirriff

 Hardware:
* Adafruit Trinket M0
* TSOP4838 38kHz IR receiver

 created 10 March 2018
 This code is under A Creative Commons Attribution/Share-Alike License http://creativecommons.org/licenses/by-sa/4.0/
   (2018) by Imanol Gómez

 */


#include <IRremote.h>

int RECV_PIN = 2;

IRrecv irrecv(RECV_PIN);

decode_results results;

void setup()
{
  Serial.begin(115200);
  delay(200);
  // In case the interrupt driver crashes on setup, give a clue
  // to the user what's going on.
  Serial.println("Enabling IRin");
  irrecv.enableIRIn(); // Start the receiver
  Serial.println("Enabled IRin");
}

void loop() {

  updateSerial();
  updateReceiver();
  delay(10);
}

void updateReceiver()
{
  if (irrecv.decode(&results)) {
    //Serial.println(results.value, HEX);
    switch(results.value) {
      case 0XFF9867:  //0
        Serial.println("0");
        break;
      case 0xFFA25D:  //1
        Serial.println("1");
        break;
      case 0xFF629D:  //2
        Serial.println("2");
        break;
      case 0xFFE21D:  //3
        Serial.println("3");
        break;
      case 0xFF22DD:  //4
        Serial.println("4");
        break;
      case 0xFF02FD:  //5
        Serial.println("5");
        break;
      case 0xFFC23D:  //6
        Serial.println("6");
        break;
      case 0xFFE01F:  //7
        Serial.println("7");
        break;
      case 0xFFA857:  //8
        Serial.println("8");
        break;
      case 0xFF906F:  //9
        Serial.println("9");
        break;
      case 0xFF38C7:  //OK
        Serial.println("S");
        break;
    }
      
    irrecv.resume(); // Receive the next value
  }
}
void updateSerial()
{
   // if there's any serial available, read it:
    while (Serial.available() > 0) 
    {
       byte header = Serial.read();
      
       if(header == '?')
       {
            Serial.println("OK");  //Send autodiscovery
       }
    }
}
