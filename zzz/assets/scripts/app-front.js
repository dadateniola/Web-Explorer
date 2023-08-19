class PageSetup {
    constructor(params) {
        this.init();
    }

    init() {
        this.setupDoc();
        this.setupPower();
        assignPower();
    }

    setupDoc() {
        new Animations({ head: true, loader: true, alert: attachAlert() });
    }

    setupPower() {
        // Menu
        const menuOpen = select('.menu-open');
        const menuClose = select('.menu-close');
        menuOpen.addEventListener('click', () => new Animations({ menu: { open: true } }))
        menuClose.addEventListener('click', () => new Animations({ menu: { close: true } }))
        
        // Alert
        const alertClose = select('#alert-close');
        alertClose.addEventListener('click', () => new Animations({ alert: 'close' }))
    
        // Tooltip
        const toolTips = selectAll('[data-fe-tooltip]');
        toolTips.forEach(e => {
            const tooltip = create('div');
            const text = e.getAttribute('data-fe-tooltip')

            tooltip.classList.add('tooltip');
            tooltip.innerHTML = text;
            
            e.appendChild(tooltip);
        })
    }
}

window.onload = () => {
    //Run page setup
    new PageSetup();
}