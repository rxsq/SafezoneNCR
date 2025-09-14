require('dotenv').config();
const { sequelize, models } = require('../src/db');

async function run() {
  await sequelize.sync({ force: true });

  // Positions
  await models.Position.bulkCreate([
    { posDescription: 'Inspector' },   // 1
    { posDescription: 'Engineer' },    // 2
    { posDescription: 'Purchasing' },  // 3
    { posDescription: 'Supervisor' },  // 4
    { posDescription: 'Administrator'} // 5
  ]);

  // Employees (fixed login: admin/password)
  await models.Employee.bulkCreate([
    { empID:1, empFirst:"Jane", empLast:"Smith", empEmail:"jane.smith@example.com", empPhone:"9876543210", empUsername:"janesmith", empPassword:"password", posID:1 },
    { empID:2, empFirst:"Bob", empLast:"Johnson", empEmail:"bob.johnson@example.com", empPhone:"5555555555", empUsername:"bobjohnson", empPassword:"password", posID:2 },
    { empID:3, empFirst:"Alice", empLast:"Brown", empEmail:"alice.brown@example.com", empPhone:"4444444444", empUsername:"alicebrown", empPassword:"password", posID:3 },
    { empID:4, empFirst:"Eve", empLast:"Wilson", empEmail:"eve.wilson@example.com", empPhone:"3333333333", empUsername:"evewilson", empPassword:"password", posID:4 },
    { empID:5, empFirst:"Administrator", empLast:"", empEmail:"michael.scott@example.com", empPhone:"2222222222", empUsername:"admin", empPassword:"password", posID:5 }
  ], { individualHooks: true });

  // Suppliers
  const sups = await models.Supplier.bulkCreate([
    { supName:'Acme Coating',   supContactName:'Sam Coat',  supContactEmail:'sam@acme.com',    supContactPhone:'5551112222', supAddress:'1 Main', supCity:'Austin', supCountry:'USA' },
    { supName:'ElectroParts',   supContactName:'Eli Parts', supContactEmail:'eli@electro.com', supContactPhone:'5552223333', supAddress:'2 Main', supCity:'Dallas', supCountry:'USA' }
  ]);

  // Products
  const prods = await models.Product.bulkCreate([
    { prodName:'Paint Coating', prodCategory:'Surface Treatment', supID:sups[0].supID },
    { prodName:'Resistor',      prodCategory:'Electrical Components', supID:sups[1].supID }
  ]);

  // Status
  await models.NCRStatus.bulkCreate([
    { ncrStatusName:'Open' },  // 1
    { ncrStatusName:'Closed' } // 2
  ]);

  // Forms
  const qf = await models.QualityForm.create({
    qualItemDesc:'Defect A', qualIssueDesc:'Scratch', qualItemID:1001,
    qualSalesOrderNo:5001, qualQtyReceived:100, qualQtyDefective:3,
    qualItemNonConforming:3, qualRepID:1, qualDate:'2024-11-01'
  });
  const ef = await models.EngineerForm.create({
    engRootCause:'Improper setup', engDisposition:'Rework', engOwnerID:2, engDate:'2024-11-02'
  });
  const pf = await models.PurchasingForm.create({
    purDisposition:'Supplier credit', purAction:'RMA', purOwnerID:3, purDate:'2024-11-03'
  });

  // NCRs
  const ncrs = await models.NCRForm.bulkCreate([
    { ncrFormNo:'NCR-0001', ncrIssueDate:'2024-11-05', prodID:prods[0].prodID, qualFormID:qf.qualFormID, engFormID:ef.engFormID, purFormID:pf.purFormID, ncrStage:'QUA', ncrStatusID:1 },
    { ncrFormNo:'NCR-0002', ncrIssueDate:'2024-11-06', prodID:prods[1].prodID, qualFormID:qf.qualFormID, ncrStage:'ENG', ncrStatusID:1 }
  ]);

  // NCR_Employee links
  await models.NCREmployee.bulkCreate([
    { empID:1, ncrFormID:ncrs[0].ncrFormID },
    { empID:2, ncrFormID:ncrs[0].ncrFormID },
    { empID:3, ncrFormID:ncrs[1].ncrFormID },
  ]);

  console.log('Seed complete.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Seed failed', e);
  process.exit(1);
});
