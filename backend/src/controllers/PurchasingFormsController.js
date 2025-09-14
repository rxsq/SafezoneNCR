const BaseService = require('../services/BaseService');
const { models } = require('../db');
const svc = new BaseService(models.PurchasingForm);

exports.list = (req, res) => svc.paged({ page: +req.query.page || 1, limit: +req.query.limit || 10 }).then(r=>res.json(r));
exports.get = (req, res)=> svc.get(req.params.id).then(r=>r?res.json(r):res.status(404).json({error:'Not found'}));
exports.create = (req,res,next)=> svc.create(req.body).then(r=>res.status(201).json(r)).catch(next);
exports.update = (req,res,next)=> svc.update(req.params.id, req.body).then(r=>r?res.json(r):res.status(404).json({error:'Not found'})).catch(next);
exports.remove = (req,res)=> svc.delete(req.params.id).then(ok=>ok?res.json({ok:true}):res.status(404).json({error:'Not found'}));
