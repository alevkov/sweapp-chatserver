var express = require('express');
var router = express.Router();
var db = require('../db/db');
var ObjectId = require('mongodb').ObjectId;

// GET all Events for a Group
router.get('/group/:groupId', function(req, res) {
  db.Event.find({ 'groupId': ObjectId(req.params.groupId) }, function (err, events) {
    if (err || events === null)
      res.status(400).send([]);
    else
      res.status(200).send(events);
  });
});

// POST a new event for a Group
router.post('/group/:groupId/new', function(req, res) {
  var event = db.Event();
  event.name = req.body.name;
  event.description = req.body.description;
  event.dueDate = new Date(req.body.dueDate);
  event.completed = false;
  event.groupId = ObjectId(req.params.groupId);
  event.save(function (err, event) {
    if (err || event === null) {
      res.status(500).send({error: "Error saving event to DB"});
    } else {
      console.log("New event:");
      console.log("Event name = " + event.name);
      res.status(200).send(event);
    }
  });
});

// PATCH an event
router.patch('/:id', function(req, res) {
  db.Event.findOne({ '_id': ObjectId(req.params.id) }, function (err, event) {
    if (err || event === null)
      res.status(400).send({ error: "No event found for Id" });
    else {
      var updatedEvent = req.body;
      var id = req.params.id;
      db.Event.update({_id  : ObjectId(id)}, {$set: updatedEvent}, function (err, event) {
        if (err || event === null)
          res.status(500).send({ error: "Error saving event" });
        else
          res.status(200).send(event);
      });
    }
  })
});

// DELETE an event
router.delete('/:id/delete', function (req, res) {
  db.Event.findOne({ '_id': req.params.id }, function (err, event) {
    if (err || event === null)
      res.status(404).send({ error: "Event not found" });
    else {
      event.remove();
      res.status(200).send({ success: "Event deleted" });
    }
  });
});

module.exports = router;