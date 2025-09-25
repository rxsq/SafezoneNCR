const BaseService = require("../services/BaseService");
const { models } = require("../db");
const svc = new BaseService(models.Product);
const { Op } = require("sequelize");

exports.list = (req, res) =>
  svc
    .paged({ page: +req.query.page || 1, limit: +req.query.limit || 10 })
    .then((r) => res.json(r));
exports.get = (req, res) =>
  svc
    .get(req.params.id)
    .then((r) =>
      r ? res.json(r) : res.status(404).json({ error: "Not found" })
    );
exports.options = async (req, res, next) => {
  try {
    const fields = (req.query.fields || "prodID,prodName")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const where = {};
    if (req.query.supID) where.supID = +req.query.supID || 0;

    if (req.query.q) {
      const term = String(req.query.q).trim();
      if (term) where.prodName = { [Op.iLike]: `%${term}%` };
    }

    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit <= 0) limit = 1000;
    limit = Math.min(limit, 5000);

    const rows = await models.Product.findAll({
      attributes: fields,
      where,
      order: [["prodName", "ASC"]],
      limit,
    });

    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=300");
    res.json(rows);
  } catch (e) {
    next(e);
  }
};
exports.create = (req, res, next) =>
  svc
    .create(req.body)
    .then((r) => res.status(201).json(r))
    .catch(next);
exports.update = (req, res, next) =>
  svc
    .update(req.params.id, req.body)
    .then((r) =>
      r ? res.json(r) : res.status(404).json({ error: "Not found" })
    )
    .catch(next);
exports.remove = (req, res) =>
  svc
    .delete(req.params.id)
    .then((ok) =>
      ok ? res.json({ ok: true }) : res.status(404).json({ error: "Not found" })
    );
