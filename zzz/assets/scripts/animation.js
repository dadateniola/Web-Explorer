//Parameters
const select = (e) => document.querySelector(e);
const selectAll = (e) => document.querySelectorAll(e);
const selectWith = (p, e) => p.querySelector(e);
const selectAllWith = (p, e) => p.querySelectorAll(e);
const create = (e) => document.createElement(e);
const root = (e) => getComputedStyle(select(':root')).getPropertyValue(e);

const hasPriority = ['[data-fe-update-all]', '[data-fe-return]' ]
const duration = 0.3;
const stagger = 0.1
const menuWidth = root('--menu-width')

const disableEvents = (condition = false) => {
    selectAll(`a, button, ${hasPriority.join(", ")}`).forEach((element) => {
        if (condition) {
            element.setAttribute('disabled', 'true');
            element.classList.add('off');

            if (element.tagName === 'A') {
                element.dataset.href = element.href;
                element.addEventListener('click', preventDefault);
            }
        } else {
            selectAll(`a, button, ${hasPriority.join(", ")}`).forEach((element) => {
                element.removeAttribute('disabled');
                element.classList.remove('off');

                if (element.tagName === 'A') {
                    element.setAttribute('href', element.dataset.href);
                    element.removeEventListener('click', preventDefault);
                }
            });
        }
    });
}
const preventDefault = (event) => event.preventDefault();

const clear = (elems = []) => elems.forEach(e => e.innerHTML = '');

const assignPower = (parent) => {
    const elems = (parent) ? selectAllWith(parent, `${hasPriority.join(", ")}`) : selectAll(`${hasPriority.join(", ")}`);
    elems.forEach(trigger => trigger.addEventListener("click", () => {
        disableEvents(true);
        new Updater({ trigger })
    }))
};

const attachAlert = () => {
    const alert = select('.alert');
    if(!alert.hasAttribute('data-fe-message')) return 'close'; 
    
    const message = alert.getAttribute('data-fe-message');
    alert.innerHTML = '';

    const parts = message.split('.');
    const sentences = create('div');

    for (let i = 0; i < parts.length; i++) {
        if(!parts[i].length) continue;
        const p = create('p');
        p.innerHTML = parts[i].charAt(0).toUpperCase() + parts[i].slice(1) + '.';
        sentences.appendChild(p)
    }
      
    alert.removeAttribute('data-fe-message')
    Array.from(sentences.children).forEach(elem => alert.appendChild(elem))

    return 'open';
}


//All animations
class Animations {
    constructor(params = {}) {
        Object.assign(this, params)

        this.init();
    }

    init() {
        //Setup Parameters
        this.setupParameters();

        // Loader params
        const isLoader = this?.loader;

        // Alert params
        const isAlert = (this?.alert) ? (this?.alert == 'open') ? 'open' : 'close' : false;

        //Menu params
        const isMenu = this?.menu;
        const isMenuClose = isMenu ? this.menu?.close : false;

        //Header params
        const isHead = this?.head;

        const tl = gsap.timeline();

        tl.call(() => {
            disableEvents(true);
        })

        //Animation conditions
        if (isLoader) tl.to(this.loaderBox, { opacity: 1 })

        if (isHead) tl.add(this.headerAnim());
        if (isAlert) tl.add(this.alertAnim(isAlert))
        if (isMenu) (isMenuClose) ? tl.add(this.menuCloseAnim()) : tl.add(this.menuOpenAnim())

        tl.to('.loader-box', { opacity: 0 }, '<')
        tl.call(() => {
            disableEvents();
        })

    }

    setupParameters() {
        // Loader params
        this.loaderBox = select('.loader-box');

        // Alert params
        this.alertBox = select('.alert-box');
        this.alertBtns = selectAllWith(this.alertBox, '.alert-action > *');
        this.currentAlert = selectWith(this.alertBox, '.alert');

        //Menu params
        this.content = select('section.content');
        this.menuBox = select('.menu-box');
        this.menuItems = selectAllWith(this.menuBox, '.menu-item>*');
        this.menuOpen = select('.menu-open');
        this.menuClose = select('.menu-close');
        this.itemsBox = selectAll('.items-box');

        //Header params
        this.headers = selectAll('.navigator .headers > *, .navigator .head h1');
        this.overlay = Array.from(selectAll('.overlay'));
    }

    //Animations
    menuOpenAnim() {
        const tl = gsap.timeline();

        tl
            .set(this.menuItems, { opacity: 0, y: 100 })
            .to(this.menuOpen, { y: -100 })
            .call(() => {
                const columns = parseInt(root('--columns'), 10);
                select(':root').style.setProperty('--columns', (columns == 1) ? columns : columns - 1)
            })
            .to(this.content, { width: `calc(100% - ${menuWidth})`, ease: 'expo.out' })
            .to(this.menuBox, { width: menuWidth, ease: 'expo.out' }, '<')
            .to(this.menuItems, { y: 0, stagger: 0.1, opacity: 1, ease: 'back.out' })

        return tl;
    }

    menuCloseAnim() {
        const tl = gsap.timeline();

        tl
            .to(Array.from(this.menuItems).reverse(), { y: 100, stagger: 0.1, opacity: 0, ease: 'back.in' })
            .call(() => {
                const columns = parseInt(root('--columns'), 10);
                select(':root').style.setProperty('--columns', (columns == 1) ? columns : columns + 1)
            })
            .to(this.content, { width: '100%', ease: 'expo.out' })
            .to(this.menuBox, { width: 0, ease: 'expo.out' }, '<')
            .to(this.menuOpen, { y: 0 }, '<')

        return tl;
    }

