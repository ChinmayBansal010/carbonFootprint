from flask import Flask, request, jsonify, render_template
import speech_recognition as sr
import os

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recognize', methods=['POST'])
def recognize_speech():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    file_path = os.path.join("temp_audio.wav")
    audio_file.save(file_path)

    recognizer = sr.Recognizer()
    with sr.AudioFile(file_path) as source:
        audio = recognizer.record(source)

    try:
        text = recognizer.recognize_google(audio)
        return jsonify({'text': text})
    except sr.UnknownValueError:
        return jsonify({'error': 'Speech not understood'})
    except sr.RequestError as e:
        return jsonify({'error': f'Request failed: {e}'})
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == '__main__':
    app.run(debug=True)