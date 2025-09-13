class CFSidebar extends HTMLElement {
  connectedCallback() {
    const path = location.pathname.replace(/\/+$/, "");
    this.innerHTML = `
      <div class="sidebar" id="sidebar">
        <div class="logo-content">
          <div class="logo">
            <a href="index.html">
              <img src="../assets/crossfire_logo_edited.png" alt="Logo for CrossFire Niagara" />
            </a>
          </div>
          <i class="bi bi-list" id="btn-close"></i>
        </div>

        <ul class="nav-list">
          <li>
            <a href="index.html" data-bs-toggle="tooltip" title="Dashboard" data-nav="index.html">
              <i class="bi bi-speedometer2"></i>
              <span class="links-name">Dashboard</span>
            </a>
          </li>
          <li id="create-ncr-nav" style="display: none">
            <a href="non-conformance-report.html" data-bs-toggle="tooltip" title="Create NCR" id="createNCRLink" data-nav="non-conformance-report.html">
              <i class="bi bi-file-earmark-plus"></i>
              <span class="links-name">Create NCR</span>
            </a>
          </li>
          <li>
            <a href="ncr-log.html" data-bs-toggle="tooltip" title="NCR Log" id="ncr-log-nav" data-nav="ncr-log.html">
              <i class="bi bi-card-list"></i>
              <span class="links-name">NCR Log</span>
            </a>
          </li>
          <li>
            <a href="ncr-data.html" data-bs-toggle="tooltip" title="NCR Data" id="ncr-data-nav" data-nav="ncr-data.html">
              <i class="bi bi-bar-chart"></i>
              <span class="links-name">NCR Data</span>
            </a>
          </li>
          <li>
            <a href="product.html" data-bs-toggle="tooltip" title="Products" id="products-nav" data-nav="product.html">
              <i class="bi bi-box-seam"></i>
              <span class="links-name">Products</span>
            </a>
          </li>
          <li id="employees-nav" style="display: none">
            <a href="Employee.html" data-bs-toggle="tooltip" title="Employees" data-nav="Employee.html">
              <i class="bi bi-people"></i>
              <span class="links-name">Employees</span>
            </a>
          </li>
          <li>
            <a href="supplier.html" data-bs-toggle="tooltip" title="Supplier" id="suppliers-nav" data-nav="supplier.html">
              <i class="bi bi-truck"></i>
              <span class="links-name">Suppliers</span>
            </a>
          </li>
        </ul>

        <div class="notification-container">
          <a href="#" class="notification-link" data-bs-toggle="modal" data-bs-target="#notificationModal">
            <i class="bi bi-bell"></i>
            <span class="notification-label">Notifications</span>
            <span id="notificationCount" class="badge bg-danger"></span>
          </a>
        </div>

        <div class="profile-content">
          <div class="profile">
            <div class="profile-details">
              <img src="/assets/crossfire_logo.PNG" alt="Logo for CrossFire Niagara" />
              <div class="name-job">
                <div class="name">CrossFire Niagara</div>
                <div class="job">Admin</div>
              </div>
            </div>
            <i class="bi bi-box-arrow-left" id="log-out"></i>
          </div>
        </div>
      </div>
    `;

    const links = this.querySelectorAll("a[data-nav]");
    links.forEach((a) => {
      const href = a.getAttribute("data-nav");
      const filename = path.split("/").pop() || "index.html";
      if (href === filename) {
        a.classList.add("active");
      }
    });

    if (window.bootstrap) {
      this.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
        try {
          new bootstrap.Tooltip(el);
        } catch {}
      });
    }

    const toggleBtn = this.querySelector("#btn-close");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("sidebar-collapsed");
      });
    }
  }
}
customElements.define("cf-sidebar", CFSidebar);
