const { models } = require('../db');

const NCR = models.NCRForm;
const Product = models.Product;
const Supplier = models.Supplier;

function fmtYM(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(+dt)) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  return y + '-' + m;
}

exports.overview = async (req, res) => {
  try {
    if (!NCR || !Product || !Supplier) {
      console.error('Model(s) missing in registry:', Object.keys(models));
      return res.status(500).json({ error: 'Failed to compute analytics' });
    }

    const formsPromise = NCR.findAll({
      attributes: [
        'ncrFormID',
        'ncrFormNo',
        'ncrIssueDate',
        'ncrStage',
        'ncrStatusID',
        'prodID',
        'createdAt'
      ],
      order: [['ncrIssueDate', 'DESC'], ['createdAt', 'DESC']],
      raw: true
    });

    const productsPromise = Product.findAll({
      attributes: ['prodID', 'supID', 'prodName', 'prodCategory'],
      raw: true
    });

    const suppliersPromise = Supplier.findAll({
      attributes: ['supID', 'supName'],
      raw: true
    });

    const results = await Promise.all([
      formsPromise,
      productsPromise,
      suppliersPromise
    ]);

    const forms = results[0];
    const products = results[1];
    const suppliers = results[2];

    const total = forms.length;
    const openCount = forms.filter(function (f) { return Number(f.ncrStatusID) === 1; }).length;
    const closedCount = forms.filter(function (f) { return Number(f.ncrStatusID) === 2; }).length;

    const stageCounts = { QUA: 0, ENG: 0, PUR: 0, ARC: 0 };
    for (var i = 0; i < forms.length; i++) {
      var stage = forms[i].ncrStage || 'UNK';
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    }

    var labelsLast12 = [];
    var now = new Date();
    for (var j = 11; j >= 0; j--) {
      var d = new Date(now.getFullYear(), now.getMonth() - j, 1);
      var lab = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      labelsLast12.push(lab);
    }

    var monthCountMap = {};
    for (var k = 0; k < forms.length; k++) {
      var key = fmtYM(forms[k].ncrIssueDate || forms[k].createdAt);
      if (!key) continue;
      monthCountMap[key] = (monthCountMap[key] || 0) + 1;
    }
    var monthCounts = labelsLast12.map(function (l) { return monthCountMap[l] || 0; });

    var prodById = new Map(products.map(function (p) { return [p.prodID, p]; }));
    var supplierById = new Map(suppliers.map(function (s) { return [s.supID, s.supName]; }));
    var supplierCountsMap = {};
    for (var t = 0; t < forms.length; t++) {
      var prod = prodById.get(forms[t].prodID);
      var supID = prod && prod.supID;
      var name = supplierById.get(supID) || 'Unknown';
      supplierCountsMap[name] = (supplierCountsMap[name] || 0) + 1;
    }
    var supplierCounts = Object.keys(supplierCountsMap)
      .map(function (label) { return { label: label, value: supplierCountsMap[label] }; })
      .sort(function (a, b) { return b.value - a.value; })
      .slice(0, 15);

    var recentOpen = forms
      .filter(function (f) { return Number(f.ncrStatusID) === 1; })
      .sort(function (a, b) {
        var da = new Date(a.ncrIssueDate || a.createdAt || 0);
        var db = new Date(b.ncrIssueDate || b.createdAt || 0);
        return db - da;
      })
      .slice(0, 5);

    res.json({
      totals: { total: total, open: openCount, closed: closedCount },
      stages: stageCounts,
      months: { labels: labelsLast12, counts: monthCounts },
      suppliers: supplierCounts,
      recentOpen: recentOpen
    });
  } catch (err) {
    console.error('Analytics overview failed:', err);
    res.status(500).json({ error: 'Failed to compute analytics' });
  }
};
