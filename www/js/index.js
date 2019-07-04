class Expense {

    constructor(obj) {
        this._id = generateUUID();
        this.shop = obj.shop;
        this.desc = obj.desc;
        this.whenPurchased = obj.whenPurchased;
        this.total = obj.total;
        this.uploaded = false;
    }
    get expenseId() {
        return this._id;
    }
    get expenseUpLoaded (){
        return this.uploaded;
    }
           
}


var db;
var remoteCouch;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    
    onDeviceReady: function() {
       // this.receivedEvent('deviceready');
       console.log("Device is Ready ....")        
       ko.applyBindings(myViewModel);

       db = new PouchDB('expenses');
       remoteCouch = false;    
       setUpExpense ()
       showAllExpenses()
       $("#expenseip").click(function() {
           console.log("date clicked")
           $('#db1', window.parent.document).get(0).scrollIntoView();
        
       });

       cameraCleanup();

    //    $.datepicker.setDefaults({
    //     showOn: "both",
    //     buttonImageOnly: true,
    //     buttonImage: "calendar.gif",
    //     buttonText: "Calendar"
    //   });
    //   $.datepicker.formatDate( "yy-mm-dd", new Date( 2007, 1 - 1, 26 ) );
    },       
};

app.initialize();

var myViewModel = {    
    personName: ko.observable('Dave'),
    idip:ko.observable(0),
    shopid:ko.observable(''),
    descip:ko.observable(''),
    whenPurchasedip:ko.observable(''),
    totalip:ko.observable(''),
    imagePath: ko.observable(''),
    errorMsg: ko.observable(''),
    resultMsg: ko.observable(''),
    resultArr: ko.observableArray([]),
    expenses: ko.observableArray([]),

    editShop: ko.observable(''),
    editDesc: ko.observableArray([]),
    editTotal: ko.observable(''),
    editDate : ko.observable(''),
    editExpenses: ko.observableArray([]),


    takePicture : function() {       
       
        takePhotograph();
    },
    retrievePicture : function(){
        retrievePhotograph();
    },
    readPicture : function(){
        readPhotograph()
    },
   
    resetExpenseIP : function(){
        const x = this.idip()
        this.idip(x),
        this.shopid(''),
        this.descip(''),
        this.whenPurchasedip(''),
        this.totalip('')
    },
    
    addExpense : function(){         
        addNewExpense ();    
    },
    editExpense : function(el){
        //console.log(el)
       // editDisplay(el);
       findInDB("Tesco");
       
    },
    removeExpense : function(el){
        console.log(el);
       
        deleteExpense(el)
        showAllExpenses()
    },
    showExpenses : function(){
        showAllExpenses();
    }
};

//pouchdb
function showAllExpenses() {
    myViewModel.expenses([]);
    db.allDocs({
        include_docs: true,
        attachments: true
      }).then(function (result) {
        // handle result
        let res = result.rows;        
        res.forEach(function (item){
            myViewModel.expenses.push(item.doc);
        })
        
      }).then(function(){
        console.log("Refreshing List");
        refreshList()
      }).catch(function (err) {
        console.log(err);
      });
}

function addExpenceDB(expenceobj) {
    
    db.put(expenceobj, function callback(err, result) {
      if (!err) {
        console.log('Successfully posted a expense!');
      }
    });
}

function deleteExpense(expense) {
    db.remove(expense);
}

function updateExpense(expense){
    db.get('expense').then(function(doc) {
        return db.put({
          _id: 'expense',
          _rev: doc._rev,
          title: "Let's Dance"
        });
      }).then(function(response) {
        // handle response
      }).catch(function (err) {
        console.log(err);
      });
}

function findInDB (datatofind){

    db.find({
        selector: {shop: {$eq: datatofind}}
      }).then(function (result) {
        // handle result
        console.log(result)
      }).catch(function (err) {
        console.log(err);
      });
}

function deteteDB (){

    db.destroy().then(function (response) {
        // success
        console.log(response)
      }).catch(function (err) {
        console.log(err);
      });
}

