require("dotenv").config();
const { sequelize, models } = require("../src/db");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function dateBetween(start, end) {
  const ts =
    start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(ts);
}
function pad(n, len = 4) {
  return String(n).padStart(len, "0");
}

/** Chunking helper to keep memory/SQL sizes reasonable */
async function bulkCreateChunked(Model, records, options = {}, chunk = 200) {
  for (let i = 0; i < records.length; i += chunk) {
    const slice = records.slice(i, i + chunk);
    // eslint-disable-next-line no-await-in-loop
    await Model.bulkCreate(slice, options);
  }
}

async function run() {
  // Consider wrapping in a single transaction if you want atomic seeding
  // const t = await sequelize.transaction();
  // try { ... await t.commit(); } catch (e) { await t.rollback(); throw e; }

  await sequelize.sync({ force: true });

  // Positions
  await models.Position.bulkCreate([
    { posDescription: "Inspector" }, // 1
    { posDescription: "Engineer" }, // 2
    { posDescription: "Purchasing" }, // 3
    { posDescription: "Supervisor" }, // 4
    { posDescription: "Administrator" }, // 5
  ]);

  // Employees (fixed login: admin/password)
  await models.Employee.bulkCreate(
    [
      {
        empID: 1,
        empFirst: "Jane",
        empLast: "Smith",
        empEmail: "jane.smith@example.com",
        empPhone: "9876543210",
        empUsername: "janesmith",
        empPassword: "password",
        posID: 1,
      },
      {
        empID: 2,
        empFirst: "Bob",
        empLast: "Johnson",
        empEmail: "bob.johnson@example.com",
        empPhone: "5555555555",
        empUsername: "bobjohnson",
        empPassword: "password",
        posID: 2,
      },
      {
        empID: 3,
        empFirst: "Alice",
        empLast: "Brown",
        empEmail: "alice.brown@example.com",
        empPhone: "4444444444",
        empUsername: "alicebrown",
        empPassword: "password",
        posID: 3,
      },
      {
        empID: 4,
        empFirst: "Eve",
        empLast: "Wilson",
        empEmail: "eve.wilson@example.com",
        empPhone: "3333333333",
        empUsername: "evewilson",
        empPassword: "password",
        posID: 4,
      },
      {
        empID: 5,
        empFirst: "Administrator",
        empLast: "",
        empEmail: "michael.scott@example.com",
        empPhone: "2222222222",
        empUsername: "admin",
        empPassword: "password",
        posID: 5,
      },
    ],
    { individualHooks: true }
  );

  // Suppliers (base few)
  const supsBase = await models.Supplier.bulkCreate(
    [
      {
        supName: "Acme Coating",
        supContactName: "Sam Coat",
        supContactEmail: "sam@acme.com",
        supContactPhone: "5551112222",
        supAddress: "1 Main",
        supCity: "Austin",
        supCountry: "USA",
      },
      {
        supName: "ElectroParts",
        supContactName: "Eli Parts",
        supContactEmail: "eli@electro.com",
        supContactPhone: "5552223333",
        supAddress: "2 Main",
        supCity: "Dallas",
        supCountry: "USA",
      },
    ],
    { returning: true }
  );

  // Products (base few)
  const prodsBase = await models.Product.bulkCreate(
    [
      {
        prodName: "Paint Coating",
        prodCategory: "Surface Treatment",
        supID: supsBase[0].supID,
      },
      {
        prodName: "Resistor",
        prodCategory: "Electrical Components",
        supID: supsBase[1].supID,
      },
    ],
    { returning: true }
  );

  // Status
  await models.NCRStatus.bulkCreate([
    { ncrStatusName: "Open" }, // 1
    { ncrStatusName: "Closed" }, // 2
  ]);

  // Forms (base few)
  const qf = await models.QualityForm.create({
    qualItemDesc: "Defect A",
    qualIssueDesc: "Scratch",
    qualItemID: 1001,
    qualSalesOrderNo: 5001,
    qualQtyReceived: 100,
    qualQtyDefective: 3,
    qualItemNonConforming: 3,
    qualRepID: 1,
    qualDate: "2024-11-01",
  });
  const ef = await models.EngineerForm.create({
    engRootCause: "Improper setup",
    engDisposition: "Rework",
    engOwnerID: 2,
    engDate: "2024-11-02",
  });
  const pf = await models.PurchasingForm.create({
    purDisposition: "Supplier credit",
    purAction: "RMA",
    purOwnerID: 3,
    purDate: "2024-11-03",
  });

  // NCRs (base few)
  const ncrsBase = await models.NCRForm.bulkCreate(
    [
      {
        ncrFormNo: "NCR-0001",
        ncrIssueDate: "2024-11-05",
        prodID: prodsBase[0].prodID,
        qualFormID: qf.qualFormID,
        engFormID: ef.engFormID,
        purFormID: pf.purFormID,
        ncrStage: "QUA",
        ncrStatusID: 1,
      },
      {
        ncrFormNo: "NCR-0002",
        ncrIssueDate: "2024-11-06",
        prodID: prodsBase[1].prodID,
        qualFormID: qf.qualFormID,
        ncrStage: "ENG",
        ncrStatusID: 1,
      },
    ],
    { returning: true }
  );

  // NCR_Employee links (base few)
  await models.NCREmployee.bulkCreate([
    { empID: 1, ncrFormID: ncrsBase[0].ncrFormID },
    { empID: 2, ncrFormID: ncrsBase[0].ncrFormID },
    { empID: 3, ncrFormID: ncrsBase[1].ncrFormID },
  ]);

  /* -----------------------------------------------------------
   * SCALED DATA
   * -----------------------------------------------------------
   * - More suppliers (~30)
   * - More products (~300)
   * - Many NCRs (1000+), each with QualityForm, and sometimes ENG/PUR
   * --------------------------------------------------------- */

  // --- Suppliers+Products pools ---
  const extraSupplierCount = 30;
  const supplierCities = [
    "Austin",
    "Dallas",
    "Phoenix",
    "Denver",
    "Seattle",
    "Portland",
    "San Jose",
    "Chicago",
    "Atlanta",
    "Miami",
    "Toronto",
    "Montreal",
  ];
  const supplierCountries = ["USA", "Canada", "Mexico"];

  const extraSuppliers = Array.from({ length: extraSupplierCount }).map(
    (_, i) => {
      const city = pick(supplierCities);
      const name = `Supplier ${i + 1}`;
      const contact = `Contact ${i + 1}`;
      return {
        supName: name,
        supContactName: contact,
        supContactEmail: `${name
          .toLowerCase()
          .replace(/\s+/g, "")}@example.com`,
        supContactPhone: `555${randInt(1000000, 9999999)}`,
        supAddress: `${randInt(10, 999)} Industrial Ave`,
        supCity: city,
        supCountry: pick(supplierCountries),
      };
    }
  );

  await bulkCreateChunked(models.Supplier, extraSuppliers);
  const allSuppliers = await models.Supplier.findAll({
    attributes: ["supID"],
    order: [["supID", "ASC"]],
  });

  // Generate product categories & names
  const categories = [
    "Surface Treatment",
    "Electrical Components",
    "Mechanical Parts",
    "Fasteners",
    "Packaging",
    "Cables & Harnesses",
    "Adhesives",
    "Plastics",
    "Consumables",
  ];
  const baseNames = [
    "Bracket",
    "Coating",
    "Sealant",
    "Screw",
    "Bolt",
    "Washer",
    "Capacitor",
    "Resistor",
    "Connector",
    "Cable",
    "Sleeve",
    "Housing",
    "Gasket",
    "Adhesive",
    "Tape",
  ];

  const extraProductCount = 300;
  const extraProducts = Array.from({ length: extraProductCount }).map(
    (_, i) => {
      const sup = pick(allSuppliers);
      const cat = pick(categories);
      const name = `${pick(baseNames)} ${pad(i + 1, 3)}`;
      return {
        prodName: name,
        prodCategory: cat,
        supID: sup.supID,
      };
    }
  );

  await bulkCreateChunked(models.Product, extraProducts);
  const allProducts = await models.Product.findAll({
    attributes: ["prodID"],
    order: [["prodID", "ASC"]],
  });

  // --- NCRs massive generation ---
  const totalNcr = 1000; // tweak higher/lower as you like
  const stages = ["QUA", "ENG", "PUR", "CLO"]; // simple stage codes
  const startDate = new Date("2024-01-01T00:00:00Z");
  const endDate = new Date("2025-09-01T00:00:00Z");

  // We’ll build arrays of forms, then NCRs referencing them
  // Each NCR gets a QualityForm; ~70% get EngineerForm; ~40% get PurchasingForm
  const qualityForms = [];
  const engineerForms = [];
  const purchasingForms = [];
  const ncrRows = [];

  for (let i = 0; i < totalNcr; i++) {
    const issueDate = dateBetween(startDate, endDate);
    const itemID = randInt(1000, 9999);
    const qtyRecv = randInt(10, 1000);
    const qtyDef = randInt(0, Math.max(1, Math.floor(qtyRecv * 0.1)));
    const repID = randInt(1, 5); // employee IDs 1..5

    qualityForms.push({
      qualItemDesc: `Defect ${String.fromCharCode(65 + (i % 26))}`, // A..Z
      qualIssueDesc: pick([
        "Scratch",
        "Dent",
        "Misaligned",
        "Discoloration",
        "Crack",
        "Incorrect Part",
        "Contamination",
      ]),
      qualItemID: itemID,
      qualSalesOrderNo: randInt(1000, 9999),
      qualQtyReceived: qtyRecv,
      qualQtyDefective: qtyDef,
      qualItemNonConforming: qtyDef,
      qualRepID: repID,
      qualDate: issueDate,
    });

    // Engineer/Purchasing forms created later and indexed by NCR if needed
    if (Math.random() < 0.7) {
      engineerForms.push({
        engRootCause: pick([
          "Improper setup",
          "Material defect",
          "Process variation",
          "Design gap",
          "Handling damage",
        ]),
        engDisposition: pick([
          "Rework",
          "Use-as-is",
          "Scrap",
          "Return to supplier",
        ]),
        engOwnerID: randInt(1, 5),
        engDate: issueDate,
      });
    } else {
      engineerForms.push(null);
    }

    if (Math.random() < 0.4) {
      purchasingForms.push({
        purDisposition: pick([
          "Supplier credit",
          "Replace material",
          "Expedite shipment",
          "RMA",
        ]),
        purAction: pick(["RMA", "Credit memo", "Reship", "Notify supplier"]),
        purOwnerID: randInt(1, 5),
        purDate: issueDate,
      });
    } else {
      purchasingForms.push(null);
    }
  }

  // Insert QualityForms first (all)
  const createdQF = await bulkCreateAndReturn(models.QualityForm, qualityForms);

  // Insert optional EngineerForms and record their indices/IDs
  const createdEF = [];
  for (let i = 0; i < engineerForms.length; i += 200) {
    const slice = engineerForms.slice(i, i + 200);
    const toCreate = slice.map((ef) => ef || {}); // keep index alignment
    const created = await Promise.all(
      toCreate.map((ef) =>
        ef.engRootCause ? models.EngineerForm.create(ef) : null
      )
    );
    created.forEach((row, j) => {
      createdEF[i + j] = row;
    });
  }

  // Insert optional PurchasingForms
  const createdPF = [];
  for (let i = 0; i < purchasingForms.length; i += 200) {
    const slice = purchasingForms.slice(i, i + 200);
    const created = await Promise.all(
      slice.map((pf) =>
        pf?.purDisposition ? models.PurchasingForm.create(pf) : null
      )
    );
    created.forEach((row, j) => {
      createdPF[i + j] = row;
    });
  }

  // Build NCR rows referencing created forms and random products
  for (let i = 0; i < totalNcr; i++) {
    const q = createdQF[i];
    const e = createdEF[i];
    const p = createdPF[i];
    const prod = pick(allProducts);

    const issueDate = q.qualDate;
    const statusID = Math.random() < 0.7 ? 1 : 2; // skew toward Open
    const stage = pick(stages);

    ncrRows.push({
      ncrFormNo: `NCR-${pad(i + 3, 4)}`, // continue after your base NCR-0001/0002
      ncrIssueDate: issueDate,
      prodID: prod.prodID,
      qualFormID: q.qualFormID,
      engFormID: e ? e.engFormID : null,
      purFormID: p ? p.purFormID : null,
      ncrStage: stage,
      ncrStatusID: statusID,
    });
  }

  // Insert NCRs in chunks
  await bulkCreateChunked(models.NCRForm, ncrRows);

  // Link NCRs to employees randomly (1–3 employees per NCR)
  // Fetch IDs to link
  const allNcrs = await models.NCRForm.findAll({
    attributes: ["ncrFormID"],
    order: [["ncrFormID", "ASC"]],
  });
  const employeeIDs = [1, 2, 3, 4, 5];

  const linkRows = [];
  // Skip the very first 2 (already linked), start from index 2
  for (let i = 2; i < allNcrs.length; i++) {
    const links = randInt(1, 3);
    const selected = new Set();
    for (let j = 0; j < links; j++) {
      selected.add(pick(employeeIDs));
    }
    for (const empID of selected) {
      linkRows.push({ empID, ncrFormID: allNcrs[i].ncrFormID });
    }
  }
  await bulkCreateChunked(models.NCREmployee, linkRows);

  const COUNT_THIS_MONTH = 120; // e.g. ~4/day avg
  await seedThisMonthRealistic(COUNT_THIS_MONTH);

  console.log("Seed complete with scaled data.");
  process.exit(0);
}

