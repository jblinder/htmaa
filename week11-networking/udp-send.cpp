/*
https://stackoverflow.com/questions/55780947/how-to-send-receive-via-udp-with-esp8266-12
Code modified by Justin Blinder
*/
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

const char *ssid = "redacted";
const char *password = "redacted";
unsigned int localPort = 2390;
char packetBuffer[255];
WiFiUDP Udp;
int incomingByte = 0;

void setup()
{
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Udp.begin(localPort);
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop()
{
  if (Serial.available() > 0)
  {
    incomingByte = Serial.read();
    Serial.write(incomingByte);
    Udp.beginPacket("172.20.10.2", localPort);
    Udp.write(incomingByte);
    Udp.endPacket();
    delay(10);
  }
}