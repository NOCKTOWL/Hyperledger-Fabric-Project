// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract Election {


   // model a candidate
   event votedEvent( uint indexed _candidateId );
   struct Candidate {
       uint id;
       string name;
       uint voteCount;
       string candidatename;
       string age;
       string height;
       string status;
       string description;
       string phone;
   }
   // Store accounts that have voted
   mapping( address => bool ) public voters;


   // Read/write candidates
   mapping( uint => Candidate ) public candidates;

   mapping(address => string) public votername;
   mapping(address => string) public voterage;
   mapping(address => string) public voterheight;
   mapping(address => string) public voterstatus;
   mapping(address => string) public voterdescription;
   mapping(address => string) public voterphone;
 
   

   // store candidates count
   uint public candidatesCount;


   // Constructor
   constructor() {
       addCandidate( "DHAKA" );
       addCandidate( "CHITTAGONG" );
       addCandidate( "BARISAL" );
       addCandidate( "KHULNA" );
       addCandidate( "RAJSHAHI" );
       addCandidate( "SYLHET" );
       addCandidate( "RONGPUR" );
       addCandidate( "MYMENSINGH" );
   }


   // adding candidates
   function addCandidate( string memory _name ) private {
       candidatesCount++;
       candidates[ candidatesCount ] = Candidate( candidatesCount, _name, 0 , "","","","","","");
   }


   // cast vote
   function vote( uint _candidateId, string memory _candidatename,string memory _age,string memory _height,string memory _status,string memory _description,string memory _phone) public {
       // require that the current voter haven't voted before
       //require( !voters[ msg.sender ]);


       // candidate should be valid
       require( _candidateId > 0 && _candidateId <= candidatesCount );
       
       //string memory candidatename = candidates[_candidateId].candidatename;


       // record voters vote
       voters[ msg.sender ] = true;
       votername[ msg.sender ] =_candidatename;
       voterage[ msg.sender ] =_age;
       voterheight[ msg.sender ] =_height;
       voterstatus[ msg.sender ] =_status;
       voterdescription[ msg.sender ] =_description;
       voterphone[ msg.sender ] =_phone;

       


       // update candidates vote count
       candidates[ _candidateId ].voteCount++;
       candidates[_candidateId].candidatename = string(abi.encodePacked(candidates[_candidateId].candidatename,
       _candidatename,"/",_age,"/",_height,"/",_status,"/",_description,"/",_phone,"&&"));

             /// emit the event
	emit votedEvent( _candidateId ); }
	
	
	
	
	
function admin( uint _candidateId, string memory _candidatename,string memory _output,uint  _votecounts) public {
       // require that the current voter haven't voted before
       //require( !voters[ msg.sender ]);


       // candidate should be valid
       require( _candidateId > 0 && _candidateId <= candidatesCount );
       
       //string memory candidatename = candidates[_candidateId].candidatename;


       // record voters vote
       voters[ msg.sender ] = true;
       votername[ msg.sender ] =_candidatename;
       voterage[ msg.sender ] =_output;
     

       

       // update candidates vote count
       candidates[ _candidateId ].voteCount=_votecounts;
       candidates[_candidateId].candidatename = string(_output);

             /// emit the event
	emit votedEvent( _candidateId ); }
	
	
	
              
}
