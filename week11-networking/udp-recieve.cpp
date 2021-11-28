/*
https://stackoverflow.com/questions/55780947/how-to-send-receive-via-udp-with-esp8266-12
Code modified by Justin Blinder
*/
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

const char* ssid = "JBPD";
const char* password = "6176450327";
unsigned int localPort = 2390; 
char packetBuffer[255];
WiFiUDP Udp;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Udp.begin(localPort);
  Serial.print(".");
  Serial.println("");
  Serial.println("WiFi connected.");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  delay(10);
  if (Udp.parsePacket()) {
    int len = Udp.read(packetBuffer, 255);
    if (len > 0) {
      packetBuffer[len] = 0;
      Serial.println(packetBuffer); 
    }
  }
}