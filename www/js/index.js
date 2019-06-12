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

class MyArray extends Array {
    sortBy(...args) {
        return this.sort(dynamicSortMultiple.apply(null, args));
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
    takePicture : function() {       
        this.personName('David');
        takePhotograph();
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
        alert('Failed because: ' + message);
    }
}
function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    return options;
}

function readPhotograph(){

    const img = myViewModel.imagePath();
    let tempLine = [];
    let tempElement = []
 
    MlKitPlugin.getText(img,{},function onSuccess(data) {
        // var image = document.getElementById('myImage');        
         console.log(data)

         for (var block of data.textBlocks){
             for (var line of block.lines){
                 tempLine.push(line)                
             }
         }

         console.log("--------------------")
         console.log(tempLine)
         console.log("--------------------")
         myViewModel.resultMsg(data.text);

         //myViewModel.resultArr(tempLine)
         sortArray(tempLine);


     },
     
     function onFail(err) {
         console.log(err)
     });    
}

function sortArray(myA){
    //let myA = []
   // myA =  myViewModel.resultArr()

    //console.log(myA);
    //myA.sort(dynamicSort("boundingBox.bottom"));
    myA.sort(dynamicSort("text"));
  // MyArray.from(myA).sortBy("text");
   console.log(myA)
   myViewModel.resultArr(myA)


}
function dynamicSortMultiple() {
    /*
     * save the arguments object as it will be overwritten
     * note that arguments object is an array-like object
     * consisting of the names of the properties to sort by
     */
    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while(result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}
function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function setUpExpense (){
    myViewModel.expenses([]);
    // myViewModel.expenses.push({
    //     id:0,
    //     shop:"Dunnes",
    //     whenPurchased:"10-06-2019",
    //     desc:"food",
    //     total: 2.99
    // });
    // myViewModel.expenses.push({
    //     id:1,
    //     shop:"Aldi",
    //     whenPurchased:"10-06-2019",
    //     desc:"Bread",
    //     total: 1.99
    // });
    // $( "#expenseset" ).collapsibleset( "refresh" );
    

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
       
               
        //$( "#inputset" ).children().collapsible("collapse");
      //  $( "#expenseset" ).children().collapsible("collapse");
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

function generateUUID() { // Public Domain/MIT
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



