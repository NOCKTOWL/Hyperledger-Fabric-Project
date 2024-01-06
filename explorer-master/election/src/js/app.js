 const adminAccount = '0x836C9FF80c4C6660F287B17c3A4881c15110973F';
 let check=0;
 let check2=0;
 let check3=0;

App = {
 webProvider: null,
 contracts: {},
 account: '0x0',


 init: function() {
   return App.initWeb();
 },


 initWeb:function() {
   // if an ethereum provider instance is already provided by metamask
   const provider = window.ethereum
   if( provider ){
     // currently window.web3.currentProvider is deprecated for known security issues.
     // Therefore it is recommended to use window.ethereum instance instead
     App.webProvider = provider;
   }
   else{
     $("#loader-msg").html('No metamask ethereum provider found')
     console.log('No Ethereum provider')
     // specify default instance if no web3 instance provided
     App.webProvider = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
   }


   return App.initContract();
 },


 initContract: function() {


   $.getJSON("Election.json", function( election ){
     // instantiate a new truffle contract from the artifict
     App.contracts.Election = TruffleContract( election );


     // connect provider to interact with contract
     App.contracts.Election.setProvider( App.webProvider );


     App.listenForEvents();

    
     return App.render();
   })


 },
 




 render: async function(){
  
   var resultDiv2 = document.getElementById("result-all");
   resultDiv2.innerHTML="";
   var resultDiv3 = document.getElementById("result-count");
   resultDiv3.innerHTML="";
  
   
   
   let electionInstance;
   const loader = $("#loader");
   const content = $("#content");

    
   loader.hide();
   content.show();
  
  
 
  
   
   // load account data
   if (window.ethereum) {
     try {
       // recommended approach to requesting user to connect mmetamask instead of directly getting the accounts
       const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
       App.account = accounts;
       $("#accountAddress").html("Your Account: " + App.account);
       checkAdminAccess();
     } catch (error) {
       if (error.code === 4001) {
         // User rejected request
         console.warn('user rejected')
       }
       $("#accountAddress").html("Your Account: Not Connected");
       console.error(error);
     }
   }


   //load contract ddata
   App.contracts.Election.deployed()
   .then( function( instance ){
     electionInstance = instance;


     return electionInstance.candidatesCount();
   }) 
   .then( function( candidatesCount ){
     var candidatesResults = $("#candidatesResults");
     candidatesResults.empty();
     

     var candidatesSelect = $("#candidatesSelect");
     
     


     for (let i = 1; i <= candidatesCount; i++) {
       electionInstance.candidates( i )
       .then( function( candidate ){
         var id = candidate[0];
         var name = candidate[1];
         var voteCount = candidate[2];
         var candidatename=candidate[3];
         


         //render balloot option
         if(check==0){
         
         let candidateOption = "<option value=" + id +  ">" + name + "</option>"
         if (candidatesSelect.find('option[value="' + id + '"]').length === 0) {
         candidatesSelect.append( candidateOption )};};
         if(i==8){check=1};
        
         
       });
     };
     
     var resultDiv2 = document.getElementById("result-all");
   
      var resultDiv3 = document.getElementById("result-count");
     
     
     missing=[];      
     for (let i = 1; i <= candidatesCount; i++) {
                    electionInstance.candidates(i)
                        .then(function (candidate) {
                            var id = candidate[0];
                            var name = candidate[1];
                            var voteCount = candidate[2];
                            var candidatename = candidate[3];
                            if (!missing.some(entry => entry[0] === String(name))) {
                            missing.push([String(name),parseInt(voteCount)]);};
                            missing.sort((a, b) => b[1] - a[1]);
                            
                            if(i==candidatesCount){
			    var median = (missing[3][1] + missing[4][1]) / 2}else{median=0};
			    
			
                            
                            if(i==8){ if(check2==0){
                            
                            
                            var formattedResult = "";


				for (var k = 0; k < missing.length; k++) {
				    var city = missing[k][0];
				    var count = missing[k][1];

				    
				    formattedResult +=`<h4 style="text-align:center;"> ${city}  <br>  ${count}  </h4>`;
				};
				resultDiv3.innerHTML += formattedResult;
                                resultDiv3.innerHTML += `<div><h4><span>Median:</span> ${median}</h4></div>`;
				check2=1;			    
							    
                            
                            
                           }; };
                            
                               if(check3==0){
                               

                                let personsArray = candidatename.split("&&");
                                personsArray.forEach(personInfo => {
                                    if (personInfo.trim() === "") {
                                        return;
                                    }
                                    let personDetails = personInfo.split("/");
                                    let name = personDetails[0];
                                    let age = personDetails[1];
                                    let height = personDetails[2];
                                    let status = personDetails[3];
                                    let description = personDetails.slice(4, -1).join("/");
                                    let phone = personDetails.slice(-1)[0];
                                   
                                    let htmlContent = `
                                        <div class="card">
                                        
                                            <p>Division: ${candidate[1]}</p>
                                            <p>Name: ${name}</p>
                                            <p>Age: ${age}</p>
                                            <p>Height: ${height}</p>
                                            <p>Status: ${status}</p>
                                            <p>Description: ${description}</p>
                                            <p>Phone: ${phone}</p>
                                        </div>
                                        `;
                                    resultDiv2.innerHTML += htmlContent;
                                   
                                });}; if(i==8){check3=1};
                            
                        });
                };
    
     return electionInstance.voters(  App.account )
   })
   .then( function( hasVoted ){
     // don't allow user to vote
     
     loader.hide();
     content.show();
   })
   .catch( function( error ){
     console.warn('Error:', error);

   });
 },


 // casting vote
 castVote: function(){
 check=0;
 check2=0;
 check3=0;

   
     
    
   let candidateId = $("#candidatesSelect").val();
   let candidatename=$("#name2").val();
   let age=$("#age").val();
   let height=$("#height").val();
   let status=$("#status").val();
   let description=$("#description").val();
   let phone=$("#phone").val();
   
   App.contracts.Election.deployed()
   .then( function( instance ){
     return instance.vote( candidateId,candidatename,age,height,status,description,phone, { from: App.account[0] } )
   })
   .then( function( result ){
     // wait for voters to update vote
     console.log({ result })
       // content.hide();
       // loader.show();
       alert("You have voted successfully")
       
   })
   .catch( function( err ){
     console.error( err )
   } )
 },// voted event
 listenForEvents: function(){
   App.contracts.Election.deployed()
   .then( function( instance ){
     instance.votedEvent({}, {
       fromBlock: 0,
       toBlock: "latests"
     })
     .watch( function( err, event ){
       console.log("Triggered", event);
       // reload page
       
       
       App.render()
     })
   })
 }


};


