import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import '../logo.png'
import Meme from '../abis/Meme.json';
import Authenticity from '../abis/Authenticity.json';




const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values



class Vertify extends Component {

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
      
          var metadataElement=document.getElementById("metadata");
          metadataElement.innerHTML="file hash: " + fileHash+ "<br> file extension: " + fileExtension + "<br> file size: "+ fileSize+"<br>" ;  
      }); 
        
       if(error) {
        console.error(error)
        return
        }});    
     
  }

  onSubmit =  (event) => {
    event.preventDefault()
    console.log("Submitting file to ipfs...")
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
            document.getElementById("txdetails").style.visibility = 'visible';
            var txhash=document.getElementById("txhash");
            txhash.innerText="Transaction hash is: "+transactionHash;
            var etherscan=document.getElementById("etherscan");
            etherscan.style.href="https://etherscan.io/tx/"+transactionHash;
        })
        .on("error", function(error) {
            console.log("error: "+error);
          
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
      <div>
        <div className="container-fluid mt-5">
          <h1 class="text-center" id="title">
            Do you want to verify the authenticity of a file?
          </h1>
          <p>&nbsp;</p>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <div>
                  <h3>Upload your file to get the file hash</h3>
                  <p>&nbsp;</p>
                  <form onSubmit={this.onSubmit2} id="myform2">
                    <label className="verify-custom-file-upload">
                      <input
                        id="inputFile2"
                        type="file"
                        onChange={this.captureFile2}
                      />
                    </label>
                    <br />
                    <p>&nbsp;</p>
                    <button
                      type="button"
                      value="submit"
                      className="verify-confirm"
                      onClick={this.onSubmit2}
                    >
                      Confirm
                    </button>
                  </form>
                  <div id="fileDetails">
                    <br />
                    <br />
                    <table id="table" className="verify-table" border="1">
                      <tbody>
                        <tr>
                          <td>Author</td>
                          <td id="author"></td>
                        </tr>

                        <tr>
                          <td>File Hash</td>
                          <td id="fileHash"></td>
                        </tr>

                        <tr>
                          <td>Timestamp</td>
                          <td id="timestamp"></td>
                        </tr>

                        <tr>
                          <td>File Size</td>
                          <td id="fileSize"></td>
                        </tr>

                        <tr>
                          <td>File Extension</td>
                          <td id="fileExtension"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </main>
          </div>
          <p>&nbsp;</p>
          <p>&nbsp;</p>
        </div>
      </div>
    );
  }

}

export default Vertify;
