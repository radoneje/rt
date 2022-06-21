const express = require('express');
const router = express.Router();
const ShortUniqueId = require('short-unique-id');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post("/event" ,(req, res, next)=>{req.adminAuth(req, res,next)},async (req, res,next)=>{
  if(!req.body.event) {
    const uid = new ShortUniqueId({length: 6});
    uid.setDictionary('alphanum_lower');
    console.log("post event", uid())
    let r = await req.knex("t_events").insert({shortid: uid(), creatorId: req.session.admin.id}, "*");
    res.json(r[0])
  }
})
router.get('/event', (req, res, next)=>{req.adminAuth(req, res,next)},async function(req, res, next) {
  let r = await req.knex.select("*").from("t_events").where({isDeleted:false}).orderBy("date")
  res.json (r);
});
router.post('/spkLogin',async function(req, res, next) {
  try {
    let r = await req.knex("t_spk").insert({name: req.body.name, eventidshort: req.body.eventid}, "*")
    req.session.spk=r[0];
    return res.json(r[0]);
  }
  catch (e){
    console.warn(e)
  }
  res.sendStatus(404);
});
router.get('/spkLogOut', async function(req, res, next) {
    req.session.spk=null;
  res.sendStatus(200);
});
router.post('/emo',async function(req, res, next) {
  if(!req.session.spk)
    return res.sendStatus(404);
  req.addEmo(req.body.emoid, req.session.spk);
  return res.sendStatus(200);

});
router.get('/emo/:eventId',async function(req, res, next) {
  res.json(req.getEmo(req.params.eventId));
  req.delEmo(req.params.eventId)

});




module.exports = router;
