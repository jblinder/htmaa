int btn = 2;
int led = 4;

void setup() {
  pinMode(btn, INPUT);
  pinMode(led, OUTPUT);
}

void loop() {
  int btnState = digitalRead(btn);
  if (btnState == 1) {
    digitalWrite(led, HIGH);
  }
  else {
    digitalWrite(led, LOW);
  }
}
