from flask import Flask, redirect, request, render_template, g, url_for
from werkzeug.security import check_password_hash, generate_password_hash
import sqlite3

# Configure application
app = Flask(__name__)

app.config["TEMPLATES_AUTO_RELOAD"] = True

# home page
@app.route("/")
def index():
    return render_template("index.html")

# login
@app.route("/login",  methods=["GET", "POST"])
def login():
    if request.method == "POST":
        return redirect("/")
    else:
        return render_template("login.html")

# register
@app.route("/register",  methods=["GET", "POST"])
def register():
    if request.method == "POST":

        # get the users information from the registration form
        username = request.form.get("username")
        password = request.form.get("password")
        confirmation = request.form.get("confirmPassword")

        # hash the password
        passwordHash = generate_password_hash(password)

        # connect to the database
        con = sqlite3.connect("memories.db")
        cur = con.cursor() 
        
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
                con.close() 

                # redirect them to the home page
                return redirect("/")

    else:
        return render_template("register.html")

# logout
@app.route("/logout")
def logout():
    return render_template("logout.html")

# add
@app.route("/add")
def add():
    return render_template("add.html")
