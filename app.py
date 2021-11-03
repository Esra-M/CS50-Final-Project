from flask import Flask, redirect, request, render_template, g, url_for, session
from werkzeug.security import check_password_hash, generate_password_hash
from flask_session import Session
from tempfile import mkdtemp
import sqlite3
import random

# Configure application
app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# home page
@app.route("/", methods=["GET", "POST"])
def index():
    
    con = sqlite3.connect("memories.db")
    cur = con.cursor()

    # if logged in display the name of the user and give option to log out
    if session.get('user_id'):
        logged = True

        # get the users name
        userID = session['user_id']
        cur.execute("SELECT username FROM users WHERE userID = ?", (userID,))
        username = " " + cur.fetchall()[0][0]
        con.commit()

        return render_template("index.html", username=username, logged=logged)
    else:
        # if not logged in don't display the users name and give options to log in and register
        username=""
        logged = False
        return render_template("index.html", username=username, logged=logged)


# login
@app.route("/login",  methods=["GET", "POST"])
def login():

    if request.method == "POST":
        
        # connect to the database
        con = sqlite3.connect("memories.db")
        cur = con.cursor()

        # get the users information from the login form
        username = request.form.get("username")
        password = request.form.get("password")

        # set an error message for checking valid input 
        userError = ""

        # query database for username
        cur.execute("SELECT * FROM users WHERE username = ?", (username,))
        rows = cur.fetchall()
        con.commit()

        # ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0][2], password):
            userError = "Invalid username or password"
            return render_template("login.html", userError=userError, username=username, password=password)

        # remember which user has logged in
        session["user_id"] = rows[0][0]

        return redirect("/")
    else:

        # don't let the user to go back to the login page if already logged in
        if session.get('user_id'):
            # ??????????? back button does not eqial redirecting to a page ???????????? 
            # print("******** " + str(session.get('user_id')))
            return redirect("/")
        return render_template("login.html")

# register
@app.route("/register",  methods=["GET", "POST"])
def register():

    if request.method == "POST":

        # get the users information from the registration form
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmPassword")

        # connect to the database
        con = sqlite3.connect("memories.db")
        cur = con.cursor()

        # hash the password
        passwordHash = generate_password_hash(password)

        # set error variables for validation of the registration form
        nameError = None
        passError = None

        # Ensure username is unique
        cur.execute("SELECT Count(*) FROM users WHERE lower(username) = ?", (username.lower(),))
        numOfRows=cur.fetchone()

        if numOfRows[0] != 0:
            nameError="Username is not available"
            return render_template("register.html", nameError=nameError, username=username, password=password, confirmation=confirmation)
        else:
            # Ensure confirmation password matches password
            if password != confirmation:
                passError = "Password does not match"
                return render_template("register.html", passError=passError, username=username, password=password, confirmation=confirmation)
            else:
                # Update the database with the users information
                cur.execute("INSERT INTO users(username, passwordHash) VALUES(?, ?)", (username, passwordHash))
                con.commit()

                # Remember which user has logged in
                cur.execute("SELECT userID FROM users WHERE username = ?", (username,))
                userID = cur.fetchall()
                con.commit()
                session["user_id"] = int(userID[0][0])

                # redirect them to the home page
                return redirect("/")

    else:

        # don't let the user to go back to the register page if already logged in
        if session.get('user_id'):
            return redirect("/")

        return render_template("register.html")

# logout
@app.route("/logout")
def logout():

    # Forget any user_id
    session.clear()

    # Redirect the users to the login form
    return redirect("/")

# add
@app.route("/add",  methods=["GET", "POST"])
def add():

    # connect to the database
    con = sqlite3.connect("memories.db")
    cur = con.cursor()

    # check if the user is logged in
    if session.get('user_id'):
        logged = True
    else:
        logged = False

    if request.method == "POST":
        
        # get the note information from the form
        noteName = request.form.get("note-name")
        note = request.form.get("note")

        # check if the user is logged in
        if session.get('user_id'):
            # get the user id
            userID = session['user_id']
            
            # update the notes database with the note information
            cur.execute("INSERT INTO notes(noteName, note, userID) VALUES(?, ?, ?)", (noteName, note, userID))
            con.commit()

        return redirect("/")
    else:
        return render_template("add.html", logged=logged)

# my memories
@app.route("/myMemoiries")
def myMemoiries():

    # connect to the database
    con = sqlite3.connect("memories.db")
    cur = con.cursor()

    # check if the user is logged in
    if session.get('user_id'):
        logged = True
        userID = session['user_id']

        # select the users notes
        cur.execute("SELECT * FROM notes WHERE userID = ?", (userID,))
        rows = cur.fetchall()
        con.commit()

        return render_template("myMemories.html", logged=logged, rows=rows)
    
    else:
        return redirect("/login")

# profile
@app.route("/profile")
def profile():

    
    # check if the user is logged in
    if session.get('user_id'):

        logged = True
        
        return render_template("profile.html", logged=logged)
    else:
        return redirect("/login")