// Helper to get returning rows in chunks without overwhelming memory
async function bulkCreateAndReturn(Model, records, chunk = 200) {
  const out = [];
  for (let i = 0; i < records.length; i += chunk) {
    const slice = records.slice(i, i + chunk);
    // eslint-disable-next-line no-await-in-loop
    const created = await Model.bulkCreate(slice, { returning: true });
    out.push(...created);
  }
  return out;
}

async function seedThisMonthRealistic(count) {
  // Find the next NCR number index (continue from existing max)
  const last = await models.NCRForm.findOne({
    attributes: ["ncrFormNo", "ncrFormID"],
    order: [["ncrFormID", "DESC"]],
    raw: true,
  });
  const lastIdx = (() => {
    const m = (last?.ncrFormNo || "").match(/NCR-(\d+)/);
    return m ? parseInt(m[1], 10) : 2; // you already created NCR-0001..0002
  })();

  // Month boundaries (local time ok; we only store date parts)
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Build a weighted day list (Tue–Thu heavier, weekends light)
  const dayWeights = []; // index by date.getDate()
  for (let d = 1; d <= end.getDate(); d++) {
    const tmp = new Date(now.getFullYear(), now.getMonth(), d);
    const dow = tmp.getDay(); // 0 Sun .. 6 Sat
    let w = 1;
    if (dow === 0 || dow === 6) w = 0.4; // weekends
    else if (dow === 1 || dow === 5) w = 0.8; // Mon/Fri
    else w = 1.2; // Tue–Thu
    dayWeights[d] = w;
  }
  const totalW = dayWeights.slice(1).reduce((a, b) => a + b, 0);

  // Helper: sample a day index using weights
  function pickDay() {
    let r = Math.random() * totalW;
    for (let d = 1; d <= end.getDate(); d++) {
      r -= dayWeights[d];
      if (r <= 0) return d;
    }
    return end.getDate();
  }

  // Pull products & employees for linking
  const allProducts = await models.Product.findAll({
    attributes: ["prodID", "supID"],
    order: [["prodID", "ASC"]],
    raw: true,
  });
  const employeeIDs = [1, 2, 3, 4, 5];

  // Skews
  const stagePool = ["QUA", "ENG", "PUR", "CLO"];
  const issueTypes = [
    "Scratch",
    "Dent",
    "Misaligned",
    "Discoloration",
    "Crack",
    "Incorrect Part",
    "Contamination",
  ];

  // Build rows
  const qualityForms = [];
  const engineerForms = [];
  const purchasingForms = [];
  const ncrRows = [];

  for (let i = 0; i < count; i++) {
    const day = pickDay();
    const issueDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      day,
      9,
      Math.floor(Math.random() * 50)
    ); // morning-ish

    const prod = allProducts[Math.floor(Math.random() * allProducts.length)];
    const qtyRecv = Math.floor(10 + Math.random() * 900);
    const qtyDef = Math.max(
      0,
      Math.floor(qtyRecv * (0.01 + Math.random() * 0.08))
    ); // ~1–9% defects

    // QualityForm (always)
    qualityForms.push({
      qualItemDesc: `Defect ${String.fromCharCode(65 + (i % 26))}`,
      qualIssueDesc: issueTypes[Math.floor(Math.random() * issueTypes.length)],
      qualItemID: 1000 + Math.floor(Math.random() * 9000),
      qualSalesOrderNo: 4000 + Math.floor(Math.random() * 6000),
      qualQtyReceived: qtyRecv,
      qualQtyDefective: qtyDef,
      qualItemNonConforming: qtyDef,
      qualRepID: employeeIDs[Math.floor(Math.random() * employeeIDs.length)],
      qualDate: issueDate,
    });

    // Optional Engineer/Purchasing
    const doEng = Math.random() < 0.65;
    engineerForms.push(
      doEng
        ? {
            engRootCause: [
              "Improper setup",
              "Material defect",
              "Process variation",
              "Design gap",
              "Handling damage",
            ][Math.floor(Math.random() * 5)],
            engDisposition: [
              "Rework",
              "Use-as-is",
              "Scrap",
              "Return to supplier",
            ][Math.floor(Math.random() * 4)],
            engOwnerID:
              employeeIDs[Math.floor(Math.random() * employeeIDs.length)],
            engDate: issueDate,
          }
        : null
    );

    const doPur = Math.random() < 0.35;
    purchasingForms.push(
      doPur
        ? {
            purDisposition: [
              "Supplier credit",
              "Replace material",
              "Expedite shipment",
              "RMA",
            ][Math.floor(Math.random() * 4)],
            purAction: ["RMA", "Credit memo", "Reship", "Notify supplier"][
              Math.floor(Math.random() * 4)
            ],
            purOwnerID:
              employeeIDs[Math.floor(Math.random() * employeeIDs.length)],
            purDate: issueDate,
          }
        : null
    );
  }

  // Insert QF
  const createdQF = await bulkCreateAndReturn(
    models.QualityForm,
    qualityForms,
    250
  );

  // Insert ENG/PUR preserving index alignment
  const createdEF = new Array(count).fill(null);
  for (let i = 0; i < count; i += 200) {
    const slice = engineerForms.slice(i, i + 200);
    const created = await Promise.all(
      slice.map((ef) => (ef ? models.EngineerForm.create(ef) : null))
    );
    created.forEach((row, j) => (createdEF[i + j] = row));
  }
  const createdPF = new Array(count).fill(null);
  for (let i = 0; i < count; i += 200) {
    const slice = purchasingForms.slice(i, i + 200);
    const created = await Promise.all(
      slice.map((pf) => (pf ? models.PurchasingForm.create(pf) : null))
    );
    created.forEach((row, j) => (createdPF[i + j] = row));
  }

  // Build NCR rows
  for (let i = 0; i < count; i++) {
    const q = createdQF[i];
    const e = createdEF[i];
    const p = createdPF[i];
    const issueDate = q.qualDate;

    const statusID = Math.random() < 0.7 ? 1 : 2; // skew Open
    const stage = stagePool[Math.floor(Math.random() * stagePool.length)];

    ncrRows.push({
      ncrFormNo: `NCR-${String(lastIdx + 1 + i).padStart(4, "0")}`,
      ncrIssueDate: issueDate,
      prodID:
        allProducts[Math.floor(Math.random() * allProducts.length)].prodID,
      qualFormID: q.qualFormID,
      engFormID: e ? e.engFormID : null,
      purFormID: p ? p.purFormID : null,
      ncrStage: stage,
      ncrStatusID: statusID,
      createdAt: issueDate,
      updatedAt: issueDate,
    });
  }

  await bulkCreateChunked(models.NCRForm, ncrRows, {}, 250);

  // Link 1–2 employees per NCR
  const freshNcrs = await models.NCRForm.findAll({
    attributes: ["ncrFormID"],
    where: { ncrFormNo: ncrRows.map((r) => r.ncrFormNo) },
    raw: true,
  });
  const links = [];
  for (const row of freshNcrs) {
    const countEmployees = 1 + Math.floor(Math.random() * 2);
    const chosen = new Set();
    while (chosen.size < countEmployees)
      chosen.add(employeeIDs[Math.floor(Math.random() * employeeIDs.length)]);
    for (const empID of chosen) links.push({ empID, ncrFormID: row.ncrFormID });
  }
  await bulkCreateChunked(models.NCREmployee, links, {}, 250);

  console.log(`Seeded ${count} NCRs for ${start.toISOString().slice(0, 7)}.`);
}

run().catch((e) => {
  console.error("Seed failed", e);
  process.exit(1);
});
