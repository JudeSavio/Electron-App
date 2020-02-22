const fs= require('fs');
var path = require('path');

const {shell} = require('electron');

let items = document.getElementById('items')

//readerJS - Simply reading contents of reader.js not requiring
var filePath = path.join(__dirname,'reader.js')
fs.readFile(filePath,(err,data)=>{
    readerJS = data.toString()
})

exports.storage = JSON.parse(localStorage.getItem('readit-items')) || [];

//Listen for done with reader window
window.addEventListener('message', e=>{
    if(e.data.action === 'delete-reader-item')
    {
        this.delete(e.data.itemIndex)
        e.source.close()
    }
})

exports.delete = itemIndex => {
    items.removeChild(items.childNodes[itemIndex])

    this.storage.splice(itemIndex, 1)

    this.save()

    //Selecting an item after deleting one
    if(this.storage.length){
        let newSelectedItemIndex = (itemIndex === 0) ? 0 : itemIndex -1 ;
        console.log(newSelectedItemIndex);
        document.getElementsByClassName('read-item')[newSelectedItemIndex].classList.add('selected')
    }
}

//Get actual Index of item
exports.getSelectedItem = () => {
    let currentItem = document.getElementsByClassName('read-item selected')[0]

    //Get item index
    let itemIndex =0;
    let child = currentItem;
    while( (child = child.previousSibling) != null) itemIndex++;

    return { node : currentItem , index : itemIndex}
}

exports.save = () => {
    localStorage.setItem('readit-items', JSON.stringify(this.storage) )
}

exports.select = e =>{
    this.getSelectedItem().node.classList.remove('selected')
    e.currentTarget.classList.add('selected')
}

exports.changeSelection = direction => {
    let currentItem =this.getSelectedItem();

    if(direction === 'ArrowUp' && currentItem.node.previousSibling) {
        currentItem.node.classList.remove('selected');
        currentItem.node.previousSibling.classList.add('selected')
    }
    else if(direction === 'ArrowDown' && currentItem.nextSibling){
        currentItem.node.classList.remove('selected');
        currentItem.node.nextElementSibling.classList.add('selected');
    }
}

exports.openNative = () => {
    if(!this.storage.length ) return
    let selectedItem = this.getSelectedItem();
    shell.openExternal(selectedItem.node.dataset.url)
}

exports.open = () => {
    // Checking if Items exist
    if(!this.storage.length) return

    let selectedItem = this.getSelectedItem()

    let contentURL = selectedItem.node.dataset.url

    //Easiest way to open a window from inside : proxy browser
    let readerWin = window.open(contentURL,'',`
      maxWidth=2000,
      maxHeight=0,
      width=1200,
      height=800,
      backgroundColor=#DEDEDE,
      nodeIntegration=0,
      contextIsolation=1
    `)

    //Injecting javascript
    readerWin.eval(readerJS.replace('{{index}}',selectedItem.index))
}

exports.addItem = (item , isNew= false) =>{
    //Create DOM
    let itemNode = document.createElement('div')

    //Assign "css - class"
    itemNode.setAttribute('class','read-item')

    itemNode.setAttribute('data-url',item.url)

    //Inner HTML
    itemNode.innerHTML = '<img src='+item.screenshot+'><h2>'+item.title+'</h2>'

    //Append new node to 'items'
    items.appendChild(itemNode);

    itemNode.addEventListener('click',this.select)

    itemNode.addEventListener('dblclick',this.open)

    if(document.getElementsByClassName('read-item').length === 1){
        itemNode.classList.add('selected');
    }

    if(isNew)
    {
        this.storage.push(item);
        this.save();
    }

}

//Add items from storage when app loads
this.storage.forEach(item => {
    this.addItem(item, false)
})