    headerAnim() {
        const tl = gsap.timeline();

        tl.set(this.headers, { x: -200 })
        if (this.overlay.length) {
            tl.to(this.overlay.slice(0, 9), { xPercent: 110, stagger, duration })
            if(this.overlay.length > 10) tl.to(this.overlay.slice(9), { xPercent: 110, duration }, '<')
        }
        tl.to(this.headers, { x: 0, opacity: 1, stagger: -stagger, duration }, '<')

        return tl;
    }

    alertAnim(type) {
        const tl = gsap.timeline();

        if (type == 'open') {
            tl
                .set(this.alertBtns, { y: 100, opacity: 0 })
                .set(this.currentAlert, { x: 100, opacity: 0 })
                .set(this.alertBox, { display: 'block' })
                .to(this.alertBtns, { y: 0, opacity: 1, stagger: 0.1, ease: 'Back.easeOut' })
                .to(this.currentAlert, { x: 0, opacity: 1, ease: 'Back.easeOut', duration: 0.5 }, '<')
        } else {
            tl
                .to(this.alertBtns, { y: 100, opacity: 0, stagger: 0.1, ease: 'Back.easeIn' })
                .to(this.currentAlert, { opacity: 0, duration: 1 })
                .set(this.alertBox, { display: 'none' })
        }

        return tl;
    }
}

//Page Updater
class Updater {
    constructor(params = {}) {
        if (typeof params == "object") Object.assign(this, params);

        this.items = select('.items');
        this.init();
    }

    async init() {
        const options = this.checkPriority();

        const response = await fetch('/getFiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(options)
        })
        const params = await response.json();

        this.updateDom(params);
    }

    checkPriority() {
        let priority = '';
        let filePath = '';

        if (this.trigger.hasAttribute('data-fe-update-all')) {
            priority = "all";
            filePath = this.trigger.getAttribute('data-path');
        }

        if (this.trigger.hasAttribute('data-fe-return')) {
            filePath = '..';
        }

        return { priority, filePath }
    }

    updateDom(params = {}) {
        const tl = gsap.timeline();

        const { tempDoc, headers } = this.createItems(params);
        const overlays = Array.from(selectAll('.overlay'));

        tl
            .set(this.items, { overflowY: 'hidden' })
            .to('.loader-box', { opacity: 1 })
            .to(overlays.slice(0, 9), { xPercent: 0, stagger, duration }, '0')
            if(overlays.length > 10) tl.to(overlays.slice(9), { xPercent: 0, duration }, '<')
        tl
            .to(this.items, { opacity: 0 })
            .to('.navigator .headers > *, .navigator .head h1', { x: 100, opacity: 0, stagger: -stagger }, '0')
            .call(() => {
                const headersBox = select('.headers-box');
                const head = select('.navigator .head h1');

                clear([headersBox, head, this.items])

                headersBox.appendChild(headers);
                head.innerHTML = params?.route?.head;
                Array.from(tempDoc.children).forEach(elem => this.items.appendChild(elem))

                new Animations({ head: true });
            })
            .set(this.items, { overflowY: 'scroll' })
            .to(this.items, { opacity: 1 })
            .call(() => {
                this.items.scrollTop = 0;
                assignPower(this.items);
                new Animations({ alert: attachAlert() })
            })
    }

    createItems({ files, route }) {
        const tempDoc = create('div');
        const headers = create('div');
        const alert = select('.alert')

        if(files?.alert) alert.setAttribute('data-fe-message', files.alert)

        headers.classList.add('headers');
        headers.innerHTML = route?.html;

        for (const item in files) {
            if (!files[item].length) continue;
            if(item == 'alert') continue;
            if (item == 'error') {
                const error = create('div');

                error.classList.add('error')
                error.innerHTML = `<h1>${files[item]}</h1>`

                tempDoc.append(error);

                break;
            }

            const itemsHead = create('div');
            const itemsBox = create('div');

            itemsHead.classList.add('items-head');
            itemsBox.classList.add('items-box');

            for (let i = 0; i < files[item].length; i++) {
                const current = files[item][i];
                const filePath = `${route?.staticPath}/${current}`;

                const currentItem = create('div');
                const itemImg = create('div');
                const itemText = create('p');
                const overlay = create('div');

                currentItem.classList.add('item');
                overlay.classList.add('overlay');
                itemImg.classList.add('item-img', 'img-here');

                itemImg.innerHTML = this.checkItemType({ item, filePath, current })
                itemText.title = current;
                itemText.innerHTML = current;

                currentItem.append(overlay, itemImg, itemText);
                itemsBox.append(currentItem);
            }

            itemsHead.innerHTML = `<div class="overlay"></div>
                                    <h1>${item}s</h1>`;
            tempDoc.append(itemsHead, itemsBox);
        }

        return { tempDoc, headers };
    }

    checkItemType({ item, filePath, current }) {
        var html = '';

        if (item == 'image') {
            html = `<a href="${filePath}" target="_blank"><img src="${filePath}" alt="item"></a>`;
        } else if (item == 'video') {
            html = `<video src="${filePath}" controls></video>`
        } else {
            const isFolder = (item == 'folder') ? `data-fe-update-all data-path='${current}'` : '';

            html = `<div class="item-cont" ${isFolder}>
                        <i class="fa-solid fa-${item}"></i>
                    </div>`
        }

        return html;
    }
}