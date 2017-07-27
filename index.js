var express = require('express');
var app = express();

var Web3 = require('web3');

var fs = require('fs');

var solc = require('solc');

app.set('view engine','pug');

// Initializing Web3
var web3;
if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var primaryAccount = web3.eth.accounts[0];
// Reading Contract
var contractCode = fs.readFileSync('voting.sol').toString();
// Compiling Contract 
var compiledCode = solc.compile(contractCode,1);
// console.log(compiledCode);
var abiDefinition = JSON.parse(compiledCode.contracts[':Voting'].interface);

var votingContract = web3.eth.contract(abiDefinition);

// Voting Process
var performAction = function(err, contract,data){
	if(!err){
		if(!contract.address){
			console.log(contract.transactionHash);
		}else{
			var contractInstance = votingContract.at(contract.address);

			contractInstance.totalVotesFor.call(data.name);
			console.log(web3.eth.accounts[0]+' Voting to '+data.name);
			contractInstance.voteForCandidate('Rama', {from: data.from});

			console.log(contractInstance.totalVotesFor.call(data.name).toLocaleString());
		}
	}
}

var byteCode = compiledCode.contracts[':Voting'].bytecode;


app.get('/', function(req,res,next){
	res.status(200).render('home',{title: 'Home Page', from: primaryAccount, users: ['Rama', 'Nick', 'Jose']});
});

app.get('/vote',function(req,res,next){
	var data = {
		name: req.query('name'),
		from: req.query('from')
	}
	var deployedContract = votingContract.new(['Rama', 'Nick', 'Jose'], {
	data: byteCode,
	from:web3.eth.accounts[0],
	gas: 4700000}, performAction(err, constract, ));

})

app.listen(3000,function(err){
	if(!err)
		console.log("Serving localhost at:"+3000);
	else
		console.log('Error Starting Server'+JSON.parse(err).toString());
});