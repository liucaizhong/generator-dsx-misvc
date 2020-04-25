import sys
import logging
from flask import Flask, render_template

APP = Flask(__name__)


@APP.route("/")
def home():
    return render_template("home.html")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        logging.error("usage: %s port" % (sys.argv[0]))
        sys.exit(-1)

    PORT = int(sys.argv[1])
    logging.info("start at port %s" % (PORT))
    APP.run(host="::", port=PORT, debug=True, threaded=True)
