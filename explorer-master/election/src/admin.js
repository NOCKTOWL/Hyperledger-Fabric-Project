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
   let electionInstance;
   const loader = $("#loader");
   const content = $("#content");

    
   loader.hide();
   content.show();
  
  
   $("#candidatesResults").empty();
    $("#candidatesSelect").empty();
    $("#result-all").empty();
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
     candidatesSelect.empty();
     


     for (let i = 1; i <= candidatesCount; i++) {
       electionInstance.candidates( i )
       .then( function( candidate ){
         var id = candidate[0];
         var name = candidate[1];
         var voteCount = candidate[2];
         var candidatename=candidate[3];
        


         //render balloot option
         let candidateOption = "<option value=" + id +  ">" + name + "</option>"
         candidatesSelect.append( candidateOption )
         
        
         
       });
     };
     
     var resultDiv2 = document.getElementById("result-all");
     resultDiv2.innerHTML = '';
      var resultDiv3 = document.getElementById("result-count");
      resultDiv3.innerHTML = '';
     missing=[];      
     for (let i = 1; i <= candidatesCount; i++) {
                    electionInstance.candidates(i)
                        .then(function (candidate) {
                            var id = candidate[0];
                            var name = candidate[1];
                            var voteCount = candidate[2];
                            var candidatename = candidate[3];
                            missing.push([String(name),parseInt(voteCount)]);
                            missing.sort((a, b) => b[1] - a[1]);
                            
                            if(i==candidatesCount){
			    var median = (missing[3][1] + missing[4][1]) / 2}else{median=0};
			    
			
                            
                            if(i==8){
                            
                            var formattedResult = "";


				for (var k = 0; k < missing.length; k++) {
				    var city = missing[k][0];
				    var count = missing[k][1];

				    
				    formattedResult += city + " : " + count + `<br>`;
				};
				resultDiv3.innerHTML += formattedResult;
                                resultDiv3.innerHTML += `<h3>Median : ${median}</h3>`;
							    
							    
                            
                            
                            };
                            

                      
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
                                        <div>
                                        
                                            <p>Division: ${candidate[1]}</p>
                                            <p>Name: ${name}</p>
                                            <p>Age: ${age}</p>
                                            <p>Height: ${height}</p>
                                            <p>Status: ${status}</p>
                                            <p>Description: ${description}</p>
                                            <p>Phone: ${phone}</p>
                                        </div>
                                        <hr> `;
                                    resultDiv2.innerHTML += htmlContent;
                                });
                            
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
                                        <div>
                                            <p>Name: ${name}</p>
                                            <p>Age: ${age}</p>
                                            <p>Height: ${height}</p>
                                            <p>Status: ${status}</p>
                                            <p>Description: ${description}</p>
                                            <p>Phone: ${phone}</p>
                                        </div>
                                        <hr> `;
                                    resultDiv.innerHTML += htmlContent;
                                });
                            }
                        });
                };
                 
            });
    });
});
function checkAdminAccess() {
    const adminAccount = '0x4d07b723004ba11da17b087cfa6807713f8b7490'; 

    if (App.account && App.account[0] === adminAccount) {
        $('#adminButton').prop('disabled', false);
    } else {
        $('#adminButton').prop('disabled', true);
    }
};

$(function() {
 $(window).load(function() {
   App.init();
 });
});

