from flask import Flask, redirect, request, render_template, g, url_for, session, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from flask_session import Session
from tempfile import mkdtemp
import sqlite3

# Configure application
app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_FILE_DIR"] = mkdtemp()
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Ensure responses aren't cached
@app.after_request
def after_request(response):
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# home page
@app.route("/", methods=["GET", "POST"])
def index():
    
    # connect to the database
    con = sqlite3.connect("memories.db")
    cur = con.cursor()

    # check if the user is logged in
    if session.get('user_id'):
        logged = True

        # get the users name
        userID = session['user_id']
        cur.execute("SELECT username FROM users WHERE userID = ?", (userID,))
        username = cur.fetchall()[0][0]
        con.commit()

        # select the users notes
        cur.execute("SELECT * FROM notes WHERE userID = ?", (userID,))
        rows = cur.fetchall()
        con.commit()

        return render_template("index.html", logged=logged, rows=rows, username=username)
    
    else:
        return redirect("/login")

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
@app.route("/add",  methods=["POST"])
def add():

    # connect to the database
    con = sqlite3.connect("memories.db")
    cur = con.cursor()
        
    # get the note information from the form
    noteName = request.form.get("new-note-heading")
    note = request.form.get("new-note-content")

    # get the user id
    userID = session['user_id']
    
    # insert the note information in the notes database
    cur.execute("INSERT INTO notes(noteName, note, userID) VALUES(?, ?, ?)", (noteName, note, userID))
    con.commit()

    return redirect("/")
    

# edit
@app.route("/edit", methods=["POST"])
def edit():

    # connect to the database
    con = sqlite3.connect("memories.db")
    cur = con.cursor()

    # get the edited note information
    noteId = request.form['noteId']
    noteName = request.form['noteName']
    note = request.form['note']

    # update the note information from the database
    cur.execute("UPDATE notes SET noteName = ?, note = ? WHERE noteID = ?", (noteName, note, noteId))
    con.commit()

    # send the data of the note that need to be updated
    return jsonify({'result': 'success', 'noteId': noteId, 'noteName': noteName, 'note': note})

# delete
@app.route("/delete", methods=["POST"])
def delete():

    # connect to the database
    con = sqlite3.connect("memories.db")
    cur = con.cursor()

    # get the deleted notes information
    noteIds = request.form.getlist('noteIds[]')
    
    # delete the notes from the database
    for noteId in noteIds:
        cur.execute("DELETE FROM notes WHERE noteID = ?", (noteId,))
        con.commit()

    # send the data of the note that need to be updated
    return jsonify({'result': 'success'})

# edit account
@app.route("/account", methods=["POST"])
def account():
    
    # connect to the database
    con = sqlite3.connect("memories.db")
    cur = con.cursor()
        
    # get the user information
    username = request.form["username"]
    password = request.form["password"]
    newPassword = request.form["newPass"]

    # get the user id
    userID = session['user_id']

    # set error variables for validation of the registration form
    userError = False
    passError = False
    newPassError = False

    # set variables for the updated user information labels
    userChange = False
    passChange = False

    # select the same usernames from the database
    cur.execute("SELECT Count(*) FROM users WHERE lower(username) = ?", (username.lower(),))
    numOfRows=cur.fetchone()

    # select the users current password and username from the database
    cur.execute("SELECT * FROM users WHERE userID = ?", (userID,))
    rows = cur.fetchall()
    con.commit()
    oldPassHash = rows[0][2]
    oldUsername = rows[0][1]

    # check new username has been entered
    if oldUsername != username:
        # check if the username is free
        if numOfRows[0] == 0:
            # update the username
            cur.execute("UPDATE users SET username = ? WHERE userID = ?", (username, userID))
            con.commit()

            # set the label variable for the username change
            userChange = True
        else:
            # set error message for the username
            userError = True
            # return jsonify({'result': 'success', 'nameError': nameError, 'passError': ""})


    # check if password has been entered
    if len(password) != 0:

        # check if new password has been entered
        if len(newPassword) != 0:
            # check if the password matches
            if check_password_hash(oldPassHash, password):

                # make sure the new password is not the same as the current one
                if newPassword != password:
                
                    # hash the new password
                    passwordHash = generate_password_hash(newPassword)

                    # update the password
                    cur.execute("UPDATE users SET passwordHash = ? WHERE userID = ?", (passwordHash, userID))
                    con.commit()

                    # set the label variable for the password change
                    passChange = True
                else:
                    # set error message for the password
                    newPassError = True
            else:
                # set error message for the password
                passError = True
        else:
            # set error message for the new password
            newPassError = True

    # return the error messages and the labels with the changes
    return jsonify({'result': 'success','passError': passError, "newPassError": newPassError, 'userError': userError, 'userChange': userChange, 'passChange': passChange})

if __name__ == '__main__':
    app.run()