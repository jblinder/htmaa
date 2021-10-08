import processing.svg.*;
float[] data;

JSONArray months;
int index = 15;
void setup() {
  //size(600,600,SVG,"card-data-barchart-1.svg");
  size(1000, 1000);
  noLoop();
  loadJSON();
}

void draw() {
  for (int i = 0; i < months.size(); i++) {
    JSONObject month = months.getJSONObject(i);
    String m = month.getString("month");
    String y = month.getString("year");
    int newCases = month.getInt("new_cases");
    int peopleVaccinated = month.getInt("people_vaccinated");
    float cases = map(log(newCases), 0, log(6472186), 500, 700);
    float vaccinations = map(log(peopleVaccinated), 0, log(211489242), 400, 50);
    beginRecord(SVG, "output_" + y+ "_" + m + ".svg");
    println(cases);
    println(vaccinations);
    stroke(0, 255, 0);
    ellipse(width/2.5, height/2.5, cases, cases);
    stroke(0, 0, 255);
    ellipse(width/2.5, height/2.5, vaccinations, vaccinations);
    textSize(10);
    text(m + " " + y, width/2.5-100,height/2.5-20);
    fill(0, 408, 612);
    noFill();
    endRecord();

  }
}

void loadJSON() {
  months = loadJSONArray("covid_data.json");

  for (int i = 0; i < months.size(); i++) {
    JSONObject month = months.getJSONObject(i);
    String m = month.getString("month");
    String y = month.getString("year");
    int newCases = month.getInt("new_cases");
    int peopleVaccinated = month.getInt("people_vaccinated");
    println(m + " " + y + " " + newCases + " " + peopleVaccinated);
  }
}