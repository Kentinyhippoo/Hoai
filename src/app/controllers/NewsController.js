
class NewsController {

  index(req,res) {
    res.render('news');
  }

  show(req,res) {
    res.send('NEWS DETAIL !!!');
  }

  news1(req,res,next) {
    res.render('news/new1');
  }
  news2(req,res,next) {
    res.render('news/new2');
  }
}

module.exports = new NewsController;