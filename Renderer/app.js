const {ipcRenderer} = require('electron');
const items = require('./items')

let showModal = document.getElementById('show-modal');
let closeModal = document.getElementById('close-modal');
let modal = document.getElementById('modal');
let addItem = document.getElementById('add-item');
let itemUrl = document.getElementById('url');
let search = document.getElementById('search');

// menu's add menu item
window.newItem = () => {
    showModal.click()
}

window.openItem = items.open

window.deleteItem = () => {
    let selectedItem = items.getSelectedItem()
    items.delete(selectedItem.index)
}

window.openItemNative = () => {
    items.openNative()
}

window.searchItems = () => {
    search.focus()
}

//Event Listener for search Tab
search.addEventListener('keyup', e => {
    //Looping items in list
    Array.from(document.getElementsByClassName('read-item')).forEach(item =>{
        let hasMatch = item.innerText.toLowerCase().includes(search.value)
        item.style.display = hasMatch ? 'flex' : 'none' ;
    })
})

//Navigating List with Keys
document.addEventListener('keydown',e => {
    if(e.key == 'ArrowUp' || e.key == 'ArrowDown')
    {
        items.changeSelection(e.key)
    }
})

//Disable and enable modal buttons
const toggleModalButtons = () => {
    if(addItem.disabled === true){
        addItem.disabled = false ;
        addItem.style.opacity = 1;
        addItem.innerText = 'Add Item';
        closeModal.style.display = 'inline';

    } else {
        addItem.disabled = true ;
        addItem.style.opacity = 0.5;
        addItem.innerText = 'Adding...';
        closeModal.style.display = 'none';
    }
}

//Show modal 

showModal.addEventListener('click', e => {
    modal.style.display = 'flex';
    itemUrl.focus();
})

//Hiding modal 

closeModal.addEventListener('click', e => {
    modal.style.display = 'none'
})

// Handling newly added new items

addItem.addEventListener('click', e => {
    // check a url exists
    if(itemUrl.value){
        ipcRenderer.send('new-item',itemUrl.value)
        toggleModalButtons();
    }
})

ipcRenderer.on('new-item-success', (e,newItem) => {
    
    //Adding Items returned from main process
    items.addItem(newItem, true);

    toggleModalButtons();
    modal.style.display= 'none';
    itemUrl.value='';
})

// Listening for key Event

itemUrl.addEventListener('keyup', e => {
    if(e.key=='Enter') addItem.click();
})