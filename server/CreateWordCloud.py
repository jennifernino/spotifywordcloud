import os
import sys
import numpy as np
import spotipy
import re
import spotipy.util as util
import matplotlib.pyplot as plt
from os import path
from wordcloud import WordCloud, STOPWORDS, ImageColorGenerator
from PIL import Image
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote

remove_words = set(STOPWORDS)
WORDFILE = "WordCount.txt"
IMGFILE = "MicrosoftImage.png"
garbageWords = ["[","]","0","1","2","4","5","6","7","8","9","verse","chorus",",","!","?", "\'\'","``","outro","'d","'s"]

def getTokens(authorization_token, redirect_uri, client_id, auth_endpoint):
    base_url = 'https://accounts.spotify.com/api/token'
    payload = {
        'grant_type':'authorization_code',
        'code':authorization_token,
        'redirect_uri':redirect_uri,
        'client_id': client_id,
        'client_secret': auth_endpoint
    }
    response = requests.post(base_url, data=payload)
    json = response.json()
    return json['access_token'], json['refresh_token']

def getSongsAndArtists(access_token, refresh_token):
    base_url = 'https://api.spotify.com/v1/me/top/tracks'
    headers = {'Authorization': 'Bearer ' + access_token}

    top_tracks_payload = {
        "time_range" : "long_term",
        "limit" : "10"
    }
    top_tracks_params = "&".join(["{}={}".format(key, quote(val)) for key, val in top_tracks_payload.items()])

    response = requests.get(base_url, headers=headers, params=top_tracks_params)
    json = response.json()
    tracks = []
    for track in json['items']:
        artists_names = ""
        name = track["name"]
        artists = track["artists"]
        for artist in artists:
            artists_names = artists_names + " " + artist["name"]
        tracks.append([name.strip(), artists_names.strip()])

    # Given the access token, get the songs and whatever
    return tracks

def request_song_info(song_title, artist_name):
    base_url = 'https://api.genius.com'
    headers = {'Authorization': 'Bearer ' + 'AZr2b-EVxiithfATDLRFIBJCDIZnToQMJVnJGzuV_aXWRl2Q-Ht-qeK4qx7jj5PI'}
    search_url = base_url + '/search'
    data = {'q': song_title + ' ' + artist_name}
    response = requests.get(search_url, data=data, headers=headers)
    return response

def scrap_song_url(url):
    page = requests.get(url)
    html = BeautifulSoup(page.text, 'html.parser')
    lyrics = html.find('div', class_='lyrics').get_text()
    return lyrics

def word_tokenize(full_song):
    words = re.split(r'!+|,+|\s+|\d+|\.+|:+|;+|\(+|\)+|\[+|\]+', full_song)
    clean = [word.lower() for word in words if word != '']
    return clean

def removeStopWords(song):
    stop_words = remove_words
    word_tokens = word_tokenize(song)
    filtered_song = [w for w in word_tokens if not w in stop_words and w not in garbageWords]
    return filtered_song

def passInTopSongs(arr):
    lyricsArr = []
    for elem in arr:
        artist_name = elem[1]
        song_name = elem[0]
        response = request_song_info(song_name, artist_name)
        json = response.json()
        remote_song_info = None

        for hit in json['response']['hits']:
          if artist_name.lower() in hit['result']['primary_artist']['name'].lower():
            remote_song_info = hit
            break

        lyrics = ""
        if remote_song_info:
          song_url = remote_song_info['result']['url']
          lyricsWStopWords = scrap_song_url(song_url)
          lyrics = removeStopWords(lyricsWStopWords)
        lyricsArr.append([elem[1], lyrics])
    return lyricsArr

def split_pair(str):
    pair = str.split(" ")
    return pair[0].strip(), float(pair[1])

def process_image():
    return np.array(Image.open(IMGFILE))

def process_file(lyrics):
    frequencies = {}
# [[artist, lyrics -> ['word', 'word', ..]],
#  [artist, lyrics -> ['word', 'word', ..]], ...]
    allwords = ""
    for lyric in lyrics:
        artist = lyric[0]
        words = lyric[1]
        for word in words:
            if word in frequencies:
                frequencies[word] = frequencies[word] + 1
            else:
                frequencies[word] = 1
            allwords = allwords + word + " "
    return frequencies, allwords

def generate_word_cloud(words, img_color):
    wc = WordCloud(background_color="white", max_words=1000, mask=img_color, max_font_size=90, random_state=42)
    wc.fit_words(words)
    image_colors = ImageColorGenerator(img_color)
    plt.figure(figsize=[7,7])
    plt.imshow(wc.recolor(color_func=image_colors), interpolation="bilinear")
    plt.axis("off")
    plt.savefig('../client/src/images/ResultsImage.png')
    print("Saved file sucessfully.")

authorization_token = sys.argv[1]
redirect_uri = sys.argv[2]
client_id = sys.argv[3]
auth_endpoint = sys.argv[4]

access_token, refresh_token = getTokens(authorization_token, redirect_uri, client_id, auth_endpoint)
artistsAndSongsArray = getSongsAndArtists(access_token, refresh_token)
lyricsarr = passInTopSongs(artistsAndSongsArray)
frequencies, words = process_file(lyricsarr)
image = process_image()
generate_word_cloud(frequencies, image)
