const express = require('express');
const router = express.Router();

const User = require('./../models/User');

const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
    var {name, username, email, password, dateOfBirth, gender, address, city, country, zipCode} = req.body;
    // name = name.trim();
    // email = email.trim();
    // username = username.trim();
    // password = password.trim();
    // dateOfBird = dateOfBird.trim();
    if(name == "" || email == "" || username == "" || password == "" || dateOfBirth == ""){
        res.send({
            status: "FAILED",
            message: "Empty input fields"
        });
    }
    else if(!/^[a-zA-Z ]*$/.test(name)){
        res.send({
            status: "FAILED",
            message: "Invalid name entered"
        });
    }
    else if(!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
        res.send({
            status: "FAILED",
            message: "Invalid email entered"
        });
    }
    else if(!new Date(dateOfBirth).getTime()){
        res.send({
            status: "FAILED",
            message: "Invalid date entered"
        });
    }
    else if(password.length < 8) {
        res.send({
            status: "FAILED",
            message: "Password is too short"
        });
    }
    else if(!/^[a-zA-Z0-9\s,'-]*$/.test(address) || !/^[a-zA-Z ]*$/.test(city) || !/^[a-zA-Z ]*$/.test(country)){
        res.send({
            status: "FAILED",
            message: "Invalid address entered"
        });
    }
    // else if(gender != "Male" || gender != "Female"){
    //     res.send({
    //         status: "FAILED",
    //         message: "Invalid gender entered"
    //     })
    // }
    else{
        User.find({email}).then(result => {
            if(result.length){
                res.send({
                    status: "FAILED",
                    message: "User with the provided email already exists"
                });
            }
            else{
                User.find({username}).then(result => {
                    if(result.length){
                        res.send({
                            status: "FAILED",
                            message: "User with the provided username already exists"
                        });
                    }
                    else{
                        const saltRounds = 10;
                        bcrypt.hash(password, saltRounds).then(hashedPassword => {
                            const newUser = new User({
                                name, 
                                username,
                                email,
                                password: hashedPassword,
                                dateOfBirth,
                                gender,
                                address,
                                city,
                                country,
                                zipCode,
                            });
                    
                            newUser.save().then(result => {
                                res.send({
                                    status: "SUCCESS",
                                    message: "Signup successful",
                                    data: result
                                })
                            })
                            .catch(err => {
                                res.send({
                                    status: "FAILED",
                                    message: "An error occurred while saving user account",
                                    error: err
                                })
                            })
                        })
                        .catch(err => {
                            res.send({
                                status: "FAILED",
                                message: "An error occurred while hashing password",
                                error: err
                            })
                        })
                    }
                })
            }
        }).catch(err => {
            console.log(err);
            res.send({
                status: "FAILED",
                message: "An error occured while checking for existing user!",
                error: err
            });
        });
    }
});

router.post('/signin', (req, res) => {
    let { username, password } = req.body;
    if(username == "" || password == ""){
        res.send({
            status: "FAILED",
            message: "Empty credentials supplied"
        });
    }
    else{
        User.find({ username })
        .then(data => {
            if(data.length){
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if(result){
                        res.send({
                            status: "SUCCESS",
                            message: "Signin successful",
                            data: data
                        });
                    }
                    else {
                        res.send({
                            status: "FAILED",
                            message: "Invalid password entered"
                        });
                    }
                })
                .catch(err => {
                    res.send({
                        status: "FAILED",
                        message: "An error occurred while comparing password",
                        error: err
                    });
                });
            }
            else{
                res.send({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(err => {
            res.send({
                status: "FAILED",
                message: "An error occurred while checking for existing user",
                error: err
            })
        })
    }
});


module.exports = router;