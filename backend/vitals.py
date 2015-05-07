import json
from flask import Flask, request, jsonify
from redis import StrictRedis


app = Flask(__name__)
redis = StrictRedis.from_url('redis://localhost')


# Keys POSTed and stored to redis
VITALS_KEYS = 'ecg', 'heartRate', 'respirationRate'

# Number of rolling POSTed data to return in /latest
LATEST_MAX = 5


@app.route('/', methods=['POST'])
def push_vitals():
    data = request.get_json(force=True)
    for key in VITALS_KEYS:
        if key in data:
            value = data[key]
            redis.lpush(key, json.dumps(value))
    return '', 204


@app.route('/latest')
def latest_vitals():
    latest = {k: redis.lrange(k, 0, LATEST_MAX) for k in VITALS_KEYS}
    return jsonify(latest)


if __name__ == '__main__':
    app.run('0.0.0.0', 8787, debug=True)
