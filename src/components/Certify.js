import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import logo from '../logo.png';
import Meme from '../abis/Meme.json';
import Authenticity from '../abis/Authenticity.json';




const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values



class Certify extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }


  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.request({method: 'eth_requestAccounts'});
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
 
  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    console.log("networkId is: "+ networkId)
    const networkData = Meme.networks[networkId]
    if(networkData) {
      // Fetch the contract
      const abi= Meme.abi
      const address = networkData.address
      const contract = web3.eth.Contract(abi,address)
      this.setState({ contract })
      console.log(contract)
      const memeHash = await contract.methods.get().call()
      console.log(memeHash)
      this.setState({memeHash }, () => {
            console.log(this.state.memeHash, 'Hash after');
      }); 
    } else {
     window.alert('Smart contract Meme not deployed to detected network.')
    }

    const networkData2=Authenticity.networks[networkId];
    if(networkData2) {
      // Fetch the contract
      const Authenticity_abi= Authenticity.abi
      this.state2.Authenticity_address = networkData2.address
      this.state2.Authenticity_contract = web3.eth.Contract(Authenticity_abi,this.state2.Authenticity_address);
      console.log(this.state2.Authenticity_contract)
      
    } else {
     window.alert('Smart contract Authenticity not deployed to detected network.')
    }

  }

  constructor(props) {
    super(props);
    this.state = {
      buffer: null,
      memeHash:'QmeesNVWTooMQgqmszfcWhjdd7fvVmGbvVKVGLsThqTqk1',
      contract: null,
      web3: null,
      account: null,
      ethAddress:'0x0BFe599eaE812F3900F2eB77Fb3608fe00E48a25',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: null ,
      hash:'',
      buffer2:null,
      hash2:""
    };

    this.state2={
      Authenticity_contract:"",
      Authenticity_address:"",

      fileHash: "",
      fileSize: "",
      fileExtension:"",
      fileDetails:null,

      hash:"default"

    }
  }

  captureFile = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
      console.log('Ipfs Hash', this.state.memeHash)
      console.log('buffer', Buffer(reader.result) )
    }
  }

  captureFile2 = (event) => {
    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => {
      this.setState({ buffer2: Buffer(reader.result) }) 
    }
  }

  getFileExtension(fileName) {
    return fileName.split('.').pop();
  }

  upload=(event)=>{
      var fileInput = document.getElementById('inputFile');
      var file = fileInput.files[0];

      ipfs.add(this.state.buffer, (error, result) => {

        console.log(this.state.buffer)
        console.log('Ipfs result', result)
        const memeHash = result[0].hash;
        console.log("result[0] is: ", result[0]);
        this.setState({ memeHash }, () => {
          console.log(this.state.memeHash, 'Hash after');


          var fileExtension=this.getFileExtension(file.name);
          var fileSize=file.size;

          var fileHash=this.state.memeHash;
          console.log("var fileHash is: ", this.state.memeHash);
      
          var fileSize1Element=document.getElementById("fileSize1");
          var fileHash1Element=document.getElementById("fileHash1");
          var fileExtension1Element=document.getElementById("fileExtension1");
          
          fileSize1Element.innerHTML=fileSize;
          fileHash1Element.innerHTML=fileHash;
          fileExtension1Element.innerHTML=fileExtension;

      }); 
        
       if(error) {
        console.error(error)
        return
        }});    
     
  }

  


  
  onSubmit =  (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
    
    //obtain contract address from storehash.js
    const ethAddress= this.state.contract.options.address;
    console.log("ethAddress before",ethAddress)
    this.setState({ ethAddress }, () => {
            console.log(this.state.ethAddress, 'ethAddress after');
    }); 
    
    ipfs.add(this.state.buffer, (error, result) => {
        console.log('Ipfs result', result)
        const memeHash = result[0].hash
        console.log('Ipfs Hash (in ipfs add function)', this.state.memeHash)
        this.setState({blockNumber:"waiting.."}, () => {
            console.log(this.state.blockNumber, 'blockNumber 1');
        }); 
        this.setState({gasUsed: "waiting..."}, () => {
            console.log(this.state.gasUsed, 'gasUsed 1');
        }); 
        this.setState({ memeHash }, () => {
            console.log(this.state.memeHash, 'Hash after');
        }); 
       if(error) {
        console.error(error)
        return
        }
        var fileInput = document.getElementById('inputFile');
        var file = fileInput.files[0];

        var fileExtension=this.getFileExtension(file.name);
        var fileSize=file.size;

        var fileHash=this.state.memeHash;

        console.log("Authenticity function is responding: ");
        this.state2.Authenticity_contract.methods.certifyFile(fileSize, fileHash , fileExtension)
        .send({ from: this.state.account })
        .on("receipt", function(receipt) { 
            console.log("receipt contractAddress: ", receipt.contractAddress);
            window.alert("Certify the file successfully onto blockchain!");
        })
        .on('transactionHash', function(transactionHash){
            console.log("TransactionHash for authenticity:  ", transactionHash);
            window.alert("Transaction hash is: "+ transactionHash);
            var txhash=document.getElementById("txhash");
            txhash.innerHTML="Transaction hash is: "+transactionHash;
            txhash.hidden= false;

            var etherscan=document.getElementById("etherscan");
            etherscan.href="https://ropsten.etherscan.io/tx/"+transactionHash;
            etherscan.hidden=false;

            var fileIpfsHash=document.getElementById("fileIpfsHash");

            if(typeof fileIpfsHash !== 'undefined' && fileIpfsHash !== null) {
                fileIpfsHash.innerHTML = fileHash;
            }

        })
        .on("error", function(error) {
            console.log("error: "+ error);
          
       });

    })

  }

  onSubmit2 =  (event) => {

    console.log("this is verify file");

    ipfs.add(this.state.buffer2, (error, result) => {

      if(result){
      console.log('Ipfs result', result)
      const hash2 = result[0].hash

      this.setState({hash2 }, () => {
        console.log(this.state.hash2, 'Hash after');
      }); 
      



      this.state2.Authenticity_contract.methods.verifyFile(this.state.hash2).call().then(function(result) {
        console.log("file details are: " + JSON.stringify(result));
        var fileDetails=JSON.stringify(result);
        var obj=JSON.parse(fileDetails);
  
        var author=document.getElementById("author");
        var fileHash=document.getElementById("fileHash");
        var timestamp=document.getElementById("timestamp");
        var fileSize=document.getElementById("fileSize");
        var fileExtension=document.getElementById("fileExtension");
        var obj0ToStr=parseInt(obj[0]);

        if (obj0ToStr===0){
          window.alert("This file has not been certified before!");
        }
        else{

          window.alert("File verified successfully!");

          var tableElement=document.getElementById("table");
          tableElement.hidden=false;
          author.innerHTML=obj[0];
          fileHash.innerHTML=obj[1];
          timestamp.innerHTML=obj[2]["_hex"];
          fileSize.innerHTML=obj[3]["_hex"];
          fileExtension.innerHTML=obj[4];
        } 
      });}
     if(error) {
      console.error(error)
      return
      }});
  }

    render() {
    return (
      <div className="container-fluid mt-5">
        <p>&nbsp;</p>
        <h1 class="text-center">Start Notarize Now!</h1>
        <p>&nbsp;</p>
        <div class=" layout">
          <aside class="aside">
            <p>&nbsp;</p>
            <h3 class="text-center">Step1: Upload File</h3>
            <form onSubmit={this.onSubmit} id="myform">
            <p>&nbsp;</p>
            <label className="custom-file-upload">
              <input id="inputFile" type="file" onChange={this.captureFile} />
            </label>
            <p>&nbsp;</p>
            <button className="bt-upload" onClick={this.upload} type="button">
              Upload
            </button>
            </form>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>

            <h5 class="text-center">File IPFS Hash: ‼️ </h5>
            <h5 class="text-align:center" className="tx-keep">
              Keep your IPFS hash code safe! Anybody can view your document
              content by holding your IPFS hash code.{" "}
            </h5>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
          </aside>
          <aside class="aside1">
            <p>&nbsp;</p>
            <h3>Step2: Review the metadata</h3>
            <p>&nbsp;</p>
            <table border="1">
              <tr>
                <td>File Size</td>
                <td id="fileSize1"></td>
              </tr>
              <tr>
                <td>File Hash (SHA256 digital signature)</td>
                <td id="fileHash1"></td>
              </tr>
              <tr>
                <td>File Extension</td>
                <td id="fileExtension1"></td>
              </tr>
            </table>
            <p>&nbsp;</p>
            <h6>Do you want to timestamp the metadata into the blockchain?</h6>
            <p>&nbsp;</p>
            <button className="bt-confirm" type="button" onClick={this.onSubmit}>
              Confirm
            </button>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            <p>&nbsp;</p>
            
          </aside>
          
        </div>
      </div>
    );
  }
      
}





export default Certify;
