const App = {
    render(html) {
        document.getElementById('app').innerHTML = html;
    },

    // ===== LOGIN PAGE =====
    renderLogin() {
        if (DB.isLoggedIn()) {
            Router.navigate(DB.isAdmin() ? 'admin-dashboard' : 'client-search');
            return;
        }

        this.render(`
            <div class="login-container">
                <div class="login-box fade-in">
                    <div class="login-logo">
                        <i class="fas fa-cube"></i>
                        <h1>Products Page</h1>
                    </div>
                    
                    <div id="loginError" class="alert alert-error hidden"></div>
                    
                    <div class="role-selector">
                        <div class="role-btn active" data-role="client" onclick="App.selectRole('client')">
                            <i class="fas fa-user"></i> Client
                        </div>
                        <div class="role-btn" data-role="admin" onclick="App.selectRole('admin')">
                            <i class="fas fa-user-shield"></i> Admin
                        </div>
                    </div>
                    
                    <form onsubmit="App.handleLogin(event)">
                        <input type="hidden" id="selectedRole" value="client">
                        
                        <div class="input-group">
                            <label><i class="fas fa-user"></i> Username</label>
                            <input type="text" id="username" placeholder="Enter username" required>
                        </div>
                        
                        <div class="input-group">
                            <label><i class="fas fa-lock"></i> Password</label>
                            <input type="password" id="password" placeholder="Enter password" required>
                        </div>
                        
                        <div class="input-group admin-code-field" id="adminCodeField">
                            <label><i class="fas fa-key"></i> Admin Secret Code</label>
                            <input type="password" id="adminCode" placeholder="Enter admin secret code">
                        </div>
                        
                        <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
                            <i class="fas fa-sign-in-alt"></i> Sign In
                        </button>
                    </form>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="#home" style="color: var(--accent-blue); text-decoration: none;">
                            <i class="fas fa-arrow-left"></i> Back to Home
                        </a>
                    </div>
                    
                    <div class="alert alert-info" style="margin-top: 20px; font-size: 13px;">
                        <strong>Demo Accounts:</strong><br>
                        Admin: admin / admin123 <br>
                        Client: client / client123
                    </div>
                </div>
            </div>
        `);
    },

    selectRole(role) {
        document.getElementById('selectedRole').value = role;
        document.querySelectorAll('.role-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.role === role);
        });
        document.getElementById('adminCodeField').classList.toggle('show', role === 'admin');
    },

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const role = document.getElementById('selectedRole').value;
        const adminCode = document.getElementById('adminCode')?.value || '';
        const errorDiv = document.getElementById('loginError');

        const user = DB.findUser(username, password);
        
        if (!user) {
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.classList.remove('hidden');
            return;
        }

        if (role === 'admin') {
            if (user.role !== 'admin') {
                errorDiv.textContent = 'This account does not have admin privileges';
                errorDiv.classList.remove('hidden');
                return;
            }
            if (!DB.verifyAdminCode(adminCode)) {
                errorDiv.textContent = 'Invalid admin secret code';
                errorDiv.classList.remove('hidden');
                return;
            }
        }

        DB.setCurrentUser({ ...user, loginRole: role });
        showToast('Login successful!', 'success');
        Router.navigate(role === 'admin' ? 'admin-dashboard' : 'client-search');
    },

    // ===== PUBLIC HOME PAGE =====
    renderHome() {
        const settings = DB.getAdminSettings();
        const links = [];
        if (settings.external_link_1?.enabled) links.push(settings.external_link_1);
        if (settings.external_link_2?.enabled) links.push(settings.external_link_2);

        this.render(`
            <div class="public-home">
                <nav class="public-nav">
                    <div class="logo">
                        <i class="fas fa-cube"></i>
                        <span>ProductHub</span>
                    </div>
                    <a href="#login" class="btn btn-primary" style="padding: 10px 20px;">
                        <i class="fas fa-sign-in-alt"></i>
                        <span class="hide-mobile">Login</span>
                    </a>
                </nav>
                
                <div class="hero-section fade-in">
                    <h1>Find Your Product</h1>
                    <p>Search by product number or URL to get detailed information</p>
                    
                    <div class="search-box">
                        <input type="text" id="homeSearch" placeholder="Enter product number or URL..." 
                            onkeypress="if(event.key==='Enter') App.publicSearch()">
                        <button onclick="App.publicSearch()">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    
                    ${links.length > 0 ? `
                        <div class="quick-links">
                            ${links.map(l => `
                                <a href="${l.url}" target="_blank" class="quick-link">
                                    <i class="fas fa-external-link-alt"></i>
                                    ${l.title}
                                </a>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `);
    },

    publicSearch() {
        const query = document.getElementById('homeSearch').value.trim();
        if (query) {
            Router.navigate('search?q=' + encodeURIComponent(query));
        }
    },

    // ===== ADMIN DASHBOARD =====
    renderAdminDashboard() {
        if (!DB.isAdmin()) {
            Router.navigate('login');
            return;
        }

        const products = DB.getProducts();
        const totalViews = DB.getTotalViews();
        const mostViewed = DB.getMostViewed();

        this.render(`
            <div class="dashboard">
                ${this.getSidebar('dashboard')}
                <div class="main-content">
                    ${this.getTopBar()}
                    
                    <div class="fade-in">
                        <h2 style="margin-bottom: 5px; color: var(--dark-blue);">Dashboard Overview</h2>
                        <p style="color: var(--dark-blue); opacity: 0.7; margin-bottom: 25px;">Welcome back, Admin!</p>
                        
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="icon">
                                    <i class="fas fa-boxes"></i>
                                </div>
                                <h3>${products.length}</h3>
                                <p>Total Products</p>
                            </div>
                            <div class="stat-card">
                                <div class="icon">
                                    <i class="fas fa-eye"></i>
                                </div>
                                <h3>${totalViews}</h3>
                                <p>Total Views</p>
                            </div>
                            <div class="stat-card">
                                <div class="icon">
                                    <i class="fas fa-trophy"></i>
                                </div>
                                <h3 style="font-size: 18px;">${mostViewed?.product_number || 'N/A'}</h3>
                                <p>Most Viewed Product</p>
                            </div>
                        </div>
                        
                        <h3 style="margin-bottom: 15px; color: var(--dark-blue);">Quick Actions</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <a href="#admin-add" class="btn btn-primary"><i class="fas fa-plus"></i> Add Product</a>
                            <a href="#admin-products" class="btn btn-primary"><i class="fas fa-edit"></i> Edit Products</a>
                            <a href="#admin-settings" class="btn btn-primary"><i class="fas fa-cog"></i> Settings</a>
                            <a href="#home" class="btn btn-secondary"><i class="fas fa-home"></i> View Site</a>
                        </div>
                    </div>
                </div>
            </div>
        `);
    },

    // ===== ADD PRODUCT PAGE =====
    renderAddProduct() {
        if (!DB.isAdmin()) {
            Router.navigate('login');
            return;
        }

        const customFields = DB.getCustomFields();

        this.render(`
            <div class="dashboard">
                ${this.getSidebar('add')}
                <div class="main-content">
                    ${this.getTopBar()}
                    
                    <div class="fade-in" style="max-width: 800px;">
                        <h2 style="margin-bottom: 5px; color: var(--dark-blue);">Add New Product</h2>
                        <p style="color: var(--dark-blue); opacity: 0.7; margin-bottom: 25px;">Fill in the product details below</p>
                        
                        <div id="successAlert" class="alert alert-success hidden">
                            <i class="fas fa-check-circle"></i> Product added successfully!
                        </div>
                        
                        <div class="card">
                            <div class="input-group">
                                <label>Product Number *</label>
                                <input type="text" id="productNumber" placeholder="e.g., PRD-001">
                            </div>
                            
                            <div class="input-group">
                                <label>Product Link</label>
                                <input type="url" id="productLink" placeholder="https://example.com/product">
                            </div>
                            
                            ${customFields.map(field => `
                                <div class="input-group">
                                    <label style="text-transform: capitalize;">${field}</label>
                                    <input type="text" id="field_${field}" placeholder="Enter ${field}">
                                </div>
                            `).join('')}
                            
                            <div style="display: flex; gap: 15px; margin-top: 20px; flex-wrap: wrap;">
                                <button onclick="App.saveProduct()" class="btn btn-primary" style="flex: 1; min-width: 150px;">
                                    <i class="fas fa-save"></i> Save Product
                                </button>
                                <a href="#admin-dashboard" class="btn btn-secondary" style="min-width: 100px;">Cancel</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `);
    },

    saveProduct() {
        const productNumber = document.getElementById('productNumber').value.trim();
        
        if (!productNumber) {
            showToast('Product number is required!', 'error');
            return;
        }

        const product = {
            product_number: productNumber,
            product_link: document.getElementById('productLink').value.trim(),
            icons: []
        };

        DB.getCustomFields().forEach(field => {
            const input = document.getElementById('field_' + field);
            if (input) product[field] = input.value.trim();
        });

        DB.addProduct(product);
        
        document.getElementById('successAlert').classList.remove('hidden');
        document.getElementById('productNumber').value = '';
        document.getElementById('productLink').value = '';

        showToast('Product added successfully!', 'success');

        setTimeout(() => {
            document.getElementById('successAlert').classList.add('hidden');
        }, 3000);
    },

    // ===== SIDEBAR HELPER =====
    getSidebar(active) {
        const items = [
            { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard', route: 'admin-dashboard' },
            { id: 'add', icon: 'fa-plus-circle', label: 'Add Product', route: 'admin-add' },
            { id: 'products', icon: 'fa-boxes', label: 'All Products', route: 'admin-products' },
            { id: 'settings', icon: 'fa-cog', label: 'Settings', route: 'admin-settings' }
        ];

        return `
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h2><i class="fas fa-cube"></i> ProductHub</h2>
                </div>
                <nav class="sidebar-nav">
                    ${items.map(item => `
                        <a href="#${item.route}" class="nav-item ${active === item.id ? 'active' : ''}">
                            <i class="fas ${item.icon}"></i>
                            ${item.label}
                        </a>
                    `).join('')}
                </nav>
                <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 15px; border-top: 1px solid var(--soft-blue);">
                    <a href="#home" class="nav-item">
                        <i class="fas fa-home"></i> Home
                    </a>
                    <a class="nav-item" onclick="App.logout()" style="cursor: pointer;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;
    },

    getTopBar() {
        const user = DB.getCurrentUser();
        return `
            <div class="top-bar">
                <div class="user-info">
                    <div style="width: 40px; height: 40px; background: var(--accent-blue); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                        ${user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span style="font-weight: 600; color: var(--dark-blue);">${user?.username || 'Admin'}</span>
                </div>
            </div>
        `;
    },

    logout() {
        DB.logout();
        showToast('Logged out successfully', 'success');
        Router.navigate('home');
    }
};

// ===== REGISTER ROUTES =====
Router.register('home', () => App.renderHome());
Router.register('login', () => App.renderLogin());
Router.register('admin-dashboard', () => App.renderAdminDashboard());
Router.register('admin-add', () => App.renderAddProduct());

// ===== START APP =====
Router.init();