document.addEventListener("DOMContentLoaded", function () {
    var dropdown = document.getElementById("myDropdown");
    var resultDiv = document.getElementById("result");
    
    dropdown.addEventListener("change", function () {
        var selectedValue = dropdown.value;

        resultDiv.innerHTML = '';

        App.contracts.Election.deployed()
            .then(function (instance) {
                electionInstance = instance;

                return electionInstance.candidatesCount();
            })
            .then(function (candidatesCount) {
                var candidatesResults = $("#candidatesResults");
                candidatesResults.empty();

               
               
     

                for (let i = 1; i <= candidatesCount; i++) {
                    electionInstance.candidates(i)
                        .then(function (candidate) {
                            var id = candidate[0];
                            var name = candidate[1];
                            var voteCount = candidate[2];
                            var candidatename = candidate[3];
                            
                           
                            

                            if (name == selectedValue) {
                           
                                let personsArray = candidatename.split("&&");
                                personsArray.forEach(personInfo => {
                                    if (personInfo.trim() === "") {
                                        return;
                                    }
                                    let personDetails = personInfo.split("/");
                                    let name = personDetails[0];
                                    let age = personDetails[1];
                                    let height = personDetails[2];
                                    let status = personDetails[3];
                                    let description = personDetails.slice(4, -1).join("/");
                                    let phone = personDetails.slice(-1)[0];
                                    let htmlContent = `
                                        <div class="card">
                                            <p>Name: ${name}</p>
                                            <p>Age: ${age}</p>
                                            <p>Height: ${height}</p>
                                            <p>Status: ${status}</p>
                                            <p>Description: ${description}</p>
                                            <p>Phone: ${phone}</p>
                                        </div>
                                        `;
                                    
                                    resultDiv.innerHTML += htmlContent;
                                });
                            }
                        });
                };
                 
            });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    var dropdown = document.getElementById("adminDropdown");
    var resultDiv = document.getElementById("result-admin");
    
    dropdown.addEventListener("change", function () {
        var selectedValue = dropdown.value;

        resultDiv.innerHTML = '';

        App.contracts.Election.deployed()
            .then(function (instance) {
                electionInstance = instance;

                return electionInstance.candidatesCount();
            })
            .then(function (candidatesCount) {
                var candidatesResults = $("#candidatesResults");
                candidatesResults.empty();

               
               
     

                for (let i = 1; i <= candidatesCount; i++) {
                    electionInstance.candidates(i)
                        .then(function (candidate) {
                            var id = candidate[0];
                            var name = candidate[1];
                            var voteCount = candidate[2];
                            var candidatename = candidate[3];
                            
                           
                            

                            if (name == selectedValue) {
                           
                                let personsArray = candidatename.split("&&");
                                c=0;
                                personsArray.forEach(personInfo => {
                                    if (personInfo.trim() === "") {
                                        return;
                                    }
                                    let personDetails = personInfo.split("/");
                                    let name = personDetails[0];
                                    let age = personDetails[1];
                                    let height = personDetails[2];
                                    let status = personDetails[3];
                                    let description = personDetails.slice(4, -1).join("/");
                                    let phone = personDetails.slice(-1)[0];
                                    let htmlContent = `
                                        <div>
                                            <form id="myForm" onsubmit="saveFormData(event)">
					    <label for="name">NAME:</label>
					    <input id="ename" name="name" value="${name}">
					    
					    <label for="age">AGE:</label>
					    <input id="eage" name="age" value="${age}">
					    
					    <label for="height">HEIGHT:</label>
					    <input id="eheight" name="height" value="${height}">
					    
					    <label for="status">STATUS:</label>
					    <select id="estatus" name="status">
						<option value="${status}" disabled selected>${status}</option>
						<option value="Missing">Missing</option>
						<option value="Found">Found</option>
					    </select>
					    
					    <label for="description">DESCRIPTION:</label>
					    <input id="edescription" name="description" value="${description}">
					    
					    <label for="phone">PHONE:</label>
					    <input id="ephone" name="phone" value="${phone}">
					    
					    <input type="hidden" id="c" name="c" value="${c}">
					    <input  type="hidden" id="eid" value="${id}">
					    <button type="submit">SAVE</button>
					</form>

                                        </div>
                                        `;
                                        c=c+1;
                                    
                                    resultDiv.innerHTML += htmlContent;
                                });
                            }
                        });
                };
                 
            });
    });
});


 function saveFormData(event) {
        event.preventDefault(); 

       
        var ename = document.getElementById('ename').value;
        var eage = document.getElementById('eage').value;
        var eheight = document.getElementById('eheight').value;
        var estatus = document.getElementById('estatus').value;
        var edescription = document.getElementById('edescription').value;
        var ephone = document.getElementById('ephone').value;
        var eid = document.getElementById('eid').value;
        var c2=document.getElementById('c').value;
        
        App.contracts.Election.deployed()
            .then(function (instance) {
                electionInstance = instance;

                return electionInstance.candidatesCount();
            })
            .then(function (candidatesCount) {
                var candidatesResults = $("#candidatesResults");
                candidatesResults.empty();
 		for (let i = 1; i <= candidatesCount; i++) {
                    electionInstance.candidates(i)
                        .then(function (candidate) {
                          var id = candidate[0];
                            var candidatename = candidate[3];
                            
                           
                     
 			        if(parseInt(id)==eid){   
                                console.log("FARHAN ")  ;                      
                                let personsArray = candidatename.split("&&");
                                var output="";
                                var c_id=id;
                                var c_name=candidatename;
                                var votecounts=personsArray.length-1;
                                if(estatus=="Found"){votecounts=votecounts-1};


                                c=0
                                personsArray.forEach(personInfo => {
                                    if (personInfo.trim() === "") {
                                        return;
                                    }
                                    let personDetails = personInfo.split("/");
                                    let name = personDetails[0];
                                    let age = personDetails[1];
                                    let height = personDetails[2];
                                    let status = personDetails[3];
                                    let description = personDetails.slice(4, -1).join("/");
                                    let phone = personDetails.slice(-1)[0];
                                    
                                   if(c==c2) {                                		output+=String(ename)+"/"+eage+"/"+eheight+"/"+estatus+"/"+edescription+"/"+ephone+"&&" ;                                
                                   
                                   }else{ output+=String(name)+"/"+age+"/"+height+"/"+status+"/"+description+"/"+phone+"&&" ;   };
                                    
                                  
                                   
                                    
                                    c=c+1;});};

                                    if(i==eid){
                                      App.contracts.Election.deployed()
                                      .then( function( instance ){
                                        return instance.admin( parseInt(c_id),String(c_name),String(output),parseInt(votecounts), { from: adminAccount} )
                                      })
                                      .then( function( result ){
                                        // wait for voters to update vote
                                        console.log({ result })
                                          // content.hide();
                                          // loader.show();
                                          alert("You have voted successfully");
                                          
					window.location.href = "http://localhost:3000";

;                                          
                                      })
                                      .catch( function( err ){
                                        console.error( err )
                                      } )


                                      
                                    };
                                    
                                    
                                    
                                    });};;});};
                                    
    

       
   
function checkAdminAccess() {

    if (App.account == adminAccount.toLowerCase()) {
        $('#adminButton').prop('disabled', false);
    } else {
        $('#adminButton').prop('disabled', true);
    };
    
    
    
    
    
    
};
function reloed(){
window.location.reload();

};
$(function() {
 $(window).load(function() {
   App.init();
 });
});


