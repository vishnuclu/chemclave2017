'use strict';

import User from './user.model';
import passport from 'passport';
import config from '../../config/environment';
import jwt from 'jsonwebtoken';

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function(err) {
    res.status(statusCode).json(err);
  }
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

/**
 * Get list of users
 * restriction: 'admin'
 */
export function Index(req, res) {
  return User.find({}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

export function userCount(req, res) {
  return User.find({role:'user'}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

export function interest(req,res){
  return User.findByIdAndUpdate(req.params.id,{accomodation_interest:req.body.value}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function accommodations(req, res) {
  return User.find({role:'user',accomodation_interest:'true'}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

export function accomApproved(req, res) {
  return User.find({role:'user',accomodation_status:'Approved'}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

export function accomodationIndex(req, res) {
  return User.find({role:'user',accomodation_status:'Pending'}, '-salt -password').exec()
    .then(users => {
      res.status(200).json(users);
    })
    .catch(handleError(res));
}

/**
 * Creates a new user
 */
export function create(req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  User.count({role:'user'},function(err,count){
     newUser.ID = "CC17" + (1000 + count + 1).toString().slice(1);

     newUser.save()
    .then(function(user) {
      var token = jwt.sign({ _id: user._id }, config.secrets.session, {
        expiresIn: 60 * 60 * 5
      });
      res.json({ token });
    })
    .catch(validationError(res)); 
  
  });
}

/**
 * Get a single user
 */
export function show(req, res, next) {
  var userId = req.params.id;

  return User.findById(userId).exec()
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.json(user.profile);
    })
    .catch(err => next(err));
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
export function destroy(req, res) {
  return User.findByIdAndRemove(req.params.id).exec()
    .then(function() {
      res.status(204).end();
    })
    .catch(handleError(res));
}

/**
 * Change a users password
 */
export function changePassword(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  return User.findById(userId).exec()
    .then(user => {
      if (user.authenticate(oldPass)) {
        user.password = newPass;
        return user.save()
          .then(() => {
            res.status(204).end();
          })
          .catch(validationError(res));
      } else {
        return res.status(403).end();
      }
    });
}

export function AcceptAccom(req, res, next) {

  return User.findByIdAndUpdate(req.params.id,{accomodation_status:"Approved"}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function RejectAccom(req, res, next) {

  return User.findByIdAndUpdate(req.params.id,{accomodation_status:"Rejected"}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function RequestAccom(req, res, next) {

  return User.findByIdAndUpdate(req.params.id,{pdf_name:req.body.name,accomodation_status:"Pending"}).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function Register(req, res, next) {

  return User.findByIdAndUpdate(req.params.id,req.body).exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function upload(req,res){
  return res.redirect('/');
}

/**
 * Get my info
 */
export function me(req, res, next) {
  var userId = req.user._id;

  return User.findOne({ _id: userId }, '-salt -password').exec()
    .then(user => { // don't ever give out the password or salt
      if (!user) {
        return res.status(401).end();
      }
      res.json(user);
    })
    .catch(err => next(err));
}

/**
 * Authentication callback
 */
export function authCallback(req, res, next) {
  res.redirect('/');
}
