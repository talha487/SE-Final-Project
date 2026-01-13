from flask import Flask, render_template, request, redirect, session
import csv
import os

app = Flask(__name__)
app.secret_key = "secretkey"

CSV_FILE = "users.csv"

# Create CSV file if it doesn't exist
if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, "w", newline='') as file:
        writer = csv.writer(file)
        writer.writerow(['username', 'password', 'role'])
        writer.writerow(['admin', 'admin123', 'admin'])
        writer.writerow(['user', 'user123', 'user'])

def check_user(username, password):
    with open(CSV_FILE, newline='') as file:
        reader = csv.DictReader(file)
        for row in reader:
            if row['username'] == username and row['password'] == password:
                return row['role']
    return None

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        role = check_user(username, password)
        if role:
            session["user"] = username
            session["role"] = role
            return redirect("/admin" if role == "admin" else "/home")
        return render_template("login.html", error="Invalid credentials")

    return render_template("login.html")

@app.route("/admin", methods=["GET", "POST"])
def admin():
    if session.get("role") != "admin":
        return redirect("/")

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]
        role = request.form["role"]

        with open(CSV_FILE, "a", newline='') as file:
            writer = csv.writer(file)
            writer.writerow([username, password, role])
        
        return render_template("admin.html", success=True)

    # Read all users
    users = []
    with open(CSV_FILE, newline='') as file:
        reader = csv.DictReader(file)
        users = list(reader)

    return render_template("admin.html", users=users)

@app.route("/home")
def home():
    if "user" not in session:
        return redirect("/")
    return render_template("home.html", username=session.get("user"))

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/")

if __name__ == "__main__":
   if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
