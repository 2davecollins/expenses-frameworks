
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    
    onDeviceReady: function() {
       // this.receivedEvent('deviceready');
       console.log("Device is Ready ....")
        
       ko.applyBindings(myViewModel);
       setUpExpense ()

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
    removeExpense : function(el){
        console.log(el);
        removeSomeExpense(el)       
       
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
    }
};

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
    

    //navigator.getText(img, options, success, error)

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

         myViewModel.resultArr(tempLine)


     },
     
     function onFail(err) {
         console.log(err)
     });

    
}
function setUpExpense (){
    myViewModel.expenses.push({
        id:0,
        shop:"Dunnes",
        whenPurchased:"10-06-2019",
        desc:"food",
        total: 2.99
    });
    myViewModel.expenses.push({
        id:1,
        shop:"Aldi",
        whenPurchased:"10-06-2019",
        desc:"Bread",
        total: 1.99
    });
    $( "#expenseset" ).collapsibleset( "refresh" );
    

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
    myViewModel.expenses.push(exp)     
    $( "#expenseset" ).collapsibleset( "refresh" );
    $( "#inputset" ).collapsibleset( "refresh" );

    setTimeout(function(){
        myViewModel.resetExpenseIP();
        $( "#inputset" ).collapsibleset( "refresh" );

    },1000);
   
};

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

class Expense {
    constructor(obj) {
        this.id = obj.id;
        this.shop = obj.shop;
        this.desc = obj.desc;
        this.whenPurchased = obj.whenPurchased;
        this.total = obj.total;
    }
    get expenseDiv() {
        return this.generateExpense();
    }
    generateExpense() {
        const price = average(this.total).toFixed(2);
        const markup = `       
        
            <div class="card-panel teal">
                <h6 class="card-title white-text">${this.city}</h6>
                <p class="white-text"><span>${this.day}</span><span class="floatright">wind ${ws}m/s</span></p>               
                <div class="row">                   
                    <div class="col s2"><img src="http://openweathermap.org/img/w/${this.icons[0]}.png" alt="Smiley face"></div>
                    <div class="col s2"><img src="http://openweathermap.org/img/w/${this.icons[1]}.png" alt="Smiley face"></div>
                    <div class="col s2"><img src="http://openweathermap.org/img/w/${this.icons[2]}.png" alt="Smiley face"></div>
                    <div class="col s2"><img src="http://openweathermap.org/img/w/${this.icons[3]}.png" alt="Smiley face"></div>
                    <div class="col s2"><img src="http://openweathermap.org/img/w/${this.icons[4]}.png" alt="Smiley face"></div>                   
                 </div>              
                <div id=${this.chartdiv} style="height: 200px; width: 100%;"></div>                 
            </div>       
        `;
        const card = document.createElement("div");
        card.className = "col s12 m6";
        card.innerHTML = markup;
        return card;
    }
}  

