#include "Arduino.h"

/******************************************************************************
  (https://www.sparkfun.com/products/10264)
Jim Lindblom @ SparkFun Electronics

Code modified by Justin Blinder
******************************************************************************/
const int FLEX_PIN = 1; //A0; // Pin connected to voltage divider output

// Measure the voltage at 5V and the actual resistance of your
// 47k resistor, and enter them below:
const float VCC = 4.98;      // Measured voltage of Ardunio 5V line
const float R_DIV = 10000.0; // Measured resistance of 3.3k resistor

// Upload the code, then try to adjust these values to more
// accurately calculate bend degree.
const float STRAIGHT_RESISTANCE = 37300.0; // resistance when straight
const float BEND_RESISTANCE = 90000.0;     // resistance at 90 deg

void setup()
{
  Serial.begin(115200);
  pinMode(FLEX_PIN, INPUT);
}

void loop()
{
  Serial.println("HERE");
  int flexADC = analogRead(FLEX_PIN);
  float flexV = flexADC * VCC / 1023.0;
  float flexR = R_DIV * (VCC / flexV - 1.0);
  Serial.println("Resistance: " + String(flexR) + " ohms");
  float angle = map(flexR, STRAIGHT_RESISTANCE, BEND_RESISTANCE,
                    0, 90.0);
  Serial.println("Bend: " + String(angle) + " degrees");
  Serial.println();

  delay(500);
}