function takePhotograph(){

    const srcType = Camera.PictureSourceType.CAMERA;

    const options = setOptions(srcType);

    navigator.camera.getPicture(onSuccess, onFail, options);
    
    function onSuccess(imageURI) {
       // var image = document.getElementById('myImage');
        myViewModel.imagePath(imageURI);
        console.log(imageURI)
        
    }
    
    function onFail(message) {
        myViewModel.errorMsg('Failed because: ' + message);
    }
}

function retrievePhotograph(){
    const srcType = Camera.PictureSourceType.PHOTOLIBRARY;
    const options = setOptions(srcType);

    navigator.camera.getPicture(onSuccess, onFail, options);
    
    function onSuccess(imageURI) {
       // var image = document.getElementById('myImage');
        myViewModel.imagePath(imageURI);
        console.log(imageURI)
        
    }
    
    function onFail(message) {
        myViewModel.errorMsg('Failed because: ' + message);
    }

}

function cameraCleanup(){
    navigator.camera.cleanup(
        onSuccess,
        onFail
    )
    function onSuccess(data){
        console.log("Cleanup Success");
    }
    function onFail(err){
        console.log("Cleanup fail");
        console.log(err);
    }

}
function setOptions(srcType) {
    // srcTypes
    // Camera.PictureSourceType.CAMERA;
    // Camera.PictureSourceType.PHOTOLIBRARY
    // Camera.PictureSourceType.SAVEDPHOTOALBUM

    // destinationType
    // DATA_URL 0   base64 encoded string
    // FILE_URL 1   file uri
    // NATIVE_URI 2 native uri

    // encodingType
    // JPEG
    // PNG

    // mediaType
    // PICTURE  0  still pictures
    // VIDEO    1  video only
    // ALLMEDIA 2  selection

    // saveToPhotoAlbum boolean 
    // cameraDirection 0 BACK || 1 FRONT 
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}

function readPhotograph(){

    const img = myViewModel.imagePath();
    let tempLine = [];
    let tempElement = []
    let dateArr = []
    let totalArr = []
    let priceArr = []
 
    MlKitPlugin.getText(img,{},function onSuccess(data) { 
        
                 
        const r = data.text;
        dateArr = findDate(r)
        console.log(dateArr)
        totalArr = findTotal(r);
        console.log(totalArr);
        console.log(checkContainsTotal(r));
        priceArr = checkContainsPrice(r);
        console.log(priceArr);

        //Create an array of text objects in eacl line of returned data
        
        for (var block of data.textBlocks){
             for (var line of block.lines){
                 tempLine.push(line)                
             }
        }
        // array is returned in no set order
        // sort array depending on center of bounding box top to bottom
        // sort array from left to right 
        tempLine = sortArray(tempLine);
        // TODO confirm or check if another way to do this
        // assumption the first element in the array is text represending the shop
        // where receipt is from
        myViewModel.editShop(tempLine[0].text)
        // dateArray contains array of regular expressions for date found in text
        // maybe set todays date if null or no date found 
        myViewModel.editDate(dateArr[0]);

        // used to show the returned recognised text

        myViewModel.resultArr(tempLine)

        
        
        let displayList = groupByLine(tempLine)       
        let stdisplay = '';
        let totalP = '';
        let strDisolayFiltered = '';            
        for (var itd in displayList){
             displayList[itd].forEach(function (e){               
                    stdisplay += e.text+" ";                              
            })
            stdisplay += "\n";
        }

        // filter the display and show only items that contain price

        let strArr = stdisplay.split("\n")
        strArr.forEach( function(item, index){
            if(checkContainsPrice(item)){
                strDisolayFiltered += item;
                console.log(item);    
                strDisolayFiltered += "\n";
                if(checkContainsTotal(item)){
                    totalP = item;
                }             
            }           
        })
        myViewModel.editTotal(getPriceFromTotal(totalP));
        myViewModel.editDesc(strDisolayFiltered);

        },
     
    function onFail(err) {
         console.log(err)
    });    
}

function sortArray(myA){
    // add to object tb top bottom average set to flor
    // add to object lr the left side of bounding box
    // sort array from top to bottom left to right
    myA.map(o => { o.tb = Math.floor((o.boundingBox.top + o.boundingBox.bottom)/200); return o}); 
    myA.map(o => { o.lr = o.boundingBox.left; return o});
    myA.sort(function(a,b){
        return a['tb'] - b['tb'] || a['lr'] - b['lr'];
    })
    return myA;
}

