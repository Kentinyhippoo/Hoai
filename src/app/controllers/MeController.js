const { multipleMongooseToObject, mongooseToObject } = require('../../util/mongoose');
const Course = require('../models/Course');
const Dish = require('../models/Dish')

class MeController {
  // [GET]    /stored/courses
  storedCourses(req, res, next) {

    if (req.query.hasOwnProperty('_sort')) {
      res.json({ message: 'successfully!!!' });
    }

    // Promise
    Promise.all([Dish.find({}), Dish.countDocumentsDeleted()])
      .then(([dishes,deletedCount]) =>  
          res.render('me/stored-courses', {
            deletedCount,
            dishes: multipleMongooseToObject(dishes),
          })
      )
      .catch(next);
  }

  // [GET]    /trash/courses
  trashCourses(req, res, next) {
    Dish.findDeleted({}) 
      .then((dishes) => 
        res.render('me/trash-courses', {
          dishes: multipleMongooseToObject(dishes),
        }), 
      )
      .catch(next);
  }
}

module.exports = new MeController();