var express = require('express');
var router = express.Router();

async function adminAuth(req, res, next) {
  req.adminAuth(req, res, next);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Путь праведника труден,<br> ибо препятствуют ему себялюбивые и тираны из злых людей.<br> Блажен тот пастырь, кто во имя милосердия и доброты ведет слабых за собой сквозь долину тьмы, <br>ибо именно он и есть тот самый, кто воистину печется о ближних своих.");
});
router.get('/badbrowser', function(req, res, next) {
  console.log(1);
  res.render('badbrowser', );
});
router.get('/admin',(req, res, next)=>{req.adminAuth(req, res,next)}, function(req, res, next) {
  res.render('admin' );
});
router.get('/spk/:eventid', async (req, res, next)=> {
  let r=await req.knex.select("*").from("t_events").where({isDeleted:false, shortid:req.params.eventid});
  if(r.length==0)
  return  res.sendStatus(404);
  res.render('spk',{ spk:req.session.spk||null, eventid:req.params.eventid });
});
router.get('/emo/:eventid', function(req, res, next) {
  res.render('emoTitle', {eventid:req.params.eventid } );
});


module.exports = router;
