const express = require("express");
const bodyParser = require("body-parser");
const {client} = require('./db');

const db = client.db("test");
const applicantCollection = db.collection('applicants');
const recruitersCollection = db.collection('recruiters');

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}))

var users = []; //this array is going to contain users
var recruiters = ["dummydata"]; //this array is going to contain recruiters
var posts = []; //this array contains the posts created


let currRecruiter = {};
let currApplicant = {};

class User { //this is the properties that a User has
    constructor(name, pass, skills, email) {
        this.name = name;
        this.email = email;
        this.skills = skills;
        this.pass = pass;
        this.recruiter = false;
    }
}

class Recruiter { //this is the properties that a Recruiter has
    constructor(name, pass, email, industry) {
        this.name = name;
        this.email = email;
        this.industry = industry;
        this.pass = pass;
        this.recruiter = true;
    }
}

class Post {
    constructor(image, title, content, Qualifications) {
        this.image = image;
        this.title = title;
        this.content = content;
        this.Qualifications = Qualifications;
    }
}

app.get("/main", (req,res) => {
    res.render("main.ejs");
});

app.get("/post", (req, res) => {
    res.render("post.ejs")
});

app.get("/signup/:recruiter", (req, res) => {
    const recruiter = req.params.recruiter;
    res.render("signup.ejs", {recruiter: recruiter});
    console.log(recruiter);
});


// app.post("/swipes", (req, res) => {
//     res.render("SwipeMechanism.ejs", {recruiter: recruiters[0]});
// });

app.post("/postC", async (req, res) => { //this creates a new post from the post creation feature
    const image = req.body.image;
    const title = req.body.title;
    const description = req.body.content;
    const qualifications = req.body.qualifications;
    // var post1 = new Post(image, title, content); //creates new post
    let posting = {image: image, title: title, description: description, qualifications: qualifications}
    // posts.push(post1); //adds the post into the post array

    // SEARCHING
    let result = await recruitersCollection.findOne({cname: currRecruiter.cname});
    if (result) {
        result.jobPostings.push(posting);
        recruitersCollection.deleteOne({cname: currRecruiter.cname})
        recruitersCollection.insertOne(result);
        res.redirect("/");
    }
    else {
        res.redirect("/");
    }
    

    // res.render("SwipeMechanism.ejs", {recruiter: rec});
});

app.post("/swipes", async (req,res) => { //redirected here when you sign up
    const cname = req.body.cname;
    const cemail = req.body.cemail;
    const industry = req.body.industry;
    const pass = req.body.password;
    const jobPostings = [];
    const applicantsWhoSwipedRight = {};
    const allUsers = await getUsers();

    // var rec = new Recruiter(name, pass, email); //makes new recruiter
    let rec = {cname: cname, cemail: cemail, industry: industry, pass: pass, jobPostings: jobPostings, applicantsWhoSwipedRight: applicantsWhoSwipedRight}
    currRecruiter = rec;
    // recruiters.push(rec); //adds the new recruiter in the recruiter array
    const result = await recruitersCollection.insertOne(rec)
    res.render("SwipeMechanism.ejs", {recruiter: rec, allUsers});
    console.log(allUsers);
    // res.render("SwipeMechanism.ejs", {recruiter: rec});
});

app.post("/swipe", async (req,res) => { //redirected here when you sign in
    const email = req.body.email;
    const name = req.body.name;
    const skills = req.body.skills;
    const pass = req.body.password;
    const allJobPostings = await getAllJobPostings();
    console.log("THisi is swipe!!")
    let user1 = {name: name, email: email, skills: skills, pass: pass}
    // users.push(user1); //adds the new user to the users array
    const result = await applicantCollection.insertOne(user1)
    res.render("SwipeMechanism.ejs", {user: user1, allJobPostings});
});

async function getAllJobPostings() {
    const result = await recruitersCollection.find().toArray()
    const allPostings = []
    if(result) {
        for(let company of result) {
            const postings = company.jobPostings
            for(let posting of postings) {
                allPostings.push(posting)
            }
        }
    }

    // console.log(allPostings)
    return allPostings
}

async function getUsers() {
    const result = await applicantCollection.find().toArray()
    const allUsers = []
    if(result) {
        for(let userss of result) {
            const name = userss.name;
            const email = userss.email;
            const skills = userss.skills;
            allUsers.push({name: name, email: email, skills: skills});
        }
    }
    return allUsers;
}

app.get("/", (req,res) => {
    res.render("index.ejs");
});


app.get('/login/:rec', (req,res) => {
    res.send('Login page');
})

app.get("/getapplicants", async (req, res) => {
    const cursor = applicantCollection.find({});
    const applicants = await cursor.toArray();
    
    const result = res.json({ applicants })
})

app.get("/swiperight", (req, res) => {
    const {email, image, title, description, qualifications} = req.query
    console.log(email,image,title,description,qualifications)
})

app.listen(port, () => {
    console.log(`port: ${port} is up and running!`);
});