const Router = {
    routes: {},
    
    register(path, handler) {
        this.routes[path] = handler;
    },
    
    navigate(path) {
        window.location.hash = path;
    },
    
    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        const [route, queryString] = hash.split('?');
        const params = new URLSearchParams(queryString);
        
        const handler = this.routes[route] || this.routes['home'];
        if (handler) handler(params);
    },
    
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }
};

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}