const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const {
  sequelize,
  Employee,
  EmployeePosition,
  Supplier,
  Product,
  NcrStatus,
  NcrQualityForm,
  NcrEngineerForm,
  NcrPurchasingForm,
  NcrForm,
  NcrEmployee,
  Notification,
} = require("../db/models");

function range(n, startAt = 1) {
  return Array.from({ length: n }, (_, i) => i + startAt);
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN(arr, n) {
  const a = [...arr];
  const out = [];
  n = Math.min(n, a.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * a.length);
    out.push(a[idx]);
    a.splice(idx, 1);
  }
  return out;
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

(async () => {
  try {
    await sequelize.sync({ force: true });

    // 1) Positions
    const positions = [
      { posID: 1, posDescription: "Operator" },
      { posID: 2, posDescription: "Engineer" },
      { posID: 3, posDescription: "Inspector" },
      { posID: 4, posDescription: "Supervisor" },
      { posID: 5, posDescription: "Administrator" },
    ];
    await EmployeePosition.bulkCreate(positions);

    // 2) Employees (your fixed set)
    const fixedEmployees = [
      {
        empID: 1,
        empFirst: "Jane",
        empLast: "Smith",
        empEmail: "jane.smith@example.com",
        empPhone: "9876543210",
        empUsername: "janesmith",
        empPassword: bcrypt.hashSync("password", 10),
        posID: 1,
      },
      {
        empID: 2,
        empFirst: "Bob",
        empLast: "Johnson",
        empEmail: "bob.johnson@example.com",
        empPhone: "5555555555",
        empUsername: "bobjohnson",
        empPassword: bcrypt.hashSync("password", 10),
        posID: 2,
      },
      {
        empID: 3,
        empFirst: "Alice",
        empLast: "Brown",
        empEmail: "alice.brown@example.com",
        empPhone: "4444444444",
        empUsername: "alicebrown",
        empPassword: bcrypt.hashSync("password", 10),
        posID: 3,
      },
      {
        empID: 4,
        empFirst: "Eve",
        empLast: "Wilson",
        empEmail: "eve.wilson@example.com",
        empPhone: "3333333333",
        empUsername: "evewilson",
        empPassword: bcrypt.hashSync("password", 10),
        posID: 4,
      },
      {
        empID: 5,
        empFirst: "Administrator",
        empLast: "",
        empEmail: "michael.scott@example.com",
        empPhone: "2222222222",
        empUsername: "admin",
        empPassword: bcrypt.hashSync("password", 10),
        posID: 5,
      },
    ];
    await Employee.bulkCreate(fixedEmployees);

    // 3) Suppliers
    const supplierCount = 12;
    const suppliers = range(supplierCount).map((i) => ({
      supID: i,
      supContactName: faker.person.fullName(),
      supContactEmail: faker.internet.email().toLowerCase(),
      supContactPhone: faker.phone.number(),
      supName: faker.company.name(),
      supAddress: faker.location.streetAddress(),
      supCity: faker.location.city(),
      supCountry: faker.location.country(),
    }));
    await Supplier.bulkCreate(suppliers);

    // 4) Products
    const productCount = 30;
    const productCategories = [
      "Surface Treatment",
      "Electrical Components",
      "Mechanical Parts",
      "Fabrication",
      "Packaging Materials",
      "Industrial Chemicals",
      "Automotive",
      "Machine Tools",
      "Metals",
      "Plastics",
      "Woodworking",
      "Aerospace Components",
      "Hardware",
    ];
    const products = range(productCount).map((i) => ({
      prodID: i,
      prodName: faker.commerce.productName(),
      prodCategory: pick(productCategories),
      supID: randInt(1, supplierCount),
    }));
    await Product.bulkCreate(products);

    // 5) NCR Status
    const statuses = [
      { ncrStatusID: 1, ncrStatus: "OPEN" },
      { ncrStatusID: 2, ncrStatus: "INPRG" },
      { ncrStatusID: 3, ncrStatus: "CLSD" },
    ];
    await NcrStatus.bulkCreate(statuses);

    // 6) Quality forms
    const qCount = 20;
    const qualityForms = range(qCount).map((i) => ({
      qualFormID: i,
      qualIssueDesc: faker.commerce.productAdjective() + " defect",
      qualItemID: randInt(100, 999),
      qualImageFileName: faker.system.fileName(),
      qualSalesOrderNo: randInt(10000, 99999),
      qualQtyReceived: randInt(10, 500),
      qualQtyDefective: randInt(0, 20),
      qualItemNonConforming: randInt(0, 1),
      qualRepID: randInt(1, fixedEmployees.length),
      qualDate: faker.date.past({ years: 1 }).toISOString().slice(0, 10),
      qualFormSupplierProcess: pick(["Incoming", "Supplier Process", "N/A"]),
      qualFormProductionProcess: pick([
        "Assembly",
        "Welding",
        "Painting",
        "Machining",
      ]),
      qualItemDesc: faker.commerce.productDescription(),
    }));
    await NcrQualityForm.bulkCreate(qualityForms);

    // 7) Engineer forms
    const eCount = 18;
    const engineerForms = range(eCount).map((i) => ({
      engFormID: i,
      engReview: pick(["OK", "Rework", "Scrap", "Accept as-is"]),
      engCustNotification: pick(["Y", "N"]),
      engDispositionDesc: faker.lorem.sentence(),
      engDrawingUpdate: pick(["Y", "N"]),
      engRevisionNo: "R" + randInt(0, 5),
      engUpdatedRevisionNo: "R" + randInt(0, 6),
      engID: randInt(1, fixedEmployees.length),
      engDate: faker.date.past({ years: 1 }).toISOString().slice(0, 10),
      engUpdatedRevisionDate: faker.date
        .past({ years: 1 })
        .toISOString()
        .slice(0, 10),
    }));
    await NcrEngineerForm.bulkCreate(engineerForms);

    // 8) Purchasing forms
    const pCount = 18;
    const purchasingForms = range(pCount).map((i) => ({
      purFormID: i,
      purDescription: faker.lorem.sentence(),
      purCarRaised: pick(["Y", "N"]),
      purCarNo: "CAR-" + randInt(1000, 9999),
      purFollowUpReq: pick(["Y", "N"]),
      purFollowUpType: pick(["Email", "Call", "Visit"]),
      purFollowUpDate: faker.date.soon({ days: 30 }).toISOString().slice(0, 10),
      purInspectorID: randInt(1, fixedEmployees.length),
      purNCRClosingDate: faker.date
        .soon({ days: 60 })
        .toISOString()
        .slice(0, 10),
    }));
    await NcrPurchasingForm.bulkCreate(purchasingForms);

    // 9) NCR forms
    const ncrCount = 30;
    const ncrForms = range(ncrCount).map((i) => ({
      ncrFormID: i,
      ncrFormNo: `NCR-${String(i).padStart(4, "0")}`,
      qualFormID: randInt(1, qCount),
      engFormID: randInt(1, eCount),
      purFormID: randInt(1, pCount),
      prodID: randInt(1, productCount),
      ncrStatusID: randInt(1, 3),
      ncrIssueDate: faker.date.past({ years: 1 }).toISOString().slice(0, 10),
      ncrStage: pick(["Quality", "Engineering", "Purchasing", "Closed"]),
    }));
    await NcrForm.bulkCreate(ncrForms);

    // 10) NCR_Employee
    const ncrEmployees = [];
    let ncrEmpIDCounter = 1;
    for (const f of ncrForms) {
      const assignees = pickN(range(fixedEmployees.length), randInt(1, 3));
      for (const emp of assignees) {
        ncrEmployees.push({
          ncrEmpID: ncrEmpIDCounter++,
          empID: emp,
          ncrFormID: f.ncrFormID,
        });
      }
    }
    await NcrEmployee.bulkCreate(ncrEmployees);

    // 11) Notifications
    const notifications = [];
    let notifId = 1;
    for (const f of ncrForms) {
      const count = randInt(0, 2);
      for (let k = 0; k < count; k++) {
        notifications.push({
          id: notifId++,
          ncrFormID: f.ncrFormID,
          user_id: randInt(1, fixedEmployees.length),
          message: pick([
            "New NCR assigned",
            "NCR status changed",
            "Follow-up required",
            "Engineering review added",
            "Purchasing action pending",
          ]),
          status: pick(["unread", "read"]),
          created_at: faker.date.recent({ days: 10 }).toISOString(),
        });
      }
    }
    await Notification.bulkCreate(notifications);

    console.log("Seed complete.");
    process.exit(0);
  } catch (e) {
    console.error("Seed failed:", e);
    process.exit(1);
  }
})();
