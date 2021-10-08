import os
import requests
from pprint import pprint
from datetime import datetime
import pandas as pd
import json

api_key = os.environ.get('api_key')
user = os.environ.get('api_user')
base_url = f'https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user={user}&api_key={api_key}&format=json&limit=200'
page = 0
plays = []

def request_tracks(page):
    global plays
    print(f'requesting page {page}')
    response = requests.get(f'{base_url}&page={page}')
    if (response.status_code == 200):
        payload = response.json()['recenttracks']['track']
        get_track_counts(payload)

    elif (response.status_code == 404):
        print("result not found!")
    if page > 254:
        plays = [item for sublist in plays for item in sublist]
        print("saving results")
        with open('data.json', 'w') as outfile:
            json.dump({"plays": plays}, outfile, ensure_ascii=False, indent=4)
        return
    page = page + 1
    request_tracks(page)

def get_track_counts(tracks):
    track_dates = []
    for track in tracks:
        play_date = datetime.utcfromtimestamp(int(track['date']['uts']))
        track_dates.append({"date":play_date})
    df = pd.DataFrame(track_dates)
    df = (pd.to_datetime(df['date'])
       .dt.floor('d')
       .value_counts()
       .rename_axis('date')
       .reset_index(name='count'))  
    
    df['date'] = df['date'].astype(str)
    payload = json.loads(json.dumps(list(df.T.to_dict().values())))
    plays.append(payload)

request_tracks(1)