function groupByLine(myA){
    // group array to combine elements on the same line
    let verticalArr = myA.reduce((r, a) => {      
        r[a.tb] = [...r[a.tb] || [], a];
        return r;
    }, {});
    return verticalArr; 
}

//Regular Expressions

function findDate(str){
        // Regular expression to find date strings in form
        // dd/mm/yyyy
        // dd/jan/yyyy
        // return an array of all dates found
        // TODO consider format of mm/dd/yy

        let regeditNumbers = /\b\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}\b/ig;
        let regeditMonths = /(\b\d{1,2}\D{0,3})?(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|(Nov|Dec)(?:ember)?)\D?(\d{1,2}\D?)?\D?((19[7-9]\d|20\d{2})|\d{2})/ig
        let res1 = []
        let res2 = []
        if (regeditNumbers.test(str)){
            res1 = str.match(regeditNumbers)
        }if(regeditMonths.test(str)){
           res2 =str.match(regeditMonths)
        }
        return res1.concat(res2)       
}


function findTotal(str){

    // Regular expression to find total may not be needed use checkContainsTotal

    let regeditTotal = /Total?|(Bal(?:ance)?|Cash?\b\d{1,}[.]\d{2} )/ig;

    return str.match(regeditTotal);

}

function checkContainsPrice(str){
    // Regular expression  find if it contains a price xxx.xx space
    const regeditPrice = /\d{1,}[.]\d{2}\b/i;
    return regeditPrice.test(str);
}

function checkContainsTotal(str){
    //Regular expression to find if text contains dictionary
    //Total Bal Cash TODO may be more required
    let regeditTotal = /Total?|Bal(?:ance)?|Cash?/ig;
    return regeditTotal.test(str);
}

function getPriceFromTotal(str){
    // if line contains Total Bal Cash return the decmial value
    const regeditPrice = /\d{1,}[.]\d{2}/i;
    return str.match(regeditPrice);
}



function findLargest(myA){

    // not so simple largest textBlock not the largest lettering could cover multiple lines
    // may be needed if cant use first exement of array as shop
    const res = Math.max.apply(Math, myA.map(function (o) {
        return o.s;
    }))
    const obj = myA.find(function(o){
        return o.s == res;
    })
    return obj;
}


function setUpExpense (){
    myViewModel.expenses([]);    
};
function editDisplay(expense){    
    myViewModel.shopid(expense.shop),
    myViewModel.descip(expense.desc),
    myViewModel.whenPurchasedip(expense.whenPurchased),
    myViewModel.totalip(expense.total)

};

function addNewExpense (){
    let x = myViewModel.idip()
    x++;
    myViewModel.idip(x)
    const exp = {
        id:myViewModel.idip(),
        shop:myViewModel.shopid(),
        desc:myViewModel.descip(),
        whenPurchased:myViewModel.whenPurchasedip(),
        total:myViewModel.totalip()
    }

    //let exp1 = new Expense(exp);
    addExpenceDB(new Expense(exp))   
    console.log("lllllllllll    llllllll");

    myViewModel.resetExpenseIP();
    myViewModel.expenses.push(exp)     
    // $( "#expenseset" ).collapsibleset( "refresh" );
    // $( "#inputset" ).collapsibleset( "refresh" );
    refreshList();

   
   
};
function refreshList (){
    setTimeout(function(){
       
        $( "#expenseset" ).collapsibleset( "refresh" );

    },5);
}

function removeSomeExpense(el){
    console.log(el)
    let x = myViewModel.idip()
    x--;
    myViewModel.idip(x)
    if(x <= 0){
        myViewModel.idip(x)
    }

    let newArr = myViewModel.expenses();
    console.log(myViewModel.expenses().length);
    
    newArr = newArr.filter(x => x.id !== el.id);
    console.log(newArr);
    myViewModel.expenses(newArr);
}

function generateUUID() { 
    // Generate a UUID for database
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}